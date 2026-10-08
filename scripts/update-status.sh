#!/usr/bin/env bash
#
# update-status.sh — Refresca el tablero y lo publica.
#
# Uso:
#   ./scripts/update-status.sh <ruta-del-proyecto> [--push]
#
# Hace: render-status.mjs → progreso.html → (opcional) commit + push.
# Pensado para correrlo tras cada hito, mientras el Coder avanza.
#
# Requiere: repo PÚBLICO para que Pages publique (en privado con plan free, 422).

set -uo pipefail

PROJECT_DIR="${1:-}"
PUSH=0
[ "${2:-}" = "--push" ] && PUSH=1

[ -z "$PROJECT_DIR" ] && { echo "uso: update-status.sh <ruta-del-proyecto> [--push]" >&2; exit 1; }
PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -f "$PROJECT_DIR/docs/estado.json" ] || {
  echo "Falta $PROJECT_DIR/docs/estado.json — el estado vive ahí, no en el HTML." >&2
  exit 1
}

node "$SCRIPT_DIR/render-status.mjs" "$PROJECT_DIR" || exit 1

if [ "$PUSH" -eq 1 ]; then
  cd "$PROJECT_DIR"
  BRANCH="$(git rev-parse --abbrev-ref HEAD)"

  # El tablero y el estado van SIEMPRE a `main` (v0.24).
  #
  # Por qué: GitHub Pages publica desde `main`. Commitear el tablero en la rama del
  # ciclo (`ciclo/1`) lo deja commiteado donde nadie lo sirve — el tablero público se
  # congela justo mientras el ciclo avanza, que es cuando se lo mira. Pasó: el tablero
  # local decía 1/8 y el publicado 0/8, sin ningún error.
  #
  # Y no alcanza con "commitear a main": cambiar de rama con el árbol sucio pone en
  # riesgo la rama del ciclo, y el estado quedaría escrito donde el Coder trabaja.
  # Se publica desde un WORKTREE de main, y la rama del ciclo queda intacta.
  if [ "$BRANCH" != "main" ]; then
    WT="$PROJECT_DIR/.tmp/.board-main"
    rm -rf "$WT"
    # La base es ORIGIN/main, no el ref local: el local puede estar atrasado y
    # entonces el commit del worktree nace desactualizado y el push se rechaza
    # (non-fast-forward) — el tablero se queda viejo y el fallo parece un éxito.
    git fetch -q origin main 2>/dev/null || true
    if ! git worktree add --detach "$WT" origin/main >/dev/null 2>&1; then
      echo "No pude preparar un worktree de origin/main para publicar el tablero." >&2
      exit 1
    fi
    # El ESTADO pendiente viaja a main; el render se hace ALLÍ, para que lo publicado
    # corresponda al estado que se commitea (y no al de la rama del ciclo).
    cp docs/estado.json "$WT/docs/estado.json"
    [ -f docs/historial.json ] && cp docs/historial.json "$WT/docs/historial.json"
    node "$SCRIPT_DIR/render-status.mjs" "$WT" || { rm -rf "$WT"; exit 1; }
    (
      cd "$WT" &&
      git add -A &&
      git -c user.name="Christian Bobadilla" \
          -c user.email="cabobadilla@users.noreply.github.com" \
          commit -q -m "tablero: actualizar avance" &&
      git push -q origin HEAD:main
    ) || { rm -rf "$WT"; git worktree prune >/dev/null 2>&1; exit 1; }
    rm -rf "$WT"; git worktree prune >/dev/null 2>&1
    # El push actualizó ORIGIN/main, no el ref local `main` — que sigue viejo.
    # Sin esto, el `checkout main --` de abajo traería la versión VIEJA y dejaría el
    # árbol en desacuerdo con lo publicado (el mismo tipo de fallo silencioso).
    git fetch -q origin +main:main 2>/dev/null \
      || git fetch -q origin main 2>/dev/null || true
    # La rama del ciclo NO lleva el tablero ni el estado: se alinean con main.
    # `git checkout -- <path>` traería la versión de la RAMA (la vieja) y la
    # divergencia volvería; hay que traer la de main, que es la que se acaba de
    # escribir. Así el árbol y main quedan iguales, y el merge no conflictúa.
    git checkout main -- progreso.html docs/estado.json docs/historial.json 2>/dev/null \
      || { git checkout -- progreso.html 2>/dev/null || true; }
    echo "  (publicado desde main; $BRANCH quedó alineada con main)"
  else
    git add progreso.html docs/estado.json docs/historial.json 2>/dev/null
    if git diff --cached --quiet; then
      echo "  (sin cambios que publicar)"
    else
      git -c user.name="Christian Bobadilla" \
          -c user.email="cabobadilla@users.noreply.github.com" \
          commit -q -m "tablero: actualizar avance"
      git push -q 2>&1 | tail -1
    fi
  fi

  REMOTE="$(git config --get remote.origin.url || true)"
  case "$REMOTE" in
    *github.com[:/]*)
      SLUG="$(printf '%s' "$REMOTE" | sed -E 's#.*github\.com[:/]##; s#\.git$##')"
      OWNER="${SLUG%%/*}"; REPO="${SLUG##*/}"
      echo "  publicado: https://${OWNER}.github.io/${REPO}/progreso.html"
      ;;
  esac
fi
