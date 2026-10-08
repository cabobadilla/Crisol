# 05 — Tareas

> Fase 4 (salida del Arquitecto). Descomposición en unidades ejecutables por el
> Coder. Una tarea = un ciclo TDD.

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07
- **Basado en:** `04-DISENO.md` (**96 casos** declarados: los 85 del Ciclo 1 + `C-89`..`C-99` del Ciclo 2). ⚠ `C-50` quedó **superseded** por `C-89` (`ADR-007`): **95 vigentes**.

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
- **Entrada:** `04-DISENO.md` § Despliegue · `ADR-006`
- **Salida:** `wrangler.jsonc` (Worker **solo-assets**, sin `main`), `.gitignore`,
  README con el comando local y el de despliegue, `scripts/smoke.sh` ajustado
- **Test primero:** `assets.directory === "./public"` y **sin `main`**
- **Criterio de terminado:** los 7 casos pasan. `C-53` exige que el README documente
  el comando local (`npx wrangler dev`); el Coder **no** ejecuta `wrangler deploy`
- **Nota:** el despliegue y la Preview URL los hace **Hermes**, no el Coder (`ADR-004`)
- **Nota:** `scripts/smoke.sh` es un **entregable del diseño** (ya existe, escrito por
  el Arquitecto): compara el hash de lo publicado contra el repo. El Coder lo verifica
  **estructuralmente**, no lo ejecuta contra la red

---

# Ciclo 2 — persistencia en base de datos (`ADR-007`)

### T-10 — La base y su migración

- **Cubre:** HU-9 / #2, #4, #8, y el DoD (migración versionada)
- **Casos que debe cubrir:** `C-89`, `C-90`, `C-96`, `C-98`, `C-55` *(sigue valiendo)*
- **Entrada:** `ADR-007`, `04-DISENO.md` § *Esquema de persistencia*, § *Forma del Worker* y § *Contrato de la API*
- **Salida:** `wrangler.jsonc` con `main` + binding `DB` + `run_worker_first`, la
  migración `migrations/0001_ideas.sql`, **`src/worker.js` con la ruta de diagnóstico
  `GET /api/salud`** (una consulta real: `SELECT count(*) FROM ideas`), y el README con
  el comando local que **crea y migra la base emulada** (sin cuenta y sin token)
- **Test primero:** la config tiene `main`, `d1_databases[0].binding === "DB"` y
  `/api/*` en `run_worker_first`; la migración existe con su `CREATE TABLE` **y** el índice;
  `/api/salud` devuelve el **conteo real** y, sin migración, **falla**
- **Criterio de terminado:** `npx wrangler dev` levanta, la tabla está creada y
  `/api/salud` responde contra ella
- **Nota de secuencia (corregida antes de despachar):** `wrangler.jsonc` apunta a
  `src/worker.js`, así que **ese archivo tiene que existir en esta tarea** — sin él,
  `wrangler dev` no levanta y la tarea no se puede verificar. No es un stub: es la ruta
  de diagnóstico, y existe porque **un binding sin ejercitar es un supuesto, no un hecho**.
  Las dos operaciones reales llegan en T-11
- **Nota:** el Coder **no** despliega a Cloudflare (`ADR-004`); el `database_id` real lo
  completa Hermes al desplegar

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-11 — El Worker: la API de dos operaciones

- **Cubre:** HU-9 / #1, #2, #7
- **Casos que debe cubrir:** `C-91`, `C-92`, `C-99`
- **Entrada:** `04-DISENO.md` § *Contrato de la API*
- **Salida:** `src/worker.js` con `POST /api/ideas` (**upsert** por `id`) y
  `GET /api/ideas` (ordenadas por `actualizado_en DESC`), más la **clasificación de
  errores** exportada como función pura (`clasificarError`: `cuota_diaria` vs
  `base_no_disponible`)
- **Test primero:** guardar una idea y leerla **desde la base**; dos `POST` con el mismo
  `id` dejan **una** fila; y los dos errores se clasifican **inyectándolos** (sin red)
- **Criterio de terminado:** los **tres** casos pasan **contra la base emulada**, sin red
- **Nota:** el script **solo** corre en `/api/*`. Un test que cargue `/` y espere que el
  script haya corrido está mal escrito

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-12 — La app lee y escribe en la base

- **Cubre:** HU-9 / #1, #5, #6, #7
- **Casos que debe cubrir:** `C-91`, `C-93`, `C-94`, `C-95`
- **Entrada:** T-11, HU-6 (el borrador local)
- **Salida:** el cliente guarda y lista **contra la API**; `localStorage` queda como
  **borrador del paso en curso**; los errores `cuota_diaria` y `base_no_disponible` se
  **muestran** nombrando el límite
- **Test primero:** con la API **interceptada** (`Fetch.fulfillRequest` del CDP) devolviendo
  `cuota_diaria`, lo escrito **sigue en pantalla** y se ve el mensaje; editar una idea
  aprobada **invalida el veredicto en la base**. Enseñarle a **interceptar** a
  `tests/helpers/cdp.mjs` (hoy no sabe) es parte de esta tarea — ver `04-DISENO.md`
  § *Paridad declarada*
- **Criterio de terminado:** los 4 casos pasan, incluidos los **dos negativos** (cuota y
  base caída) — un guardado que falla en silencio es el fallo que esta tarea existe para evitar

- [ ] Test escrito y fallando (RED) — evidencia:
- [ ] Implementación mínima que lo pasa (GREEN)
- [ ] Refactor sin romper tests
- [ ] Commit

### T-13 — Despliegue y smoke del Ciclo 2

- **Cubre:** HU-9 / #3
- **Casos que debe cubrir:** `C-97`
- **Entrada:** T-10, T-11, `scripts/smoke.sh`
- **Salida:** el `smoke.sh` extendido: guardar una idea con marca conocida contra la URL
  real, **redeploy**, y verificar que **sigue** — además del hash de assets que ya verifica
- **Test primero:** *no aplica test unitario*: el caso es un **umbral contra el edge**, y
  el verificador es el smoke, que corre **Hermes** después de desplegar
- **Criterio de terminado:** `smoke.sh <url> --c97 guardar` → **redeploy** → `smoke.sh <url>
  --c97 verificar` pasa: **la idea sigue**, la latencia de pared está bajo 1 s y **no hay
  error `1102`**; y la **CPU de `/api/*` medida a mano** en el dashboard queda **registrada**
  en el historial del ciclo
- **Nota:** el despliegue lo hace **Hermes**, no el Coder (`ADR-004`). La CPU **no se ve por
  HTTP**: el smoke no puede medirla y no se le pide que finja que lo hace

- [ ] Desplegado por Hermes — evidencia:
- [ ] Smoke contra la URL real — evidencia:
- [ ] Idea con marca conocida **sobrevive al redeploy**

