# 05 — Tareas

> Fase 4 (salida del Arquitecto). Descomposición en unidades ejecutables por el
> Coder. Una tarea = un ciclo TDD.

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07
- **Basado en:** `04-DISENO.md` (85 casos en la matriz)

## Reglas

1. Cada tarea es ejecutable de forma **independiente**.
2. Cada tarea apunta a ≥1 criterio de aceptación de `03-DEFINICION.md`.
3. Cada tarea se implementa con **tests primero** (RED → GREEN → REFACTOR).
4. Una tarea a la vez, en el workdir del Coder.
5. **Cada tarea declara los IDs de caso de la matriz que debe cubrir.** El Coder
   **puede agregar casos**; no puede dejar de cubrir ninguno de los declarados.

---

### T-1 — El esqueleto del wizard y sus 7 pasos

- **Cubre:** HU-1 / #1, #2, #3
- **Casos que debe cubrir:** `C-01`..`C-06`
- **Entrada:** `04-DISENO.md` § Contratos (el array `PASOS`)
- **Salida:** `public/index.html` con los 7 pasos, navegación y registro de la idea
- **Test primero:** los 7 pasos existen en orden; solo el 1 es accesible; los futuros
  se ven pero no se pueden usar
- **Criterio de terminado:** se recorre el wizard de punta a punta y la idea queda registrada

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-2 — Valor y métrica: el paso que más exige

- **Cubre:** HU-2 / #1..#4
- **Casos que debe cubrir:** `C-07`..`C-13`
- **Entrada:** T-1, `04-DISENO.md` § `metricaInvalida`
- **Salida:** el paso `valor` con sus 3 campos y su validación
- **Test primero:** «mejorar la experiencia» **no** avanza; «reducir de 3 semanas a 2
  días» **sí**; «un wizard con pasos» **no**; «una idea deja de perderse» **sí**
- **Criterio de terminado:** los 7 casos pasan, incluidos los 3 negativos

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-3 — El bloqueo con mensajes que nombran el requisito

- **Cubre:** HU-3 / #1..#4
- **Casos que debe cubrir:** `C-14`..`C-19`
- **Entrada:** T-1, T-2
- **Salida:** `validarPaso()` en todos los pasos + invalidación en cascada
- **Test primero:** un paso vacío no avanza y el mensaje **nombra el requisito**
  (el test falla si el mensaje dice «campo requerido»)
- **Criterio de terminado:** **el bloqueo es uniforme**: los 7 pasos validan

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-4 — Referencias: fuente y conclusión

- **Cubre:** HU-4 / #1..#3
- **Casos que debe cubrir:** `C-20`..`C-24`
- **Entrada:** T-1
- **Salida:** el paso `referencias` con lista y sus mínimos
- **Test primero:** 1 referencia → no avanza; 2 sin «qué se toma» → no avanza
- **Criterio de terminado:** los 5 casos pasan

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-5 — El challenger: 4 reglas que rechazan de verdad

- **Cubre:** HU-5 / #1..#5
- **Casos que debe cubrir:** `C-25`..`C-33`, y el barrido `C-78`..`C-85`
- **Entrada:** T-2, T-3, T-4
- **Salida:** las 4 reglas, el veredicto y las objeciones con su `id` de regla
- **Test primero:** una definición completa → APROBADO; **quitar cualquier pieza →
  RECHAZADO con la regla correcta nombrada**
- **Criterio de terminado:** el challenger **rechaza**; un challenger que aprueba todo
  no pasa esta tarea
- **Nota:** es la tarea que prueba el mecanismo. Si algo se recorta, que no sea esta

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-6 — Persistencia y reapertura

- **Cubre:** HU-6 / #1..#3
- **Casos que debe cubrir:** `C-34`..`C-39`
- **Entrada:** T-1
- **Salida:** `localStorage` versionado, reapertura, invalidación del challenge
- **Test primero:** recargar conserva la idea; editar una aprobada **invalida** el veredicto
- **Criterio de terminado:** los 6 casos pasan, incluidos los 3 de borde

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-7 — El diseño Pizarra

- **Cubre:** HU-7 / #1..#8
- **Casos que debe cubrir:** `C-40`..`C-49`
- **Entrada:** `DISENO-PIZARRA.md` (los tokens exactos), T-1
- **Salida:** los 13 tokens en ambos modos + los componentes
- **Test primero:** los 13 tokens con sus valores exactos; el acento oscuro `#7aa8ff`;
  contraste recalculado de forma **independiente**
- **Criterio de terminado:** los 10 casos pasan, **incluido `C-46` (375px)**
- **Nota:** `C-44` (estados por ≥2 señales) y `C-46` son las que más fácil se
  aprueban mal. **H-1 fue un bug de 375px que 79 tests verdes no vieron**

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-8 — Empaquetado y despliegue

- **Cubre:** HU-8 / #1..#8
- **Casos que debe cubrir:** `C-50`..`C-56`
- **Entrada:** `04-DISENO.md` § Despliegue
- **Salida:** `wrangler.jsonc`, `public/index.html` ubicado, `scripts/smoke.sh`, README
  con los comandos, `.gitignore`
- **Test primero:** `assets.directory === "./public"` y **sin `main`**; `public/`
  contiene solo lo publicable
- **Criterio de terminado:** los 7 casos pasan. **`C-53`/`C-54` (comandos
  documentados)**: el Coder **no** ejecuta `wrangler deploy` — solo `wrangler dev`
- **Nota:** el deploy a Cloudflare lo hace **Hermes**, no el Coder
- **Nota:** `scripts/smoke.sh` es un **entregable del diseño** (ya existe, escrito por
  el Arquitecto): verifica contra la URL real y **no** lo corre el Coder. El Coder lo
  verifica **estructuralmente** (`C-56` exige que el smoke contemple que `docs/` no sea
  público), no lo ejecuta

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

---

## Estado

| Tarea | Estado | Gate G3 (tests primero) | Notas |
|---|---|---|---|
| T-1 | pendiente | — | esqueleto del wizard |
| T-2 | pendiente | — | valor y métrica |
| T-3 | pendiente | — | bloqueo uniforme |
| T-4 | pendiente | — | referencias |
| T-5 | pendiente | — | el challenger debe **rechazar** |
| T-6 | pendiente | — | persistencia |
| T-7 | pendiente | — | Pizarra; `C-46` a 375px |
| T-8 | pendiente | — | despliegue; el deploy lo hace Hermes |

---

**Gate G2 (salida de fase 4):** trazabilidad completa definición ↔ tareas. Las 8
tareas cubren los 85 casos declarados en la matriz.
