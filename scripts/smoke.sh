#!/usr/bin/env bash
#
# smoke.sh — Verificación contra la URL REAL. Lo corre Hermes, no el Coder (ADR-004).
#
# La suite completa corre en local sobre el archivo (ADR-003). Este smoke NO la
# reemplaza: verifica que lo PUBLICADO sea lo CONSTRUIDO.
#
# Uso:
#   bash scripts/smoke.sh <url>                  # el artefacto publicado
#   bash scripts/smoke.sh <url> --c97 guardar    # C-97 (1/2): guarda una idea con marca conocida
#   bash scripts/smoke.sh <url> --c97 verificar  # C-97 (2/2): TRAS EL REDEPLOY, la idea SIGUE
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
#   La v2 escribía en /tmp/smoke.html. El harness exige a todos —y se exige a sí
#   mismo (PROCESS.md, regla 13)— que los temporales vivan en ./.tmp/. Un verificador
#   que viola la regla que hace cumplir enseña la regla equivocada. Corregido.
#
# QUÉ NO VERIFICA ESTE SMOKE — declarado, para que el verde no se lea como más de lo
# que es: el criterio de CPU de C-97 («el request de /api/* queda bajo 10 ms de CPU»)
# NO se mide por HTTP. Se mide **una vez, a mano, en el dashboard de Cloudflare**
# (`cpuTimeP50` del Worker), y queda registrado en el historial del ciclo. Lo que sí
# verifica acá es lo observable: la idea SOBREVIVE, la latencia de PARED (proxy
# declarado, no la CPU) y que el límite de CPU no se haya manifestado (error 1102).
#
set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DISENO="$REPO/docs/DISENO-PIZARRA.md"
DISENO4="$REPO/docs/04-DISENO.md"
TMP="$REPO/.tmp"
MARCA_FILE="$TMP/c97-marca.txt"

URL="${1:-}"
MODO="${2:-}"
FASE="${3:-}"

if [ -z "$URL" ]; then
  echo "Uso: bash scripts/smoke.sh <url> [--c97 guardar|verificar]" >&2
  exit 2
fi
URL="${URL%/}"
mkdir -p "$TMP"
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

# Las rutas de la API también se LEEN del diseño (el «Contrato de la API»), no se recuerdan.
ruta_api() { # ruta_api <nombre-de-la-ruta>  →  /api/…
  grep -oE "/api/[a-z-]*${1}[a-z-]*" "$DISENO4" 2>/dev/null | head -1
}

md5de() { md5 -q "$1" 2>/dev/null || md5sum "$1" | cut -d' ' -f1; }

# ─────────────────────────────────────────────────────────────────────────────
# C-97 · La idea sobrevive al redeploy, y el borde responde
# ─────────────────────────────────────────────────────────────────────────────
c97() {
  local ideas salud
  ideas="$(ruta_api ideas)"
  salud="$(ruta_api salud)"
  if [ -z "$ideas" ]; then
    echo "  ✗ no pude leer la ruta de la API desde $DISENO4 (¿cambió el Contrato?)" >&2
    fallas=$((fallas + 1)); return
  fi

  if [ "$FASE" = "guardar" ]; then
    local marca id
    marca="c97-$(date -u +%Y%m%dT%H%M%SZ)-${RANDOM}"
    id="smoke-$marca"
    cat > "$TMP/c97-body.json" <<EOF
{"id":"$id","titulo":"$marca","estado":"en_curso","paso_alcanzado":1,"idea_json":"marca=$marca","veredicto":null,"veredicto_json":null}
EOF
    local code code_post
    code_post="$(curl -s -o "$TMP/c97-post.json" -w '%{http_code}' \
      -X POST -H 'content-type: application/json' --data-binary "@$TMP/c97-body.json" "$URL$ideas")"
    check "POST $ideas responde 201" "201" "$code_post"

    code="$(curl -s -o "$TMP/c97-get.json" -w '%{http_code}' "$URL$ideas")"
    check "GET $ideas responde 200" "200" "$code"
    if grep -q "$id" "$TMP/c97-get.json" 2>/dev/null; then
      check "la idea recién guardada está en la lista" "si" "si"
    else
      check "la idea recién guardada está en la lista" "si" "no"
    fi

    if [ -n "$salud" ]; then
      local n
      n="$(curl -s "$URL$salud" | grep -oE '"ideas"[[:space:]]*:[[:space:]]*[0-9]+' | grep -oE '[0-9]+$')"
      echo "  ℹ $salud declara ${n:-?} idea(s) en la base"
    fi

    # La marca SOLO se guarda si el POST llegó a la base. Si se guardara igual, la
    # fase 'verificar' comprobaría una idea que nunca existió y el redeploy quedaría
    # "verificado" contra la nada.
    if [ "$code_post" = "201" ]; then
      printf 'marca=%s\nid=%s\n' "$marca" "$id" > "$MARCA_FILE"
      echo "  ℹ marca guardada en .tmp/c97-marca.txt — AHORA REDEPLOYÁ y corré la fase 'verificar'"
    else
      rm -f "$MARCA_FILE"
      echo "  ✗ el POST no llegó a la base (obtenido $code_post): no hay marca que verificar después" >&2
    fi
    return
  fi

  # fase verificar: tras el redeploy, la MISMA idea tiene que seguir
  if [ ! -f "$MARCA_FILE" ]; then
    echo "  ✗ no hay marca previa: corré primero '--c97 guardar'" >&2
    fallas=$((fallas + 1)); return
  fi
  local marca id
  marca="$(grep -m1 '^marca=' "$MARCA_FILE" | cut -d= -f2-)"
  id="$(grep -m1 '^id=' "$MARCA_FILE" | cut -d= -f2-)"

  local code t
  t="$(curl -s -o "$TMP/c97-get2.json" -w '%{time_total}' "$URL$ideas")"
  code="$(curl -s -o /dev/null -w '%{http_code}' "$URL$ideas")"
  check "GET $ideas responde 200 tras el redeploy" "200" "$code"
  if grep -q "$id" "$TMP/c97-get2.json" 2>/dev/null; then
    check "la idea ($marca) SOBREVIVIÓ al redeploy" "si" "si"
  else
    check "la idea ($marca) SOBREVIVIÓ al redeploy" "si" "no (¡se perdió!)"
  fi
  check "la marca sigue en la respuesta" "si" \
    "$(grep -q "$marca" "$TMP/c97-get2.json" 2>/dev/null && echo si || echo no)"

  # Latencia de PARED: es un proxy declarado, NO la CPU de C-97.
  echo "  ℹ latencia de pared de $ideas: ${t}s (proxy; la CPU se mide en el dashboard)"
  check "la latencia de pared está bajo 1 s" "si" \
    "$(awk -v t="$t" 'BEGIN { print (t < 1.0) ? "si" : "no" }')"

  # El límite de CPU se manifiesta como error 1102. Que no aparezca es lo que este
  # smoke SÍ puede afirmar sobre ese límite.
  check "no apareció el error 1102 (límite de CPU)" "si" \
    "$(grep -q '1102' "$TMP/c97-get2.json" 2>/dev/null && echo no || echo si)"
}

if [ "$MODO" = "--c97" ]; then
  echo "→ Smoke C-97 (fase: ${FASE:-?}) contra $URL"
  echo
  c97
  echo
  echo "──────────────────────────────────────────"
  echo "  $ok ok · $fallas falla(s)"
  [ "$fallas" -gt 0 ] && { echo; echo "❌ SMOKE C-97 FALLÓ."; exit 1; }
  echo
  echo "✅ Smoke C-97 OK."
  echo "   RECORDÁ el otro medio: la CPU de /api/* se mide A MANO en el dashboard"
  echo "   (cpuTimeP50) — este script no la puede ver por HTTP."
  exit 0
fi

echo "→ Smoke contra $URL"
echo

# ── 1 · La app responde ───────────────────────────────────────────────────────
code=$(curl -s -o "$TMP/smoke.html" -w '%{http_code}' "$URL/")
check "la raíz responde 200" "200" "$code"

# ── 2 · Es Crisol y no una página de error ────────────────────────────────────
titulo=$(grep -o '<title>[^<]*</title>' "$TMP/smoke.html" 2>/dev/null | head -1)
case "$titulo" in
  *risol*) check "el título menciona Crisol" "si" "si" ;;
  *)       check "el título menciona Crisol" "si" "no (${titulo:-sin título})" ;;
esac

# ── 3 · El wizard llegó completo, con sus 7 pasos ─────────────────────────────
faltan=""
for n in Idea Problema Valor Referencias Alcance Criterio Challenge; do
  grep -q "$n" "$TMP/smoke.html" 2>/dev/null || faltan="$faltan $n"
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
  elif grep -qi -- "$valor" "$TMP/smoke.html" 2>/dev/null; then
    check "--$nombre ($valor) está en el CSS servido" "si" "si"
  else
    check "--$nombre ($valor) está en el CSS servido" "si" "no"
  fi
done

# ── 5 · C-56: lo publicado ES lo construido (el hash) ────────────────────────
servido="$(md5de "$TMP/smoke.html")"
local_hash="$(md5de "$REPO/public/index.html")"
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
