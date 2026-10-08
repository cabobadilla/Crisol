#!/usr/bin/env bash
#
# smoke.sh — Verificación contra la URL REAL. Lo corre Hermes, no el Coder (ADR-004).
#
# La suite completa corre en local sobre el archivo (ADR-003). Este smoke NO la
# reemplaza: verifica que lo PUBLICADO sea lo CONSTRUIDO.
#
# Uso:  bash scripts/smoke.sh https://crisol-ciclo-1.mkvs.workers.dev
#
# HISTORIAL — por qué está escrito así:
#   La v1 fallaba sobre un deploy CORRECTO. Tres errores propios:
#     · esperaba colores y tokens que NO existen en docs/DISENO-PIZARRA.md
#       (los tenía escritos de memoria, y mi memoria estaba mal);
#     · el check de "no público" comparaba el texto "no-200" contra el código real
#       ("404") → nunca coincidía → FALLABA SIEMPRE;
#     · no hacía la comprobación central de C-56 (el hash).
#   Regla que queda: **los valores esperados se LEEN DEL DISEÑO**, no se recuerdan.
#   Un verificador con los valores hardcodeados se desincroniza y miente.
#
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DISENO="$REPO/docs/DISENO-PIZARRA.md"

URL="${1:-}"
if [ -z "$URL" ]; then
  echo "Uso: bash scripts/smoke.sh <url>" >&2
  exit 2
fi
URL="${URL%/}"
fallas=0
ok=0

check() { # check <descripcion> <esperado> <obtenido>
  if [ "$2" = "$3" ]; then
    echo "  ✓ $1"
    ok=$((ok + 1))
  else
    echo "  ✗ $1 — esperado [$2], obtenido [$3]"
    fallas=$((fallas + 1))
  fi
}

# Un token del diseño, por nombre. Los valores NO se hardcodean acá.
token() { # token <nombre>  →  #rrggbb
  grep -oE -- "--$1: *#[0-9a-fA-F]{6}" "$DISENO" 2>/dev/null \
    | head -1 | grep -oE '#[0-9a-fA-F]{6}'
}

echo "→ Smoke contra $URL"
echo

# ── 1 · La app responde ───────────────────────────────────────────────────────
code=$(curl -s -o /tmp/smoke.html -w '%{http_code}' "$URL/")
check "la raíz responde 200" "200" "$code"

# ── 2 · Es Crisol y no una página de error ────────────────────────────────────
titulo=$(grep -o '<title>[^<]*</title>' /tmp/smoke.html 2>/dev/null | head -1)
case "$titulo" in
  *risol*) check "el título menciona Crisol" "si" "si" ;;
  *)       check "el título menciona Crisol" "si" "no (${titulo:-sin título})" ;;
esac

# ── 3 · El wizard llegó completo, con sus 7 pasos ─────────────────────────────
faltan=""
for n in Idea Problema Valor Referencias Alcance Criterio Challenge; do
  grep -q "$n" /tmp/smoke.html 2>/dev/null || faltan="$faltan $n"
done
if [ -z "$faltan" ]; then
  check "los 7 pasos están en el HTML servido" "si" "si"
else
  check "los 7 pasos están en el HTML servido" "si" "no (faltan:$faltan)"
fi

# ── 4 · Los colores servidos SON los del diseño (leídos, no recordados) ───────
for nombre in accent border text; do
  valor="$(token "$nombre")"
  if [ -z "$valor" ]; then
    check "el diseño declara --$nombre" "si" "no (¿cambió docs/DISENO-PIZARRA.md?)"
  elif grep -qi -- "$valor" /tmp/smoke.html 2>/dev/null; then
    check "--$nombre ($valor) está en el CSS servido" "si" "si"
  else
    check "--$nombre ($valor) está en el CSS servido" "si" "no"
  fi
done

# ── 5 · C-56: lo publicado ES lo construido (el hash) ────────────────────────
servido=$(md5 -q /tmp/smoke.html 2>/dev/null || md5sum /tmp/smoke.html | cut -d' ' -f1)
local_hash=$(md5 -q "$REPO/public/index.html" 2>/dev/null || md5sum "$REPO/public/index.html" | cut -d' ' -f1)
check "lo servido tiene el MISMO hash que public/index.html" "$local_hash" "$servido"

# ── 6 · NADA de lo que no debe publicarse quedó público ──────────────────────
# El check más importante. Si responde 200, el archivo ES público y esto falla.
for ruta in /docs/03-DEFINICION.md /docs/04-DISENO.md /docs/estado.json /wrangler.jsonc /tests /scripts; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "$URL$ruta")
  esperado="no-200"
  obtenido="$([ "$c" = "200" ] && echo "200 (¡PUBLICADO!)" || echo "no-200")"
  check "$ruta NO es público" "$esperado" "$obtenido"
done

echo
echo "──────────────────────────────────────────"
echo "  $ok ok · $fallas falla(s)"
echo

if [ "$fallas" -gt 0 ]; then
  echo "❌ SMOKE FALLÓ — no declarar el deploy como verificado."
  exit 1
fi

echo "✅ Smoke OK — lo publicado es lo construido."
exit 0
