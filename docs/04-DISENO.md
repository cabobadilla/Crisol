# 04 — Diseño

> Fase 4. Dueño: **Arquitecto**. Decidir *cómo* se construye. Termina con
> trazabilidad completa hacia la definición.

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07
- **Basado en:** `03-DEFINICION.md` (Revisión 3, aprobada en G1)
- **Iteración:** Etapa 1
- **Nota:** es el **primer** proyecto que usa la **matriz de casos** (v0.13) y la
  **sección de Despliegue** (v0.15). Las dos son obligatorias.

## Arquitectura

### Componentes

| Componente | Responsabilidad | Límite |
|---|---|---|
| `public/index.html` | **Todo el producto**: marcado, tokens Pizarra, wizard, reglas del challenger, persistencia | Un solo archivo, sin build, sin dependencias. Es el **único** artefacto que se publica |
| `wrangler.jsonc` | Configuración del despliegue (Worker solo-assets) | No se publica: vive en la raíz, no en `public/` |
| `tests/` | La suite: estructurales (Node) y de comportamiento (navegador real) | No se publica |
| `scripts/smoke.sh` | Verificación contra la URL real, post-deploy | Lo corre **Hermes**, no el Coder |

### Flujo de datos

```
usuario → wizard (7 pasos)
            │
            ├─ valida el paso actual (reglas por paso)
            │     ├─ inválido → mensaje que NOMBRA el requisito → no avanza
            │     └─ válido   → marca completo → avanza
            │
            ├─ al editar un paso anterior → invalida los posteriores
            │
            └─ al completar → challenger (4 reglas)
                  ├─ RECHAZADO → objeciones con su regla → no se puede cerrar
                  └─ APROBADO  → la idea puede marcarse como definida

persistencia: localStorage  ←→  estado de cada idea
```

**Sin backend. Sin red. Sin cuentas.** El producto entero se ejecuta en el navegador.

### Diagrama

Omitido a propósito: un diagrama de un flujo lineal de 7 pasos agrega ceremonia, no
claridad. El bloque de arriba **es** el diagrama.

## Contratos

> Lo bastante precisos para que el Coder no tenga que adivinar nada.

### Los 7 pasos del framework

```js
const PASOS = [
  { id: 'idea',        titulo: 'Idea',                  exige: ['que es, en una frase'] },
  { id: 'problema',    titulo: 'Problema',              exige: ['quien lo sufre', 'con que frecuencia'] },
  { id: 'valor',       titulo: 'Valor y metrica',       exige: ['que cambia', 'para quien', 'como se mide'] },
  { id: 'referencias', titulo: 'Referencias',           exige: ['>=2 referencias', 'fuente', 'que se toma'] },
  { id: 'alcance',     titulo: 'Alcance',               exige: ['que entra', 'que NO entra'] },
  { id: 'terminado',   titulo: 'Criterio de terminado', exige: ['como se sabe que quedo definida'] },
  { id: 'challenge',   titulo: 'Challenge',             exige: [] },   // produce veredicto
];
```

**El orden es visible y fijo.** El usuario siempre ve los 7 pasos: los posteriores
aparecen **visibles pero inaccesibles**. Ocultarlos rompería el criterio de HU-1 y
escondería el proceso.

### Validación de un paso

```js
// [] si el paso es válido; si no, los motivos CONCRETOS.
validarPaso(pasoId, datos) → string[]

// Contrato del mensaje: nombra el REQUISITO, no el campo.
//   ✗ "Campo requerido"                    ← prohibido (HU-3)
//   ✓ "El problema no dice quién lo sufre"
```

### Estructura de una idea

```js
{
  id: string,              // generado
  creada: string,          // ISO
  pasos: {
    idea:        { valor: string, completo: boolean },
    problema:    { quien: string, frecuencia: string, completo: boolean },
    valor:       { cambia: string, paraQuien: string,
                   metrica: { que: string, como: string, objetivo: string },
                   completo: boolean },
    referencias: { items: [{ fuente: string, aporta: string }], completo: boolean },
    alcance:     { entra: string, noEntra: string, completo: boolean },
    terminado:   { criterio: string, completo: boolean },
  },
  pasoActual: number,      // 0..6
  challenge: { estado: 'sin-correr' | 'rechazado' | 'aprobado',
               objeciones: [{ regla: string, paso: string, mensaje: string }] } | null
}
```

> **Regla dura:** editar cualquier paso pone `challenge = null`. **Una definición
> editada no está aprobada** (criterio de HU-6).

### Las 4 reglas del challenger

```js
const REGLAS = [
  { id: 'R1', paso: 'problema',    eval: d => !d.problema.quien?.trim(),
    objecion: 'No dice quién sufre el problema' },
  { id: 'R2', paso: 'valor',       eval: d => metricaInvalida(d.valor.metrica),
    objecion: 'El valor o la métrica no son medibles' },
  { id: 'R3', paso: 'referencias', eval: d => d.referencias.items.filter(
                                          v => v.fuente?.trim() && v.aporta?.trim()).length < 2,
    objecion: 'Menos de 2 referencias con fuente y conclusión' },
  { id: 'R4', paso: 'terminado',   eval: d => !d.terminado.criterio?.trim(),
    objecion: 'No hay criterio de terminado' },
];
```

**`metricaInvalida` es la regla con más superficie** — el corazón de HU-2:

```js
metricaInvalida(m) → boolean
// INVÁLIDA si:
//   - falta qué se mide, cómo se obtiene, o el valor objetivo
//   - el objetivo NO contiene una cantidad verificable (número, %, tiempo, conteo)
//       "mejorar la experiencia"        → INVÁLIDA
//       "reducir de 3 semanas a 2 días" → VÁLIDA
//   - el valor describe la FUNCIÓN en vez del CAMBIO
//       "un wizard con pasos"           → INVÁLIDO
//       "una idea deja de perderse"     → VÁLIDO
//   - el destinatario es genérico ("los usuarios") sin concretarse
```

**El veredicto es auditable:** cada objeción sale con el `id` de la regla que la
produjo. No es una opinión, es una regla con nombre.

### Esquema de persistencia

```js
// clave: "crisol.v1"
{ version: 1, ideas: [ Idea, ... ] }
```

- Clave **versionada**: contenido de otra versión → se ignora y arranca limpio.
- Contenido **corrupto** (JSON inválido) → se ignora, sin romper la app.
- `localStorage` **bloqueado** (modo privado) → la app funciona **en memoria** y
  **avisa** que no va a persistir.

## Stack y dependencias

| Elección | Versión | Justificación |
|---|---|---|
| HTML + CSS + JS sin framework | — | Los tokens Pizarra y el wizard no necesitan framework. Un build agrega superficie sin resolver nada |
| `node --test` para la suite | Node 22+ | Ya probado en el harness y en `MyHermesTest`. Cero dependencias |
| Chrome headless (CDP) para los casos de comportamiento | 154 (ya instalado) | Los casos de comportamiento **ejecutan** el artefacto. Ya se demostró que funciona sin instalar nada |
| `wrangler` para local y deploy | 4.x | Es la vía oficial. `wrangler dev` emula en local **sin cuenta** |
| Google Fonts CDN (Inter) | — | Un `<link>`. Sin auto-hospedaje |

> **Dependencias en runtime: cero.** La app no necesita `npm install`. El Coder no
> puede agregar ninguna (regla del prompt).

## Despliegue  ⭐ OBLIGATORIA

### Dos despliegues, no uno

> Este proyecto tiene **dos** cosas publicadas, en **dos** plataformas, con **dos**
> dueños. Confundirlas es el error fácil.

| Qué | Dónde | Quién | Cómo |
|---|---|---|---|
| **El producto** (Crisol) | **Cloudflare** (Worker solo-assets) | **Hermes** | `npx wrangler deploy` |
| **El tablero** (`progreso.html`) | **GitHub Pages** | **Hermes** (vía el harness) | `scripts/update-status.sh --push` |

**Por qué no van juntos.** El tablero es un artefacto **del harness**, no del producto:
existe también en `MyHermesTest` y en cualquier proyecto futuro, y su diseño es del
harness (el usuario confirmó que **queda como está**). El producto es de este proyecto
y su diseño es Pizarra. Son dos ciclos de vida distintos.

**Consecuencia operativa:** `public/` es **solo** el producto. El tablero y los `docs/`
viven en la raíz del repo y **no** entran al directorio de assets — si entraran, se
publicarían el tablero y los `docs/`, que es exactamente lo que `C-51`/`C-56` previenen.

### Forma del Worker

**Elegida: A — Worker solo-assets (sin `main`).**

**Por qué:** Crisol Etapa 1 es una app completamente cliente (sin backend, sin red,
persistencia en `localStorage`). Un Worker solo-assets sirve el HTML **sin ejecutar
código**: los requests son **gratis e ilimitados**, no consumen las 100.000 diarias, y
no hay presupuesto de CPU que agotar. Meter un script no daría ninguna capacidad y
**sí** crearía un límite nuevo.

**Y se elige Workers y no Pages** porque Cloudflare hoy dice *«start new projects with
Workers»*: Pages sigue funcionando, pero las features nuevas aterrizan en Workers.

```jsonc
{
  "$schema": "./node_modules/wrangler/config-schema.json",
  "name": "crisol",
  "compatibility_date": "2026-10-07",
  "assets": {
    "directory": "./public",
    "not_found_handling": "single-page-application"
  }
}
```

> **`directory: "./public"` y NO `"."`.** Apuntar a la raíz publicaría `docs/`,
> `tests/` y `wrangler.jsonc`. **Todo lo que está en el directorio de assets se
> publica** — es la trampa #1 de la skill.

### Entornos

| | **Local** | **Cloudflare** |
|---|---|---|
| **Comando** | `npx wrangler dev` → **http://localhost:8787** | `npx wrangler deploy` |
| **Qué corre** | El Worker servido por Miniflare/workerd, offline: el wizard completo, los assets, el routing | El Worker real en el edge |
| **Qué NO corre igual** | **No aplica los límites del plan** (ni cuotas ni CPU). No hay CDN ni latencias reales. No hay TLS/DNS | — |
| **Credenciales** | **Ninguna** (ni cuenta ni token) | **Un token**, de Hermes |

> **Paridad declarada.** `wrangler dev` **no corta a los 10 ms de CPU**. En Etapa 1
> esto no puede morder (no hay script), pero la diferencia queda declarada para la
> Etapa 2, cuando entre el agente real.

### Dónde corren las pruebas  ⭐ OBLIGATORIA

| | **Suite** | **Smoke** |
|---|---|---|
| **Dónde** | **Local** — `node --test` + Chrome headless sobre `wrangler dev` | **Cloudflare** — la URL real |
| **Cuándo** | Antes de cada merge | Después de cada deploy |
| **Qué prueba** | El **comportamiento** (la matriz completa) | Que **lo publicado es lo construido** |
| **Quién** | El **Coder** (Hermes verifica) | **Hermes** |

**La suite tiene dos capas:**

1. **Estructurales (Node, sin navegador)** — los 13 tokens de Pizarra, los 7 pasos
   presentes, las 4 reglas declaradas, el esquema de persistencia. Rápidas.
2. **De comportamiento (Chrome headless vía CDP)** — avanzar, bloquear, el mensaje que
   nombra el requisito, el challenger rechazando. **Ejecutan el artefacto**, no lo
   leen: un test que comprueba que existe el `if` que bloquearía **no verifica el
   bloqueo**.

**El smoke — chico y explícito:**
- La URL responde **200** y sirve el título esperado
- Los **13 tokens** de Pizarra están en el CSS servido
- El wizard declara **7** pasos
- **`/docs/03-DEFINICION.md` y `/wrangler.jsonc` NO son accesibles** (404)

### Bindings

**Ninguno.** Un Worker solo-assets no bindea nada. Si en la Etapa 2 entra el agente,
acá aparecerán los bindings — y ese cambio es el que justifica pasar de la opción A a
la B.

### Límite que puede romperlo

- **Límite: 100.000 requests/día** → **NO APLICA.** Al ser un Worker solo-assets sin
  `main`, los requests **no se facturan ni consumen cuota**: se sirven como assets,
  gratis e ilimitados. Es exactamente el motivo de elegir la opción A.
- **Límite: 20.000 archivos por versión · 25 MiB por archivo** → no aplica (1 archivo).
- **En Etapa 1 este diseño no tiene límite que lo rompa** — y eso es deliberado: se
  eligió la forma que **no tiene** límite.

### Presupuesto de CPU

**Cero.** No hay `main`, así que **ningún request ejecuta código**. Los 10 ms de CPU
del plan free no se tocan: el trabajo del wizard corre en **el navegador del usuario**,
no en el edge.

> Si en Etapa 2 entra el agente, esto cambia por completo: un Worker con `main` **sí**
> consume cuota y **sí** tiene 10 ms de presupuesto. **Ese es el límite que decidirá la
> arquitectura de la Etapa 2.**

### Secretos

**Etapa 1: ninguno.** Ni en el repo, ni en `.dev.vars`, ni en `wrangler secret`.

**El token de Cloudflare** — necesario para desplegar — **no vive en el proyecto**:
vive en `~/.hermes/.env`, fuera del repo y **fuera del entorno del Coder**. Es lo que
hace real la regla «el Coder despliega en local; solo Hermes despliega al cloud».

**Permisos necesarios del token:** `Workers Scripts:Edit` + lectura de cuenta. Nada
más — no necesita DNS, ni R2, ni KV.

### Rollback

```bash
npx wrangler deployments list
npx wrangler rollback <version-id> -m "motivo"
```

**Qué se restaura: todo junto.** Los assets se suben con la versión, así que el
rollback devuelve HTML y CSS **en el mismo acto**: no existe una ventana donde el HTML
viejo apunte a un asset que ya no está.

### ¿Hay algo en el directorio de assets que NO debe ser público?

**No, y el diseño lo garantiza.** `directory: "./public"` contiene **solo**
`index.html`. Quedan fuera, y por lo tanto no se publican: `docs/` (incluidos los ADR,
que describen el producto), `tests/` (que revelan la matriz), `wrangler.jsonc`, y
`.dev.vars` si alguna vez existe.

> **Verificación obligatoria en el smoke:** pedir `/docs/03-DEFINICION.md` y
> `/wrangler.jsonc` y confirmar que **no** son accesibles. Un directorio de assets mal
> apuntado es **silencioso**: el sitio funciona igual y publica todo.

## Decisiones (ADRs)

- `ADR-001-un-solo-archivo.md` — todo el producto en `public/index.html`, sin build
- `ADR-002-worker-solo-assets.md` — Worker solo-assets, en vez de Pages o de un Worker con script
- `ADR-003-pruebas-local-smoke-edge.md` — la suite en local, el smoke en el edge
- `ADR-004-despliegue-solo-hermes.md` — solo Hermes despliega al cloud; el token nunca entra al entorno del Coder

## Matriz de casos de prueba  ⭐ OBLIGATORIA

> **Los casos se identifican acá, en el diseño.** No son código: son el contrato de
> qué significa "terminado". El Coder los traduce a tests ejecutables y **puede
> agregar los que se le ocurran; no puede quitar ninguno.**

### Grupo A — El wizard y sus pasos (HU-1)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-01` | Los 7 pasos están **en UNA fila horizontal** | HU-1 / #1 | **geometría** | `getBoundingClientRect()` de los 7: mismo `top` (±2 px) y `left` **estrictamente creciente** |
| `C-02` | Al cargar, solo el paso 1 es accesible | HU-1 / #1 | comportamiento | El paso 1 acepta interacción; los 2..7 existen y **no** aceptan eventos de puntero |
| `C-03` | Los 7 pasos se ven aunque estén bloqueados | HU-1 / #1 | **geometría** | Los 7 tienen `width` y `height` > 0 **y** están dentro del viewport en el eje de la fila |
| `C-04` | Se indica el paso actual y el total | HU-1 / #1 | estructura | Aparece «1 de 7» **y** el paso 1 está marcado como activo en la fila |
| `C-05` | Completar marca y avanza | HU-1 / #2 | comportamiento | El anterior queda **completado** (estado distinto del activo y del bloqueado) y el activo es el siguiente |
| `C-06` | Completar los 7 registra la idea | HU-1 / #3 | comportamiento | La idea aparece en la lista con sus datos |
| `C-86` | A 390 px la fila **no desborda** el viewport | HU-1 / #1 | **umbral** | `document.scrollingElement.scrollWidth <= 392` |
| `C-87` | A 390 px el contenido respeta el margen | HU-1 / #1 | **umbral** | El borde izquierdo del primer hijo >= 16 px (no pegado al canto) |
| `C-88` | **A 1200 px la barra no recorta ningún paso** | HU-1 / #1 | **geometría** | `contenedor.scrollWidth <= contenedor.clientWidth + 2` **y** los 7 indicadores con `right <= contenedor.right` — ninguno escondido tras un scroll interno |

### Grupo B — Valor y métrica (HU-2)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-07` | El paso de valor pide tres cosas separadas | HU-2 / #1 | estructura | Hay 3 campos distintos: qué cambia, para quién, cómo se mide |
| `C-08` | Métrica vaga bloquea | HU-2 / #2 | comportamiento | «mejorar la experiencia» → **no avanza**; el mensaje pide cantidad verificable |
| `C-09` | Métrica sin valor objetivo bloquea | HU-2 / #2 | comportamiento | Con qué se mide y cómo, pero sin objetivo → **no avanza** |
| `C-10` | Métrica con cantidad verificable pasa | HU-2 / #2 | comportamiento | «reducir de 3 semanas a 2 días» → **avanza** |
| `C-11` | Valor que describe la función bloquea | HU-2 / #3 | comportamiento | «un wizard con pasos» → **no avanza**; pide el cambio |
| `C-12` | Valor que describe el cambio pasa | HU-2 / #3 | comportamiento | «una idea deja de perderse» → **avanza** |
| `C-13` | Valor sin destinatario concreto bloquea | HU-2 / #4 | comportamiento | «los usuarios» → **no avanza**; exige de quién es el cambio |

### Grupo C — El proceso no deja avanzar (HU-3)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-14` | Paso vacío bloquea | HU-3 / #1 | comportamiento | Sin responder → **no avanza** |
| `C-15` | Solo espacios se trata como vacío | HU-3 / #1 | comportamiento | `"   "` → **no avanza** |
| `C-16` | El mensaje NOMBRA el requisito | HU-3 / #1 | comportamiento | El mensaje contiene el requisito concreto; **no** dice «campo requerido» |
| `C-17` | Respuesta bajo el mínimo bloquea | HU-3 / #2 | comportamiento | No alcanza el mínimo del paso → **no avanza**, y nombra lo que falta |
| `C-18` | Completar lo que faltaba desbloquea | HU-3 / #3 | comportamiento | Tras completar exactamente el requisito, **avanza** |
| `C-19` | Editar un paso anterior invalida los posteriores | HU-3 / #4 | comportamiento | Dejar un paso anterior incompleto marca los posteriores como invalidados |

### Grupo D — Referencias (HU-4)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-20` | El paso instruye qué es una referencia válida | HU-4 / #1 | estructura | Hay texto de instrucción en el paso de referencias |
| `C-21` | Menos de 2 referencias bloquea | HU-4 / #2 | comportamiento | 1 referencia completa → **no avanza**; indica cuántas faltan |
| `C-22` | Referencia sin fuente bloquea | HU-4 / #2 | comportamiento | Falta la fuente → **no avanza** |
| `C-23` | Referencia sin conclusión bloquea | HU-4 / #3 | comportamiento | Fuente sí, «qué se toma» no → **no avanza** |
| `C-24` | 2 referencias completas pasan | HU-4 / #2 | comportamiento | 2 con fuente y conclusión → **avanza** |

### Grupo E — El challenger (HU-5)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-25` | El challenge produce objeciones concretas | HU-5 / #1 | comportamiento | Con huecos → objeciones, cada una con paso y qué cambiaría |
| `C-26` | Definición incompleta → RECHAZADO | HU-5 / #2 | comportamiento | Veredicto RECHAZADO y la idea **no** se puede marcar definida |
| `C-27` | Definición completa → APROBADO | HU-5 / #3 | comportamiento | Veredicto APROBADO y la idea **sí** se puede marcar definida |
| `C-28` | Cada objeción nombra su regla | HU-5 / #4 | comportamiento | Cada objeción trae el `id` de la regla (`R1`..`R4`) |
| `C-29` | Sin valor completo → rechaza nombrando R2 | HU-5 / #5 | comportamiento | Veredicto RECHAZADO y las objeciones incluyen `R2` |
| `C-30` | R1: sin problema → rechaza | HU-5 / #4 | comportamiento | Sin «quién lo sufre» → objeción `R1` |
| `C-31` | R3: referencias insuficientes → rechaza | HU-5 / #4 | comportamiento | <2 referencias completas → objeción `R3` |
| `C-32` | R4: sin criterio de terminado → rechaza | HU-5 / #4 | comportamiento | Sin criterio → objeción `R4` |
| `C-33` | Las 4 reglas se evalúan de una | HU-5 / #1 | comportamiento | Con las 4 fallando, aparecen 4 objeciones, una por regla |

### Grupo F — Persistencia (HU-6)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-34` | La idea persiste al recargar | HU-6 / #1 | comportamiento | Tras recargar, la idea sigue en la lista con su estado |
| `C-35` | Reabrir vuelve al paso alcanzado | HU-6 / #2 | comportamiento | Reabrir una idea con pendientes activa el paso donde quedó, conservando lo escrito |
| `C-36` | Editar invalida el challenge | HU-6 / #3 | comportamiento | Idea aprobada + edición → `challenge` pasa a `sin-correr` |
| `C-37` | `localStorage` corrupto no rompe la app | borde | comportamiento | JSON inválido → la app arranca limpia y sigue usable |
| `C-38` | `localStorage` bloqueado avisa | borde | comportamiento | Con `localStorage` inaccesible, funciona en memoria **y avisa** que no persistirá |
| `C-39` | Datos de otra versión se ignoran | borde | comportamiento | Payload con `version` distinta → se ignora y arranca limpio |

### Grupo G — Diseño Pizarra (HU-7)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-40` | Los 13 tokens están, con sus valores (claro) | HU-7 / #1 | estructura | Los 13 tokens presentes en modo claro, con los valores exactos |
| `C-41` | Los 13 tokens están en modo oscuro | HU-7 / #1 | estructura | Los 13 tokens en modo oscuro, con los valores exactos |
| `C-42` | El acento oscuro NO es el claro | HU-7 / #2 | estructura | `--accent` oscuro es `#7aa8ff`, distinto del claro `#1f5fbf` |
| `C-43` | Contraste AA ≥4.5:1 en los textos | HU-7 / #3 | **umbral** | Recálculo **independiente** de text/bg, text/surface, muted/bg, muted/surface, accent/bg, accent/surface, on-accent/accent → **≥4.5** en ambos modos |
| `C-44` | Los estados no se distinguen solo por color | HU-7 / #4 | estructura | Cada estado de paso tiene **≥2 señales** independientes (texto/icono/forma) |
| `C-45` | Foco visible en lo interactivo | HU-7 / #5 | estructura | Todo elemento interactivo define `:focus-visible` con `outline` |
| `C-46` | La barra no desborda a 375px | HU-7 / #6 | **umbral** | A 375px: `scrollWidth <= 375` y el grupo de controles envuelve |
| `C-47` | La barra tampoco desborda a 1440px | HU-7 / #6 | **umbral** | A 1440px: sin desborde horizontal |
| `C-48` | Tipografía, radio y contenedor son de Pizarra | HU-7 / #7 | estructura | Inter en ambos roles; `--radius: 10px`; `--container: 1120px` |
| `C-49` | NO se reutilizó el selector de pieles | HU-7 / #8 | estructura | No hay control de cambio de piel ni las otras 9 pieles |

### Grupo H — Despliegue (HU-8)

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-50` | La config declara un Worker solo-assets | HU-8 / #4 | estructura | `wrangler.jsonc` tiene `assets.directory` y **no** tiene `main` |
| `C-51` | El directorio de assets es `./public` | HU-8 / #8 | estructura | `assets.directory === \"./public\"` — no `\".\"` |
| `C-52` | `public/` contiene solo lo publicable | HU-8 / #8 | estructura | En `public/` está `index.html` y **nada** de `docs/`, `tests/` ni la config |
| `C-53` | El comando local está documentado | HU-8 / #1 | empaquetado | El README indica `npx wrangler dev` y su puerto |
| `C-54` | El comando de despliegue está documentado | HU-8 / #2 | empaquetado | El README indica `npx wrangler deploy` y **quién** lo corre (Hermes) |
| `C-55` | Cero credenciales en el repo | HU-8 / #7 | estructura | Ningún archivo versionado contiene un token; `.env` y `.dev.vars` en `.gitignore` |
| `C-56` | El smoke verifica que lo publicado **ES** lo construido | HU-8 / #8 | **umbral** | El HTML servido en la URL real tiene el **mismo hash** que el del repo |

### Cobertura combinada

**`C-57..C-77`: los 7 pasos × (válido / vacío / incompleto)** — 21 combinaciones
declaradas por fórmula. Los casos `C-14`..`C-19` cubren el patrón general; la
propiedad que importa **no es cada celda**, es que **ninguna se escape**: el bloqueo
debe ser **uniforme**. Un paso que no valide es un hueco silencioso.

**`C-78..C-85`: las 4 reglas × (sola / combinada con otras)** — cubierto por
`C-29`..`C-33` y el barrido de las 16 combinaciones de las 4 reglas.

> **Por qué la fórmula y no 21 filas más:** el Coder debe generar el **barrido
> exhaustivo**; la matriz declara que existe y que debe ser completo. Escribir 21 filas
> a mano invita a saltear la 19.

## Trazabilidad

| Criterio (fase 3) | Casos | Tarea(s) | Test que lo cubre |
|---|---|---|---|
| HU-1 / #1 | `C-01`..`C-04` | T-1 | `C-01 · …` |
| HU-1 / #2 | `C-05` | T-1 | `C-05 · …` |
| HU-1 / #3 | `C-06` | T-1 | `C-06 · …` |
| HU-2 / #1 | `C-07` | T-2 | `C-07 · …` |
| HU-2 / #2 | `C-08`..`C-10` | T-2 | `C-08 · …` |
| HU-2 / #3 | `C-11`, `C-12` | T-2 | `C-11 · …` |
| HU-2 / #4 | `C-13` | T-2 | `C-13 · …` |
| HU-3 / #1..#4 | `C-14`..`C-19` | T-3 | `C-14 · …` |
| HU-4 / #1..#3 | `C-20`..`C-24` | T-4 | `C-20 · …` |
| HU-5 / #1..#5 | `C-25`..`C-33` | T-5 | `C-25 · …` |
| HU-6 / #1..#3 | `C-34`..`C-39` | T-6 | `C-34 · …` |
| HU-7 / #1..#8 | `C-40`..`C-49` | T-7 | `C-40 · …` |
| HU-8 / #1..#8 | `C-50`..`C-56` | T-8 | `C-50 · …` |

---

**Gate G2:** todo criterio tiene ≥1 caso **con observable esperado**, todo caso nace
de un criterio, toda tarea apunta a ≥1 caso, cada ADR tiene alternativas descartadas,
y **existe la sección de Despliegue** que distingue **local** de **cloud** y declara
el límite del plan que podría romper el diseño.
