#!/usr/bin/env bash
#
# freeze-tests.sh — Congela los tests antes de despachar y verifica después.
#
# Uso:
#   ./scripts/freeze-tests.sh seal   <proyecto>   # antes de despachar
#   ./scripts/freeze-tests.sh verify <proyecto>   # después de despachar
#
# Por qué existe:
#   Los Coder editan los tests. Se les dice que no lo hagan; lo hacen igual.
#   Las instrucciones reducen la frecuencia del fallo, no lo eliminan.
#   Este script lo hace DETECTABLE: si el hash cambió, la corrida es inválida.
#
# Salida 0 = tests intactos. Salida 1 = tests modificados (corrida inválida).

set -uo pipefail

MODE="${1:-}"
PROJECT_DIR="${2:-}"
[ -z "$MODE" ] || [ -z "$PROJECT_DIR" ] && {
  echo "uso: freeze-tests.sh {seal|verify} <proyecto>" >&2; exit 1
}
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
SEAL="$PROJECT_DIR/.tmp/.tests-seal"

hash_tests() {
  # Hash estable de todo el contenido de tests/ (archivos ordenados).
  cd "$PROJECT_DIR" || exit 1
  find tests -type f -name '*.mjs' 2>/dev/null | LC_ALL=C sort | while read -r f; do
    printf '%s  ' "$f"
    shasum -a 256 "$f" | awk '{print $1}'
  done
}

case "$MODE" in
  seal)
    [ -d "$PROJECT_DIR/tests" ] || { echo "No hay tests/ en $PROJECT_DIR" >&2; exit 1; }
    mkdir -p "$PROJECT_DIR/.tmp"
    hash_tests > "$SEAL"
    echo "🔒 Tests congelados: $(wc -l < "$SEAL" | tr -d ' ') archivos"
    echo "   sello: $SEAL"
    echo
    echo "   IMPORTANTE — verifica que la suite sea VÁLIDAMENTE ROJA antes de"
    echo "   despachar: debe fallar porque FALTA LA IMPLEMENTACIÓN, no porque el"
    echo "   test tenga un bug. Una suite rota produce evidencia RED sin sentido."
    ;;

  verify)
    [ -f "$SEAL" ] || { echo "No hay sello. Corre 'seal' antes de despachar." >&2; exit 1; }
    # El temporal va DENTRO del proyecto, no en el temp del sistema: es la misma
    # regla que le exigimos al Coder. El sandbox rechaza rutas externas, y un
    # script que predica una regla y la viola enseña la regla equivocada.
    CURRENT="$PROJECT_DIR/.tmp/.tests-current"
    hash_tests > "$CURRENT"

    if diff -q "$SEAL" "$CURRENT" >/dev/null 2>&1; then
      echo "✅ Tests INTACTOS — el Coder implementó contra el contrato."
      rm -f "$CURRENT"
      exit 0
    fi

    echo "❌ Tests MODIFICADOS desde el despacho — corrida INVÁLIDA."
    echo
    echo "Cambios:"
    diff "$SEAL" "$CURRENT" | grep -E '^[<>]' | sed 's/^/   /' || true
    echo
    echo "   El Coder tocó el contrato. Aunque el cambio parezca razonable (bugs"
    echo "   del test, imports faltantes), NO se puede distinguir un arreglo de una"
    echo "   aserción debilitada sin revisar. El trabajo NO se acepta así."
    echo
    echo "   Qué hacer: revisar el diff de tests/ y decidir."
    echo "   - Si son bugs legítimos: arreglarlos en el lado del diseño, RE-SELLAR,"
    echo "     y volver a despachar."
    echo "   - Si debilitan aserciones: descartar la corrida."
    rm -f "$CURRENT"
    exit 1
    ;;
  *)
    echo "uso: freeze-tests.sh {seal|verify} <proyecto>" >&2; exit 1 ;;
esac
