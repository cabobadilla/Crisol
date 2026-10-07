#!/usr/bin/env bash
#
# preflight-model.sh — Verifica disponibilidad REAL de los modelos antes de despachar.
#
# Uso:
#   ./scripts/preflight-model.sh <nivel>        # N1..N5 → devuelve el primer modelo vivo
#   ./scripts/preflight-model.sh --all          # smoke-test de todos los candidatos
#   ./scripts/preflight-model.sh --json <nivel> # salida máquina-legible
#
# Por qué existe:
#   Los modelos free NO siempre están disponibles — desaparecen sin aviso.
#   Despachar contra un modelo caído hace que el agente quede colgado minutos
#   antes de fallar, y el trabajo se pierde. Esto se verifica ANTES de despachar.
#
# Salida: el nombre del modelo vivo, o exit 1 si ninguno del nivel responde.
#
# NOTA: escrito para bash 3.2 (el que trae macOS). Sin `declare -A`, sin `mapfile`.

set -uo pipefail

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT="${AGENT:-opencode}"
SMOKE_TIMEOUT="${SMOKE_TIMEOUT:-120}"

# macOS no trae `timeout`; si existe lo usamos, si no, corre directo.
TIMEOUT_BIN="$(command -v timeout || command -v gtimeout || true)"
run_with_timeout() {
  if [ -n "$TIMEOUT_BIN" ]; then "$TIMEOUT_BIN" "$SMOKE_TIMEOUT" "$@"; else "$@"; fi
}

# Candidatos por nivel, en orden de preferencia (de MODEL-ROUTING.md).
# Se usa `case` en vez de arrays asociativos: bash 3.2 no los soporta.
get_candidates() {
  case "$1" in
    N1) echo "opencode/ling-3.1-flash-free opencode/nemotron-3.5-lightning-free" ;;
    N2) echo "opencode/space-bunny-free opencode/longcat-2.5-preview-free opencode/ling-3.1-flash-free" ;;
    N3) echo "opencode/big-pickle opencode/space-bunny-free opencode/nemotron-3-ultra-free" ;;
    N4) echo "opencode/nemotron-3-ultra-free opencode/space-bunny-free opencode/big-pickle" ;;
    N5) echo "opencode-go/deepseek-v4.1-flash opencode-go/glm-5.3-flash" ;;
    *)  echo "" ;;
  esac
}

ALL_MODELS="opencode/ling-3.1-flash-free
opencode/nemotron-3.5-lightning-free
opencode/space-bunny-free
opencode/longcat-2.5-preview-free
opencode/big-pickle
opencode/nemotron-3-ultra-free
opencode/fledge-alpha-free
opencode/mimo-v2.6-flash-free
opencode-go/deepseek-v4.1-flash
opencode-go/glm-5.3-flash"

command -v "$AGENT" >/dev/null 2>&1 || { echo "FALTA: $AGENT no está en PATH" >&2; exit 1; }

# La lista de modelos depende de las credenciales, no solo del binario.
AVAILABLE="$("$AGENT" models 2>/dev/null || true)"

in_catalog() {
  printf '%s\n' "$AVAILABLE" | grep -qx "$1"
}

smoke() {
  # 0 si el modelo responde. Nunca imprime el output completo.
  out="$(run_with_timeout "$AGENT" run --model "$1" \
        'Respond with exactly: SMOKE_OK' 2>&1 | tail -5)"
  case "$out" in
    *SMOKE_OK*) return 0 ;;
    *) printf '    detalle: %s\n' "$(printf '%s' "$out" | tr '\n' ' ' | cut -c1-160)" >&2; return 1 ;;
  esac
}

check_model() {
  if ! in_catalog "$1"; then
    echo "  ✗ $1 — NO está en el catálogo (¿credencial faltante?)"
    return 1
  fi
  if smoke "$1"; then
    echo "  ✓ $1 — responde"
    return 0
  fi
  echo "  ✗ $1 — NO responde"
  return 1
}

MODE="${1:-N3}"

if [ "$MODE" = "--all" ]; then
  echo "→ Catálogo de $AGENT: $(printf '%s\n' "$AVAILABLE" | grep -c .) modelos"
  echo
  echo "→ Smoke-test de candidatos:"
  OLD_IFS="$IFS"; IFS='
'
  for m in $ALL_MODELS; do check_model "$m"; done
  IFS="$OLD_IFS"
  exit 0
fi

JSON=0
if [ "$MODE" = "--json" ]; then
  JSON=1
  MODE="${2:-N3}"
fi

CANDIDATES="$(get_candidates "$MODE")"
if [ -z "$CANDIDATES" ]; then
  echo "Nivel desconocido: $MODE (usa N1..N5)" >&2
  exit 1
fi

[ "$JSON" -eq 1 ] || echo "→ Preflight nivel $MODE"

for m in $CANDIDATES; do
  if check_model "$m"; then
    if [ "$JSON" -eq 1 ]; then
      printf '{"level":"%s","model":"%s","available":true}\n' "$MODE" "$m"
    else
      echo
      echo "✅ USAR: $m"
      echo "   despachar con: $AGENT run --model $m '...'"
    fi
    exit 0
  fi
done

echo
echo "❌ Ningún modelo del nivel $MODE responde."
echo "   Siguiente paso: subir un nivel, o probar './scripts/preflight-model.sh --all'"
exit 1
