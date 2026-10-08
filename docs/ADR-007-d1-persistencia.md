# ADR-007 — Persistencia en D1, y la muerte de «cero límites de plan»

- **Fecha:** 2026-10-07
- **Estado:** **aceptado** — **supersede parcialmente** a `ADR-002` y `ADR-006`
- **Decisor:** Arquitecto, con la definición de HU-9 aprobada por el PO
- **Ciclo:** 2
- **Fuente:** verificación propia contra `developers.cloudflare.com` (D1 *limits* y
  *pricing*, Workers KV *limits*, Durable Objects *limits* y *pricing*), 2026-10-07

## Por qué existe este ADR

HU-9 pide **persistir las ideas en una base de datos** del servidor. Eso **no agrega
una feature a un diseño vigente: mata una premisa del diseño vigente.**

`ADR-002` (Worker solo-assets) y `ADR-006` (Cloudflare Workers) construyeron su
razonamiento sobre una afirmación explícita, repetida en tres lugares:

> «Sin `main`, **ningún request ejecuta código**: no hay cuota que agotar ni
> presupuesto de CPU que romper → **cero límites de plan en Etapa 1**.»

Esa afirmación era **correcta** — para un artefacto **sin persistencia remota**. Una
base de datos **exige un binding**, y un binding **exige `main`**. En el momento en
que el Worker ejecuta código, los tres límites que el diseño decía «no aplican»
**pasan a aplicar**.

> **Regla de proceso aplicada (v0.29):** cuando cambia una premisa del diseño, se
> **para** el trabajo que la asume, se corrige el diseño y se re-despacha. El ADR se
> **supersede con uno nuevo**; no se parchea la afirmación en silencio. Un artefacto
> coherente con una premisa muerta es **peor que ninguno: parece válido**.

## Verificación — la opción más pequeña que es una base de datos

| Opción | Qué es | Plan Free | ¿Es una base de datos? |
|---|---|---|---|
| **D1** | SQLite serverless, SQL real | 5 M filas leídas/día · 100.000 escritas/día · **5 GB**/cuenta · 10 BD/cuenta · **500 MB máx por BD** · 50 consultas por invocación · Time Travel 7 días | **Sí** |
| **Workers KV** | almacén clave-valor | 100.000 lecturas/día · **1.000 escrituras/día** · 1/segundo por clave · 1 GB | No |
| **Durable Objects (SQLite)** | SQL, **por objeto** | 100.000 requests/día · 13.000 GB-s/día · 5 GB | Sí, por entidad |
| **R2** | almacenamiento de objetos | 10 GB | No |

**Hallazgo relevante:** desde el **2026-09-01** Cloudflare **endureció el corte de
D1**: al agotar el límite diario las consultas **fallan** hasta las 00:00 UTC. Los
datos **no se borran**; la app no los puede tocar. Es una **ventana de caída**, y el
diseño tiene que declararla en vez de descubrirla.

## Decisión

1. **D1** como almacén de verdad. Es la **más pequeña que sigue siendo una base de
   datos**: 500 MB por base está órdenes de magnitud por encima de lo que una tabla
   de ideas puede ocupar, y es **SQL real** (insertar, listar, filtrar) sin inventar
   nada encima.
2. **Un binding `DB`**, y por lo tanto el Worker pasa de **forma A** (solo assets) a
   **forma B** (`main` + `assets`).
3. **El script del Worker es un archivo plano**, `src/worker.js`, ESM, **sin build y
   sin TypeScript**: `wrangler` lo empaqueta. `ADR-001` («sin build») sigue vigente;
   lo que cambia es que ahora hay **dos** artefactos en vez de uno: el cliente
   (`public/index.html`) y el Worker.
4. **Una sola tabla, `ideas`**, con migración versionada (`migrations/0001_ideas.sql`).
5. **`localStorage` no desaparece del todo:** queda como **borrador** del paso en
   curso, para que un fallo de la base **no borre lo que el usuario escribió**. La
   base es la fuente de verdad; el borrador es una red de seguridad.
6. **El acceso es abierto:** sin identidad, quien tenga la URL ve las ideas (decidido
   por el usuario en G1, Ciclo 2). **Declarado, no descubierto.**

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| **Workers KV** | **No es una base de datos**, es clave-valor. Su techo de **1.000 escrituras/día** es la trampa conocida del plan Free, y encima no permite consultar ni filtrar con SQL: listar ideas exigiría leer y filtrar en el cliente |
| **Durable Objects (SQLite)** | Sí es una base de datos, pero es **por entidad** y existe para **coordinación y estado fuertemente consistente**. Para «guardar las ideas de una persona» es la opción **más cara y más compleja** de las tres |
| **R2** | Guarda objetos, no filas consultables |
| **Seguir solo en `localStorage`** | Es lo que HU-9 existe para corregir: la idea se pierde al cambiar de equipo o navegador |
| **D1 llamada desde el navegador (HTTP API de D1)** | Exigiría una **credencial en el cliente**, que es una credencial **pública**. Es la misma razón por la que la Etapa 2 (el agente) no puede vivir en un sitio estático |
| **Un Worker aparte solo para la API** | Dos despliegues, dos URLs y CORS entre ellas — para terminar sirviendo un solo producto. La forma B del Worker hace exactamente eso con un solo deploy |
| **Migrar a un backend/BD externa (Supabase, Postgres gestionado)** | Deja el servicio preferido del usuario y suma una credencial, una cuenta y un proveedor. D1 está en el mismo plan y no pide nada nuevo |

## Consecuencias

**Positivas**

- **SQL real** sobre una tabla, con migración versionada y Time Travel (7 días en Free).
- **Cero costo nuevo:** D1 es parte del plan Workers Free, sin tarjeta.
- **Local sigue sin cuenta ni token:** `wrangler dev` **emula D1** offline. La regla
  «el Coder despliega en local, solo Hermes despliega al cloud» (`ADR-004`) **no
  cambia**, y el Coder sigue sin necesitar credenciales.
- Los assets siguen siendo **gratis e ilimitados**; solo se factura lo que toca el script.

**Negativas / costo asumido — y hay que leerlas, porque son el punto de este ADR**

- **Mueren tres afirmaciones del diseño vigente:** «cero límites de plan»,
  «presupuesto de CPU: cero» y «bindings: ninguno». **Ahora aplican:**
  **100.000 requests/día**, **10 ms de CPU por invocación** y **50 consultas por
  invocación** en Free.
- **El diseño paga un costo de administración** que la forma A evitaba: un binding,
  una migración y un artefacto más que mantener y probar.
- **Hay dos capas de datos** (borrador local + base remota). Es una red de seguridad,
  pero también un lugar donde dos estados pueden divergir; el diseño tiene que decir
  **cuál manda** (manda la base).
- **El acceso es abierto** mientras no haya identidad.
- **Una ventana de caída real:** si se agota la cuota diaria de D1, la app **no puede
  guardar ni listar** hasta las 00:00 UTC — y desde 2026-09-01 el corte es **duro**.

**Qué se vuelve difícil después de esto**

- Volver a la forma A (solo assets) ya no es gratis: hay que **borrar** HU-9, no
  desactivarla.
- Meter **identidad** toca el esquema de la tabla y todas las consultas: es un ciclo
  propio, no un ajuste.
- **Disparador de revisión:** si la cuota diaria se agota de verdad (no en teoría), o
  si entra identidad, o si el script empieza a hacer trabajo pesado, este ADR se revisa.
- **Presupuesto de CPU:** leer/escribir en D1 es **I/O y no consume CPU de la
  invocación**; lo que sí consume es **validar y serializar**. El diseño no lo supone:
  el smoke lo verifica contra el edge (`C-97`).

## Cómo se verifica

- `C-50` — **SUPERADO**: decía «`wrangler.jsonc` **no** tiene `main`». Ahora tiene que
  tenerlo. El caso se reemplaza por `C-89`.
- `C-89`..`C-97` — la config con `main` y el binding `DB`, la migración versionada,
  guardar/listar contra la base **local emulada**, la **persistencia entre requests**
  en la URL real, el fallo **declarado** al agotar la cuota, el borrador que sobrevive,
  `ADR-007` presente, y el presupuesto de CPU medido contra el edge.
- El **smoke del Ciclo 1** (`C-56`) sigue valiendo: lo publicado tiene que ser lo
  construido. Se le **suma** que lo guardado **sobreviva a un redeploy**.
