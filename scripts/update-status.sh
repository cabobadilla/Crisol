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
  git add progreso.html docs/estado.json
  if git diff --cached --quiet; then
    echo "  (sin cambios que publicar)"
  else
    git -c user.name="Christian Bobadilla" \
        -c user.email="cabobadilla@users.noreply.github.com" \
        commit -q -m "tablero: actualizar avance"
    git push -q 2>&1 | tail -1
    REMOTE="$(git config --get remote.origin.url || true)"
    case "$REMOTE" in
      *github.com[:/]*)
        SLUG="$(printf '%s' "$REMOTE" | sed -E 's#.*github\.com[:/]##; s#\.git$##')"
        OWNER="${SLUG%%/*}"; REPO="${SLUG##*/}"
        echo "  publicado: https://${OWNER}.github.io/${REPO}/progreso.html"
        ;;
    esac
  fi
fi
