# 02 — Análisis

> Fase 2. Dueño: **Product Owner**. Entender el problema **antes** de proponer
> nada. Es válido y esperado terminar en preguntas.

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07

## El problema en una frase

**Una idea de producto se pierde o se vuelve un proyecto fallido por falta de
definición, no por falta de idea** — y quien tiene la idea no tiene un proceso que
lo obligue a pensarla antes de construirla.

## ¿Quién lo sufre y con qué frecuencia?

**Quien lo sufre:** el propio usuario (constructor/consultor), y cualquiera que
genere ideas de productos apalancados en agentes.

**Con qué frecuencia:** cada vez que aparece una idea — o sea, seguido. El problema
no es capturar la idea (eso son dos minutos en una nota). El problema es **el
momento siguiente**: nada obliga a especificarla, y la idea entra al backlog ya
diluida.

**Evidencia de primera mano, no hipótesis:** acabamos de vivir exactamente este
fallo en `MyHermesTest`. El requerimiento original pedía 10 pieles; el recorte a 3
se decidió por complejidad, y **lo diferido se habría perdido** sin un registro
explícito. Y en el Ciclo 2, un diseño que escribió *«Comportamiento (o hueco
declarado)»* se autorizó a no verificar. **Las definiciones vagas no fallan de
golpe: fallan en silencio, seis semanas después.**

## ¿Qué pasa si no hacemos nada?

El costo **no es cero**, y es concreto:

1. **Ideas perdidas.** No hay registro; lo que no se anota, se olvida.
2. **Ideas zombie.** Las que sobreviven avanzan sin definición y consumen
   construcción real antes de revelar que no estaban pensadas — el caso más caro.
3. **El proceso se aplica de memoria.** Hoy el usuario tiene un proceso bueno (el
   harness) y depende de que un operador lo recuerde y lo respete. Sin herramienta,
   la calidad del proceso depende de la disciplina del día.

## Preguntas abiertas

> **Esto es obligatorio.** Lo que no sabemos, explícito.

1. **¿Quién usa la app?** ¿Solo el usuario, o un equipo? Determina si hace falta
   identidad, compartir y concurrencia — o nada de eso.
2. **¿Dónde viven las ideas?** ¿Local, o en la nube? Determina si hay backend.
3. **¿«Agente» es un LLM real?** Una app estática no puede guardar una API key sin
   exponerla. Hay una decisión de arquitectura o un corte en etapas.
4. **¿El framework es el del harness, o es configurable?** Si es configurable,
   el producto es más grande y más abstracto; si es fijo, es más chico y más útil ya.
5. **¿Qué significa «listo para avanzar»?** ¿El challenge puede bloquear de verdad,
   o solo advertir? (En este harness, un gate que nunca rechaza se elimina.)

## Supuestos

> Lo que estamos dando por cierto sin haberlo verificado.

- **S-1.** El valor está en **el proceso**, no en la captura. Anotar una idea ya es
  trivial; lo que falta es que el proceso **no deje avanzar a una idea sin definir**.
- **S-2.** El usuario es **uno solo** (yo), al menos en la primera etapa. Un
  registro compartido no es lo que hace útil a la herramienta.
- **S-3.** El framework detrás **es el del harness**: un proceso por fases, con
  pasos determinísticos y un punto de rechazo. No hay que inventar un framework
  nuevo — hay que **productizar el que ya funciona**.
- **S-4.** El «agente que hace challenge» puede ser, en la primera etapa, un
  **challenger determinístico por reglas**: verifica que cada paso esté completo y
  produzca objeciones concretas. No necesita ser un LLM para **hacer el trabajo
  estructural** de impedir que se avance con huecos.
- **S-5.** Un POC estático (sin backend) alcanza para validar la hipótesis, igual
  que en `MyHermesTest`.

## Alcance propuesto

- Un **wizard por pasos** donde cada paso pide una pieza de especificación concreta
  y **no deja avanzar con el paso incompleto**.
- Un **framework determinístico y visible**: el usuario ve en qué paso está y cuál
  sigue. Sin pasos ocultos ni criterio del día.
- Un **paso de referencias obligatorio**: hay que buscar cómo lo resuelven otros
  antes de seguir. Es el «benchmark rápido» del PO, hecho exigible.
- Un **challenger determinístico**: reglas que atacan lo escrito y producen
  objeciones concretas, con capacidad de **bloquear el avance**.
- **Registro de ideas**: lo creado queda guardado y **reabrible** para seguir
  especificándolo después.
- La idea se guarda **completa y estructurada**, no como texto libre.

## Anti-alcance (lo que NO entra)

> Deliberadamente fuera. Tan importante como el alcance.

- **No es un gestor de proyectos** ni un tablero Kanban. No hace seguimiento de
  ejecución: su dominio termina donde empieza la construcción.
- **No construye nada.** No genera código ni delega a agentes. Define, no ejecuta.
- **No es un chat.** Es un wizard: el proceso manda, no la conversación.
- **No es multiusuario** en esta etapa (S-2).
- **No sincroniza con el harness** ni con GitHub. La salida es un artefacto, no una
  integración.
- **No decide por el usuario.** El challenger objeta; la decisión sigue siendo de él.
- **No evalúa mercado ni viabilidad financiera.** Eso es otra disciplina: acá se
  exige **claridad de definición**, no validación de negocio.

## Riesgos

- **R-1 · Confundir rigor con burocracia.** Si el wizard se siente un formulario
  largo, el usuario lo abandona y volvemos al problema. *Mitigación:* pasos cortos,
  y un paso se justifica solo si su ausencia produce un hueco real.
- **R-2 · El challenger se vuelve un sello de goma.** Si aprueba todo, no sirve —
  es la regla de poda del harness. *Mitigación:* el challenger tiene que **rechazar
  de verdad**, y eso es verificable con casos que deben fallar.
- **R-3 · Sobre-construir la primera etapa.** Wizard + framework + referencias +
  challenger + registro es bastante para un ciclo. *Mitigación:* corte en etapas en
  la fase 3, con lo diferido registrado (no borrado).
- **R-4 · «Determinístico» se degrada en «lo que el modelo diga».** Si el challenger
  pasa a ser un LLM sin reglas, el proceso deja de ser reproducible. *Mitigación:*
  las reglas primero; el LLM, si entra, es una capa encima.

## Veredicto

- [x] **Vale la pena** — el costo de la inacción es concreto y ya lo vivimos; el
      alcance es chico si se recorta bien; y además **ejercita dos capacidades del
      harness que nunca se usaron** (`new-project.sh` y la matriz de casos).
- [ ] No vale la pena → razón:
- [ ] Todavía no → qué falta:

---

**Gate G1a:** hay ≥1 pregunta abierta o supuesto declarado, hay anti-alcance, hay
veredicto con razón.

---

# Análisis 2 — Persistencia en base de datos (Ciclo 2)

> Fase 2 de la **Idea 2**. Dueño: PO. Todo lo técnico de acá está **verificado
> contra la documentación de Cloudflare el 2026-10-07**, no recordado.

## El problema en una frase

**Las ideas viven solo en el navegador de una máquina**: borrar los datos del
sitio, cambiar de equipo o usar otro navegador las pierde — y una idea registrada
que desaparece es exactamente el fallo que la app existe para evitar.

## ¿Quién lo sufre y con qué frecuencia?

El autor. Frecuencia: cada vez que cambia de equipo, de navegador, o limpia los
datos del sitio. No es diario, y por eso es peligroso: **no se nota hasta que ya
pasó**.

## ¿Qué pasa si no hacemos nada?

La app queda como POC de un solo navegador. El valor declarado —«registrar ideas
que persisten»— depende de un almacenamiento que **no sobrevive al navegador**.
Costo: bajo en volumen, alto en credibilidad del producto.

## Dudas resueltas

### D-1 · ¿Qué ofrece Cloudflare para persistir datos, y cuál es «la más pequeña»?

Verificado en `developers.cloudflare.com` (D1 *limits* y *pricing*, Workers KV
*limits*, Durable Objects *limits* y *pricing*), consultado **2026-10-07**:

| Opción | Qué es | Plan Free | ¿Es una base de datos? |
|---|---|---|---|
| **D1** | SQLite serverless, SQL real | 5 M filas leídas/día · 100.000 escritas/día · **5 GB** por cuenta · 10 BD por cuenta · **500 MB máximo por BD** · 50 consultas por invocación · Time Travel 7 días | **Sí** — SQL |
| **Workers KV** | almacén clave-valor | 100.000 lecturas/día · **1.000 escrituras/día** · 1 escritura/segundo por clave · 1 GB | No — clave-valor |
| **Durable Objects (SQLite)** | SQL, pero **por objeto** | 100.000 requests/día · 13.000 GB-s/día · 5 GB | Sí, pero por entidad |
| **R2** | almacenamiento de objetos | 10 GB | No — es S3 |

**Decisión: D1.** Es **la más pequeña que sigue siendo una base de datos**:
**500 MB por base** en el plan Free está órdenes de magnitud por encima de lo que
una tabla de ideas puede ocupar, y es **SQL real** (insertar, listar, filtrar) sin
inventar nada encima.

**Por qué NO las otras:**

- **KV no es una base de datos**, es clave-valor. Y su techo de **1.000 escrituras
  por día** es la trampa conocida del plan Free: cualquier patrón que escriba por
  request lo agota antes del mediodía. Guardar una idea *es* una escritura, así que
  pasaría — pero se paga con **no poder consultar ni filtrar con SQL**.
- **Durable Objects** sí es una base de datos, pero es **por entidad** y existe
  para **coordinación y estado fuertemente consistente**. Para «guardar las ideas
  de una persona» es la opción **más cara y más compleja** de las tres.
- **R2** guarda archivos, no filas consultables.

### D-2 · ¿Se puede usar D1 en el plan gratuito, sin tarjeta?

Sí. D1 es parte del plan **Workers Free** y no pide tarjeta.

### D-3 · ¿Qué pasa cuando se agota la cuota?

Desde el **2026-09-01** Cloudflare **endureció el corte**: al alcanzar el límite
diario las consultas **fallan** con error explícito hasta las 00:00 UTC. Los datos
**no se borran**; la app no los puede tocar hasta el reset. Es una **ventana de
caída declarada**, no una pérdida silenciosa.

### D-4 · ¿Cuánto cambia la arquitectura? ← **el hallazgo del ciclo**

**Mucho, y en un punto que ya estaba decidido.** El diseño vigente eligió un
**Worker solo-assets, sin `main`**, y de ahí salió una afirmación explícita:
**«cero límites de plan en Etapa 1»** (`ADR-002`, `ADR-006`, y el *Fuente de verdad*
de HU-8).

Una base de datos **exige un binding y, por lo tanto, `main`**: el Worker pasa a
**ejecutar código**. Con eso, los límites que hoy **no aplican**, **pasan a
aplicar**: 100.000 requests/día, **10 ms de CPU** por invocación y **50 consultas
por invocación** en Free.

→ **Consecuencia de proceso:** **una premisa del diseño aprobado quedó muerta.**
El trabajo que la asume se **detiene** y la decisión se corrige con un **ADR nuevo
(`ADR-007`) que supersede**, no se parchea en silencio (regla v0.29).

### D-5 · ¿De quién son las ideas que quedan en la base?

El producto **no tiene identidad** (S-2: un solo usuario; el multiusuario está
diferido). Pero **una base de datos es del servidor, no del navegador**: sin
identidad, **cualquiera que abra la URL ve todas las ideas guardadas**. Eso no es
una decisión técnica, es de producto — **sube al usuario en G1**.

## Supuestos

- **S-6.** La base **reemplaza** a `localStorage` como almacenamiento de verdad;
  `localStorage` puede quedarse como caché del borrador en curso.
- **S-7.** El alcance es **una tabla** (`ideas`), sin cuentas ni identidad.
- **S-8.** Se guarda la idea **completa y estructurada** (los 7 pasos + veredicto),
  no un puntero.
- **S-9.** **No hay migración** de lo ya guardado en el navegador: es un POC y no
  hay datos que valga la pena rescatar.

## Alcance propuesto

- Una **tabla `ideas`** en **D1**, con los campos de los 7 pasos y el veredicto.
- **Guardar**, **listar** y **reabrir** leyendo y escribiendo en D1 — no en el navegador.
- Los **dos entornos definidos**: local (`wrangler dev`, D1 emulada, sin cuenta) y
  Cloudflare (binding real).
- El Worker pasa de **forma A** (solo assets) a **forma B/C** (`main` + binding),
  con el **presupuesto de CPU** declarado.

## Anti-alcance (lo que NO entra)

- **Identidad, cuentas o login.** Sin usuarios, el acceso es el de la URL.
- **Multiusuario, compartir, permisos.**
- **Migrar** ideas desde `localStorage`.
- **Búsqueda, filtros, consultas complejas** — se listan y se abren.
- **Cambiar de base** (KV / DO / R2): la decisión es D1 y está fundada arriba.

## Riesgos

- **R-5 · Ideas públicas sin querer.** Sin identidad, la base es de lectura abierta
  para quien tenga la URL. *Mitigación:* declararlo y decidirlo en G1.
- **R-6 · El diseño anterior queda contradictorio.** `ADR-002`/`ADR-006` afirman
  «cero límites» y el README del producto lo repite. *Mitigación:* `ADR-007` que
  supersede + corrección de la sección *Despliegue* de `04-DISENO.md`.
- **R-7 · Los 10 ms de CPU.** El camino del request ahora incluye D1 (que es I/O y
  no cuenta como CPU), pero **validar y serializar sí consume CPU**.
  *Mitigación:* medirlo en el diseño, no suponerlo.

## Veredicto

- [x] **Vale la pena** — es el ítem que la iteración anterior dejó **explícitamente
      fuera**, y ahora tiene razón para entrar. Además fuerza dos cosas que el
      harness todavía no probó: un requerimiento que llega **a mitad de la
      implementación**, y la **corrección de un ADR por cambio de premisa**.
- [ ] No vale la pena → razón:
- [ ] Todavía no → qué falta:

---

**Gate G1a:** cada duda quedó resuelta por benchmark verificado o escalada al
usuario (D-5); hay supuestos declarados, anti-alcance explícito y veredicto con razón.
