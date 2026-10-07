#!/usr/bin/env bash
#
# smoke.sh — Verificación contra la URL REAL. Lo corre Hermes, no el Coder.
#
# La suite completa corre en local (ADR-003). Este smoke NO la reemplaza:
# verifica que lo publicado en Cloudflare ES lo que se construyó.
#
# Uso:  bash scripts/smoke.sh https://crisol.<subdominio>.workers.dev
#
set -uo pipefail

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

echo "→ Smoke contra $URL"
echo

# 1 · La app responde
code=$(curl -s -o /tmp/smoke.html -w '%{http_code}' "$URL/")
check "la raíz responde 200" "200" "$code"

# 2 · Es Crisol y no una página de error
titulo=$(grep -o '<title>[^<]*</title>' /tmp/smoke.html 2>/dev/null | head -1)
case "$titulo" in
  *risol*) check "el título menciona Crisol" "si" "si" ;;
  *)       check "el título menciona Crisol" "si" "no (${titulo:-sin título})" ;;
esac

# 3 · El wizard declara 7 pasos
pasos=$(grep -oE '"?(7|PASOS)"?' /tmp/smoke.html 2>/dev/null | head -1)
if grep -qE 'PASOS|data-paso' /tmp/smoke.html 2>/dev/null; then
  check "el wizard está en el HTML servido" "si" "si"
else
  check "el wizard está en el HTML servido" "si" "no"
fi

# 4 · Los tokens de Pizarra llegaron al edge
if grep -q -- '--radius: *10px' /tmp/smoke.html 2>/dev/null; then
  check "los tokens de Pizarra están en el CSS servido" "si" "si"
else
  check "los tokens de Pizarra están en el CSS servido" "si" "no"
fi

# 5 · El acento oscuro NO es el claro (no-inversión)
if grep -q '#7aa8ff' /tmp/smoke.html 2>/dev/null; then
  check "el acento oscuro es #7aa8ff" "si" "si"
else
  check "el acento oscuro es #7aa8ff" "si" "no"
fi

# 6 · NADA de lo que no debe publicarse quedó público  ← el check más importante
for ruta in /docs/03-DEFINICION.md /wrangler.jsonc /tests /docs/04-DISENO.md; do
  c=$(curl -s -o /dev/null -w '%{http_code}' "$URL$ruta")
  if [ "$c" = "200" ]; then
    check "$ruta NO es público" "no-200" "200 (¡PUBLICADO!)"
  else
    check "$ruta NO es público" "no-200" "$c"
  fi
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
