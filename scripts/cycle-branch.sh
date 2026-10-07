#!/usr/bin/env bash
#
# cycle-branch.sh — Aísla cada ciclo en su rama. El Coder nunca toca main.
#
# Uso:
#   ./scripts/cycle-branch.sh start <proyecto> <n>      # crea ciclo/<n> desde main
#   ./scripts/cycle-branch.sh check <proyecto> <n>      # verifica antes de integrar
#   ./scripts/cycle-branch.sh merge <proyecto> <n>      # integra a main y re-verifica
#   ./scripts/cycle-branch.sh status <proyecto>
#
# Por qué existe:
#   El Coder trabajaba DIRECTO sobre main. Y main es lo que GitHub Pages publica:
#   una corrida mala rompía el sitio que ya funcionaba, y no había forma de
#   descartarla — el trabajo sucio ya estaba mezclado con lo bueno.
#
#   Con rama por ciclo:
#     - main queda siempre en el último estado VERIFICADO.
#     - una corrida mala se descarta con un `git branch -D`, sin cirugía.
#     - el merge es el punto de control real: no entra nada sin tests verdes.
#
# Regla: el Coder trabaja en ciclo/<n>. Solo Hermes integra a main, y solo
#        después de verificar en la rama Y de re-verificar en main.

set -uo pipefail

MODE="${1:-}"; PROJECT="${2:-}"; N="${3:-}"
[ -z "$MODE" ] || [ -z "$PROJECT" ] && {
  echo "uso: cycle-branch.sh {start|check|merge|status} <proyecto> [n]" >&2; exit 1
}
# Resolver el directorio de los scripts a ABSOLUTO antes de cualquier `cd`:
# si se invoca como `scripts/cycle-branch.sh`, BASH_SOURCE[0] es relativo y al
# hacer `cd "$PROJECT"` la ruta a freeze-tests.sh se resuelve DENTRO del
# proyecto — donde no existe. El script diría "el Coder tocó el contrato" sin
# que nadie lo tocara.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT="$(cd "$PROJECT" && pwd)"
cd "$PROJECT" || exit 1

BRANCH="ciclo/${N}"
BASE="${BASE:-main}"
GIT_ID=(-c user.name="Christian Bobadilla" -c user.email="cabobadilla@users.noreply.github.com")

require_n() { [ -z "$N" ] && { echo "falta el número de ciclo" >&2; exit 1; }; }

tests_pass() {
  local out status pass fail
  # `env -u NODE_TEST_CONTEXT` es OBLIGATORIO: si estas guardias corren a su vez
  # dentro de un proceso `node --test`, la variable se hereda, el runner anidado
  # cambia de modo y devuelve **código 0 y salida vacía AUNQUE LOS TESTS FALLEN**.
  # Sería un FALSO VERDE — exactamente el fallo que este harness existe para
  # impedir. El veredicto de una guardia no puede depender del entorno que la llama.
  out="$(env -u NODE_TEST_CONTEXT node --test tests/ 2>&1)"; status=$?

  # Los conteos son solo para MOSTRAR: el formato del reporter puede variar.
  # La autoridad es el CÓDIGO DE SALIDA.
  pass="$(printf '%s' "$out" | grep -E '^ℹ pass' | grep -oE '[0-9]+' | head -1)"
  fail="$(printf '%s' "$out" | grep -E '^ℹ fail' | grep -oE '[0-9]+' | head -1)"
  echo "   tests: pass=${pass:-?} fail=${fail:-?}"

  [ "$status" -eq 0 ] || return 1
  # Si además se pudo leer el conteo, exigir que sea 0 fallos.
  [ -z "${fail:-}" ] || [ "$fail" = "0" ]
}

case "$MODE" in
  start)
    require_n
    if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
      echo "⚠ la rama $BRANCH ya existe." >&2; exit 1
    fi
    git checkout -q "$BASE" || exit 1
    git pull -q --ff-only 2>/dev/null || true
    git checkout -q -b "$BRANCH" || exit 1
    git push -q -u origin "$BRANCH" 2>&1 | tail -1
    echo "🌿 Rama creada: $BRANCH (desde $BASE)"
    echo "   El Coder trabaja ACÁ. main no se toca hasta el merge."
    echo "   Recuerda: sellar los tests antes de despachar."
    ;;

  check)
    require_n
    echo "🔍 Verificando $BRANCH antes de integrar"
    git checkout -q "$BRANCH" || exit 1
    LOCAL="$(git rev-parse --abbrev-ref HEAD)"
    [ "$LOCAL" = "$BRANCH" ] || { echo "no se pudo cambiar a $BRANCH" >&2; exit 1; }

    echo "1. tests en la rama:"
    if ! tests_pass; then
      echo "   ✗ la rama NO pasa los tests. No se integra."
      exit 1
    fi
    echo "   ✓ verdes"

    echo "2. integridad de los tests:"
    if bash "$SCRIPT_DIR/freeze-tests.sh" verify "$PROJECT" 2>&1 | grep -q INTACTOS; then
      echo "   ✓ intactos"
    else
      echo "   ✗ el Coder tocó el contrato. No se integra."
      exit 1
    fi

    echo "3. archivos que el Coder cambió respecto de $BASE:"
    git diff --stat "$BASE..$BRANCH" | sed 's/^/   /'
    echo
    echo "✅ $BRANCH lista para integrar. Siguiente: cycle-branch.sh merge <proyecto> $N"
    ;;

  merge)
    require_n
    bash "$SCRIPT_DIR/cycle-branch.sh" check "$PROJECT" "$N" || exit 1
    echo
    echo "🔀 Integrando $BRANCH → $BASE"
    git checkout -q "$BASE" || exit 1
    git merge -q --no-ff "$BRANCH" -m "Ciclo $N integrado: verificado en rama y re-verificado en $BASE" \
      || { echo "✗ conflicto de merge. Resolver a mano." >&2; exit 1; }

    echo "1. RE-verificando en $BASE (el merge puede cambiar el comportamiento):"
    if ! tests_pass; then
      echo "   ✗ $BASE quedó roto tras el merge. Revirtiendo."
      git reset -q --hard HEAD~1
      echo "   $BASE restaurado al estado anterior."
      exit 1
    fi
    echo "   ✓ verdes en $BASE"

    git push -q origin "$BASE" 2>&1 | tail -1
    echo
    echo "✅ Ciclo $N integrado a $BASE y publicado."
    echo "   La rama $BRANCH queda como registro. Borrarla: git branch -D $BRANCH"
    ;;

  status)
    echo "rama actual : $(git rev-parse --abbrev-ref HEAD)"
    echo "ramas ciclo :"; git branch --list 'ciclo/*' | sed 's/^/   /'
    echo "$BASE vs ciclo:"
    git log --oneline -1 "$BASE" | sed 's/^/   main: /'
    ;;

  *) echo "uso: cycle-branch.sh {start|check|merge|status} <proyecto> [n]" >&2; exit 1 ;;
esac
