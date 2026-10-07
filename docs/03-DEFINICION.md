# 03 — Definición

> Fase 3. Dueño: **Product Owner**. Convertir el problema en una spec
> **verificable**. Termina con el gate humano.

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07
- **Iteración:** Etapa 1
- **Revisión 2:** se agregó **HU-2 (valor y métrica)**, que faltaba. El valor y su
  medición estaban mencionados solo como regla *diferida* — al revés: una idea que
  no dice qué cambia y cómo se mide **no está definida**, y no puede quedar para
  después.
- **Revisión 3:** se agregó **HU-7 (diseño Pizarra)** por pedido del usuario:
  reutilizar el diseño del proyecto anterior. Ver `DISENO-PIZARRA.md` — es la
  fuente de verdad de los tokens, y **arrastra un defecto conocido** (H-1) que hay
  que corregir, no heredar.

---

## El framework: los 7 pasos

> El wizard ES el framework. Se enumeran acá porque el proceso determinístico es
> parte del contrato: el usuario ve siempre los mismos pasos, en el mismo orden.

| # | Paso | Qué exige |
|---|---|---|
| 1 | **Idea** | Qué es, en una frase |
| 2 | **Problema** | Quién lo sufre y con qué frecuencia |
| 3 | **Valor y métrica** | Qué cambia, para quién, **y cómo se mide** |
| 4 | **Referencias** | Cómo lo resuelven otros (≥2, con fuente y conclusión) |
| 5 | **Alcance** | Qué entra y qué explícitamente no |
| 6 | **Criterio de terminado** | Cómo sé que la idea quedó definida |
| 7 | **Challenge** | El veredicto del challenger sobre todo lo anterior |

## Historias de usuario

### HU-1 · Registrar una idea paso a paso

**Como** persona con una idea de producto apalancado en agentes
**quiero** registrarla en un wizard que me pida la especificación por partes
**para** no perderla y no construirla a ciegas

**Criterios de aceptación:**

- **La FORMA del wizard: una barra HORIZONTAL de pasos.** Los 7 pasos van **en una
  fila**, uno al lado del otro — como cualquier wizard. No una pila de tarjetas a
  ancho completo. Cada paso muestra su número y su nombre; el activo se destaca; los
  completados se distinguen de los bloqueados. *(Corregido: la v1 no lo decía y el
  resultado fue una pila vertical que pasó los 6 casos. La forma es requisito, no
  gusto — si no se pide, no se verifica.)*

- **Dado** que abro la app sin ideas previas
  **cuando** carga
  **entonces** veo **el formulario del paso activo** (el primero) y **sólo ese**;
  en la **barra de arriba** están los 7 pasos con el actual destacado y la cantidad
  total indicada (**7**)
  *(Corregido: la v1 decía «los siguientes visibles pero inaccesibles» y eso produjo
  siete formularios apilados, seis atenuados. **Un wizard muestra un paso por vez** —
  el progreso lo lleva la barra, no una pila. El PO lo rechazó al verlo.)*

- **Dado** que estoy en un paso
  **cuando** escribo la respuesta y confirmo
  **entonces** avanzo al paso siguiente y el anterior queda marcado como completo

- **Dado** que completé todos los pasos
  **cuando** confirmo el último
  **entonces** la idea queda **registrada** y aparece en la lista de ideas

### HU-2 · Definir el valor del producto y cómo se mide

**Como** autor de la idea
**quiero** que el proceso me obligue a decir **qué cambia y cómo lo voy a medir**
**para** no construir algo cuyo éxito nadie sabría reconocer

**Criterios de aceptación:**

- **Dado** que llego al paso de valor
  **cuando** lo veo
  **entonces** se me piden **tres cosas separadas**: qué cambia, para quién, y
  **cómo se mide**

- **Dado** el campo de métrica
  **cuando** escribo algo sin una cantidad verificable (p. ej. «mejorar la
  experiencia», «que sea más fácil», «más rápido»)
  **entonces** **no avanzo**: se me exige que la métrica diga **qué se mide**,
  **cómo se obtiene** y **cuál es el valor objetivo**

- **Dado** el campo de valor
  **cuando** escribo una descripción del producto en vez de un cambio
  (p. ej. «un wizard con pasos» en lugar de «una idea deja de perderse»)
  **entonces** **no avanzo**: se me pide el **cambio**, no la función

- **Dado** que especifiqué el valor
  **cuando** miro el paso
  **entonces** puedo distinguir **de quién es el cambio** (el usuario concreto que
  se beneficia), no «los usuarios» en general

### HU-3 · El proceso no deja avanzar con huecos

**Como** autor de la idea
**quiero** que el framework me **impida** avanzar con un paso incompleto
**para** que la definición no dependa de mi disciplina del día

**Criterios de aceptación:**

- **Dado** un paso sin responder (vacío o solo espacios)
  **cuando** intento avanzar
  **entonces** **no avanzo**, y veo un mensaje que dice **qué falta**, no un
  «campo requerido» genérico

- **Dado** un paso cuya respuesta no alcanza el mínimo que el framework exige para
  ese paso
  **cuando** intento avanzar
  **entonces** **no avanzo** y el mensaje **nombra el requisito concreto** que no
  se cumple

- **Dado** que no avanzo por un hueco
  **cuando** completo exactamente lo que faltaba
  **entonces** avanzo

- **Dado** cualquier paso completado
  **cuando** vuelvo hacia atrás y lo edito dejándolo incompleto
  **entonces** los pasos posteriores quedan **invalidados**

### HU-4 · Buscar referencias antes de seguir

**Como** autor de la idea
**quiero** que el proceso me **obligue** a buscar cómo lo resuelven otros
**para** no diseñar en el vacío

**Criterios de aceptación:**

- **Dado** que avanzo por el wizard
  **cuando** llego al paso de referencias
  **entonces** se me pide buscar y registrar referencias, con una instrucción de
  qué cuenta como referencia válida

- **Dado** el paso de referencias
  **cuando** intento avanzar sin registrar **al menos 2** referencias, cada una con
  **fuente** y **qué se toma de ella**
  **entonces** **no avanzo** y se me indica cuántas faltan y qué le falta a cada una

- **Dado** que registro una referencia sin indicar qué se toma de ella
  **cuando** intento avanzar
  **entonces** **no avanzo**: una referencia sin conclusión no es una referencia

### HU-5 · El challenger objeta las definiciones

**Como** autor de la idea
**quiero** que un agente ataque lo que escribí **antes** de dar la idea por definida
**para** descubrir los huecos yo mismo, temprano

**Criterios de aceptación:**

- **Dado** que completé los pasos
  **cuando** pido el challenge
  **entonces** recibo **objeciones concretas**, cada una indicando **a qué paso se
  refiere** y **qué cambiaría**

- **Dado** una definición que **no** satisface las reglas del challenger
  **cuando** pido el challenge
  **entonces** el veredicto es **RECHAZADO** y **la idea NO puede marcarse como
  definida** hasta resolver las objeciones

- **Dado** una definición que **sí** satisface todas las reglas
  **cuando** pido el challenge
  **entonces** el veredicto es **APROBADO** y la idea puede marcarse como definida

- **Dado** un veredicto por reglas
  **cuando** lo veo
  **entonces** puedo ver **qué regla produjo cada objeción** (el criterio es
  auditable, no una opinión)

- **Dado** una idea sin paso de valor completo
  **cuando** pido el challenge
  **entonces** **RECHAZADO**, con una objeción que nombra **R2 (valor o métrica)**

### HU-6 · Guardar y reabrir una idea

**Como** autor
**quiero** que mis ideas persistan y se puedan seguir especificando después
**para** que registrar no sea un acto único que se pierde al cerrar

**Criterios de aceptación:**

- **Dado** que registré una idea
  **cuando** recargo la app
  **entonces** la idea sigue en la lista, con su estado y su paso alcanzado

- **Dado** una idea con pasos pendientes
  **cuando** la reabro
  **entonces** vuelvo al paso donde quedó, **conservando** lo ya escrito

- **Dado** que edito una idea ya registrada
  **cuando** guardo
  **entonces** el cambio persiste y su veredicto de challenge **se invalida**

## HU-7 · La app usa el diseño Pizarra del proyecto anterior

**Como** autor
**quiero** que Crisol se vea con el **diseño Pizarra** que ya validé en MyHermesTest
**para** no empezar el lenguaje visual de cero y tener una identidad consistente
entre mis herramientas

**Fuente de verdad:** `DISENO-PIZARRA.md`. Los valores de ese documento **mandan**;
si el Coder se aparta de un token, el diseño está mal aunque se vea bien.

> **Alcance del requisito (aclaración del usuario).** El diseño Pizarra es para **el
> producto** — la app Crisol. **El tablero de progreso queda como está**: su diseño es
> del harness, no se re-versiona, y no es parte de esta historia. El Coder no toca
> `progreso.html`.

**Criterios de aceptación:**

- **Dado** que abro la app
  **cuando** inspecciono los estilos
  **entonces** los **13 tokens** de Pizarra están presentes con sus **valores
  exactos**, en modo claro y en modo oscuro

- **Dado** el modo oscuro
  **cuando** comparo el acento con el del modo claro
  **entonces** **no es el mismo valor**: es `#7aa8ff`, un azul rediseñado, no una
  inversión

- **Dado** cualquier texto de la interfaz
  **cuando** se mide su contraste
  **entonces** cumple **AA ≥ 4.5:1**, y el cálculo lo hace una **implementación
  independiente** de la que declaró los valores

- **Dado** los estados de un paso (bloqueado / disponible / completo / inválido)
  **cuando** los distingo
  **entonces** **no se distinguen solo por color**: hay al menos **dos señales
  independientes** (texto, icono, forma o contenido), porque `--border` da 1.35:1
  y el color solo sería inaccesible

- **Dado** cualquier elemento interactivo
  **cuando** lo enfoco con el teclado
  **entonces** tiene **foco visible** (`outline: 2px solid var(--accent)`)

- **Dado** la barra superior a **375 px**
  **cuando** miro la pantalla
  **entonces** **nada desborda** horizontalmente: el grupo de controles **envuelve**
  (corrige el hallazgo **H-1** del proyecto anterior)

- **Dado** que comparo Crisol con MyHermesTest
  **cuando** miro ambos lado a lado
  **entonces** se reconocen como **el mismo sistema visual** (tipografía, radio,
  sombra, superficies), aunque el contenido y la estructura sean distintos

- **Dado** el diseño Pizarra
  **cuando** reviso qué se reutilizó
  **entonces** **no** se reutilizó la estructura de la landing, ni el selector de
  pieles, ni las otras 9 pieles

## HU-8 · Despliegue local y en Cloudflare

**Como** autor
**quiero** que Crisol corra en mi máquina **y** se despliegue en Cloudflare, con los
dos caminos definidos
**para** no descubrir en el momento del deploy qué falta, y para que «en mi máquina
funciona» no sea la única garantía

**Fuente de verdad:** la skill `cloudflare-architecture` y la sección **Despliegue**
de `04-DISENO.md`. **El diseño no pasa G2 sin ella.**

**Criterios de aceptación:**

- **Dado** el repo clonado en una máquina sin nada instalado más que Node
  **cuando** sigo el comando de desarrollo documentado
  **entonces** la app corre localmente y puedo recorrer el wizard

- **Dado** que quiero publicar
  **cuando** ejecuto el comando de despliegue documentado
  **entonces** la app queda accesible en una URL de Cloudflare

- **Dado** el diseño
  **cuando** leo la sección de despliegue
  **entonces** declara **explícitamente qué corre en local y qué NO corre igual**,
  en vez de dejar la diferencia como supuesto

- **Dado** el diseño
  **cuando** reviso la forma elegida del Worker
  **entonces** está justificada, y una app estática sin backend **no** paga
  invocaciones por servir assets

- **Dado** el plan gratuito de Cloudflare
  **cuando** el diseño enumera sus límites
  **entonces** nombra **el límite que podría romper este diseño** y **qué pasa**
  cuando se agota

- **Dado** que hay que volver atrás tras un deploy malo
  **cuando** ejecuto el rollback documentado
  **entonces** vuelve la versión anterior **completa** (HTML, CSS y assets juntos)

- **Dado** el repositorio
  **cuando** busco credenciales
  **entonces** **no hay ninguna**: los secretos viven en `.dev.vars` (local, en
  `.gitignore`) o en `wrangler secret` (producción), y nada en el directorio de
  assets

- **Dado** el diseño
  **cuando** reviso el directorio de assets
  **entonces** declara si hay algo ahí que **no** debería ser público

- **Dado** que hay que verificar el comportamiento
  **cuando** se corre la **suite**
  **entonces** corre **en local** (`wrangler dev`), sin red y sin gastar cuota

- **Dado** un deploy recién hecho
  **cuando** se corre el **smoke test**
  **entonces** verifica contra **la URL real**: responde, los assets cargan, y la
  versión publicada es la construida

- **Dado** el reparto de responsabilidades
  **cuando** se despliega
  **entonces** **el Coder solo despliega en local** (`wrangler dev`, sin cuenta) y
  **solo Hermes despliega en Cloudflare** — y **el token nunca está en el entorno
  del Coder**

## Etapas

> **Obligatorio si el diseño tiene complejidad combinada.** Sí la hay.

**Ejes que se multiplican:** **7 pasos × (completo / incompleto / inválido)**,
más **4 reglas de challenger × (pasa / falla)**, más **el estado de cada idea**
(en curso / definida / rechazada). Es la misma forma que 10 pieles × 2 modos:
no es más trabajo, es **más superficie donde algo puede fallar en silencio**.

**Etapa 1 (este ciclo) — valor visible rápido:**

- Qué entra:
  - El **wizard completo con los 7 pasos**, visibles y en orden
  - **Bloqueo real** por paso incompleto o inválido (HU-3), con mensaje que nombra
    el requisito
  - **El paso de valor y métrica con sus exigencias** (HU-2) — el usuario debe
    declarar qué cambia, para quién, **y cómo se mide con un valor objetivo**
  - El **paso de referencias** con sus mínimos (HU-4)
  - El **challenger determinístico con 4 reglas** (HU-5):
    - **R1** — sin problema: no dice quién lo sufre
    - **R2** — **sin valor o sin métrica medible** (incluye la métrica vaga:
      «mejorar la experiencia» no es una métrica)
    - **R3** — sin referencias, o referencias sin conclusión
    - **R4** — sin criterio de terminado
  - **Persistencia local** y reapertura (HU-6)
- Por qué esto prueba el mecanismo completo: el mecanismo es **«el proceso no deja
  avanzar con huecos, y un challenger lo verifica y puede rechazar»**. Con 4 reglas
  —una por cada gap estructural— el mecanismo se prueba entero.
- Sin backend, sin cuentas, sin LLM. Persistencia en `localStorage`.

**Diferido a la Etapa 2:**

- Qué queda fuera:
  - **Agente LLM real** para el challenge (necesita backend o key: una app estática
    no puede guardar una credencial sin exponerla)
  - **Reglas 5..N** (apalancamiento real en agentes, riesgo de dependencia del
    proveedor, coste de construcción)
  - **Instrumentación real de la métrica** (la app exige declararla y la registra;
    no la mide por vos)
  - **Framework configurable** (hoy es fijo: el del harness)
  - **Multiusuario / nube / compartir**
  - **Exportar** la idea como artefacto (`03-DEFINICION.md`, ADRs)
  - **Búsqueda de referencias asistida**
- Por qué se puede diferir sin romper la Etapa 1: **valor y métrica NO se difieren**
  — entran en la Etapa 1 como paso obligatorio y como regla R2. Lo diferido es
  *agregar reglas, agregar usuarios, o agregar una capa de LLM encima*; **no cambia
  la arquitectura ni el significado de «definida»**.

## Casos borde y de error

| Caso | Comportamiento esperado |
|---|---|
| Respuesta con solo espacios | Se trata como vacía: no avanza |
| Respuesta con solo un carácter | No alcanza el mínimo del paso: no avanza y lo dice |
| **Métrica vaga** («mejorar la experiencia», «más rápido») | **No avanza**: exige qué se mide, cómo se obtiene y valor objetivo |
| **Valor que describe la función, no el cambio** | **No avanza**: pide el cambio, no la función |
| **Valor sin destinatario concreto** («los usuarios») | **No avanza**: exige de quién es el cambio |
| `localStorage` bloqueado (modo privado) | La app funciona en memoria; avisa que **no** va a persistir |
| `localStorage` con contenido corrupto o de otra versión | Se ignora el contenido inválido y se arranca limpio |
| Idea sin ninguna referencia al llegar al paso | Bloquea, indicando que faltan 2 |
| Referencia sin «qué se toma de ella» | Bloquea, nombrando la referencia incompleta |
| Editar un paso anterior dejándolo incompleto | Los posteriores quedan invalidados |
| Editar una idea ya aprobada | El veredicto de challenge se invalida |
| Todos los pasos completos pero una regla fallando | RECHAZADO; no se puede marcar como definida |
| Recargar en medio del wizard | Se vuelve al paso alcanzado, con lo escrito conservado |
| **Barra a 375 px** | **Nada desborda**: el grupo de controles envuelve (corrige **H-1**) |
| **Estados de paso distinguidos solo por color del borde** | **Rechazado en diseño**: hacen falta ≥2 señales independientes del color |
| **Modo oscuro con el acento claro reutilizado** | **Rechazado**: el acento oscuro es `#7aa8ff`, rediseñado, no una inversión |
| Cambio de modo con datos cargados | No se pierde nada de lo escrito |

## Definición de "terminado" para esta iteración

- [ ] El wizard tiene los **7 pasos** del framework, visibles y con su orden
- [ ] **No se puede avanzar** con un paso incompleto, y el mensaje **nombra** el requisito
- [ ] **El paso de valor exige tres cosas:** qué cambia, para quién, y cómo se mide
- [ ] **Una métrica sin cantidad verificable y valor objetivo bloquea el avance**
- [ ] El paso de referencias exige **≥2 referencias** con fuente y conclusión
- [ ] El challenger **rechaza de verdad**: con una definición incompleta el veredicto es RECHAZADO
- [ ] **Una idea sin valor o sin métrica medible es RECHAZADA nombrando R2**
- [ ] Cada objeción indica **la regla que la produjo**
- [ ] Las ideas persisten y se reabren en el paso alcanzado
- [ ] Editar invalida lo que dependía de lo editado
- [ ] Un solo artefacto, sin build, sin dependencias externas
- [ ] Responsive usable a 375px **y** 1440px *(aprendizaje de MyHermesTest: H-1 fue un bug de 375px que 79 tests verdes no vieron)*
- [ ] **Los 13 tokens de Pizarra** presentes y exactos, en modo claro y oscuro
- [ ] **El acento oscuro no es el claro**: es `#7aa8ff` (no-inversión)
- [ ] **Contraste AA ≥4.5:1** en los textos, calculado por una implementación **independiente**
- [ ] **Los estados de paso no se distinguen solo por color** (≥2 señales)
- [ ] **Foco visible** en todo lo interactivo
- [ ] **La barra no desborda a 375px** (H-1 corregido, no heredado)
- [ ] Crisol y MyHermesTest se reconocen como **el mismo sistema visual**
- [ ] **Corre en local** con un comando documentado, desde un clon limpio
- [ ] **Se despliega en Cloudflare** con un comando documentado, y queda accesible
- [ ] El diseño declara **qué NO corre igual en local**
- [ ] El diseño nombra **el límite del plan** que podría romperlo y su consecuencia
- [ ] **Rollback** documentado: vuelve la versión anterior completa
- [ ] **Cero credenciales en el repo**, y nada sensible en el directorio de assets

## Fuera de esta iteración

- Agente LLM real, reglas 5..N, instrumentación real de la métrica, framework
  configurable, multiusuario, exportación, búsqueda asistida de referencias.
- **Las otras 9 pieles** del proyecto anterior, su selector y su contador `NN/10`:
  de MyHermesTest se reutiliza **una** piel (Pizarra), no el estudio de pieles.
- **Backend y almacenamiento en Cloudflare** (KV / D1 / R2 / DO): la Etapa 1 persiste
  en `localStorage` del navegador. El despliegue entra **ahora**; el almacenamiento
  remoto, cuando haya algo que guardar del lado del servidor.

---

## Aprobación

- [x] **Aprobado por el usuario** — fecha: **2026-10-07** *(«si, aprobado»)*
- [x] Adicionalmente pedido al aprobar: **reutilizar el diseño Pizarra del proyecto
      anterior** → incorporado como **HU-7** (Revisión 3)
- [ ] Cambios solicitados:

---

**Gate G1 ⭐ (humano):** cada criterio se puede convertir en un test concreto.
Sin aprobación explícita del usuario, no se avanza a diseño.

---

# Revisión 4 — Ciclo 2: persistencia en base de datos

> **Esta revisión NO toca la aprobación de la Revisión 3.** El Ciclo 1 sigue
> vigente tal como está aprobado. Esto **agrega** el alcance del Ciclo 2 y
> **corrige un ítem que dejó de ser cierto** (§ *Fuera de esta iteración*:
> «Backend y almacenamiento en Cloudflare (KV / D1 / R2 / DO)…»).
>
> **Fuente de verdad técnica:** `02-ANALISIS.md` § *Análisis 2*, con la
> verificación de las opciones de Cloudflare del 2026-10-07.

## HU-9 · Las ideas persisten en una base de datos

**Como** autor
**quiero** que las ideas se guarden en una base de datos del servidor
**para** que no se pierdan al cambiar de equipo, de navegador o al limpiar datos

**Criterios de aceptación:**

- **Dado** que guardo una idea
  **cuando** abro la app **desde otro navegador o desde otro equipo**
  **entonces** la idea está en la lista, con su paso alcanzado y su veredicto

- **Dado** que la app corre en local
  **cuando** guardo una idea
  **entonces** se guarda en la **base local (D1 emulada)** y se lee de ahí, **no**
  del navegador

- **Dado** que la app está desplegada
  **cuando** guardo una idea y después se vuelve a desplegar
  **entonces** la idea **sigue ahí** (está en la base, no en el bundle)

- **Dado** el diseño
  **cuando** leo la sección de despliegue
  **entonces** declara **la forma del Worker (B/C), el binding `DB`** y **el límite
  del plan que ahora SÍ aplica** — 100.000 requests/día, 10 ms de CPU, 50 consultas
  por invocación en Free — en vez de seguir afirmando «cero límites»

- **Dado** que se agota la cuota diaria de D1
  **cuando** la app intenta guardar
  **entonces** falla **de forma declarada y visible**, nombrando el límite, y **no**
  se pierde lo escrito en pantalla

- **Dado** que la base no responde (binding mal configurado, error del servicio)
  **cuando** estoy a mitad del wizard
  **entonces** **no pierdo lo escrito**: el borrador sobrevive y el error se muestra

- **Dado** una idea ya guardada
  **cuando** la edito y guardo
  **entonces** el cambio persiste en la base y su **veredicto de challenge se
  invalida** (misma regla que HU-6)

- **Dado** el repositorio
  **cuando** busco credenciales
  **entonces** **no hay ninguna**: la base no pide token, y el token de despliegue
  sigue **fuera del entorno del Coder** (ADR-004 vigente)

## Casos borde y de error (Ciclo 2)

| Caso | Comportamiento esperado |
|---|---|
| Binding ausente o mal configurado | Falla explícita al guardar; el borrador local se conserva |
| Cuota diaria de D1 agotada | Mensaje que **nombra el límite**; no se pierde lo escrito |
| Guardar dos veces la misma idea | **No duplica**: actualiza la fila existente |
| Listar con la base vacía | Lista vacía, **no** error |
| `localStorage` con ideas de la versión anterior | **No** se migran (S-9); se ignoran sin borrarlas |
| Texto de idea fuera de límite (2 MB por fila / 100 KB por sentencia) | Rechazo explícito (no hay caso real: los límites son enormes para este uso) |
| Sin red y con la app abierta | El wizard sigue usable; guardar avisa que no pudo persistir |

## Definición de «terminado» para el Ciclo 2

- [ ] Existe una tabla `ideas` y una **migración versionada**
- [ ] Guardar, listar y reabrir **leen y escriben en D1**, verificado abriendo la
      app **desde otro navegador**
- [ ] Corre en local con `wrangler dev` (D1 emulada, **sin cuenta**) y despliega
      con el binding real
- [ ] **`ADR-007` supersede a `ADR-002`/`ADR-006`** en lo que dejó de ser cierto, y
      `04-DISENO.md` **deja de afirmar «cero límites de plan»**
- [ ] El diseño **nombra el límite que ahora aplica** y qué pasa al agotarse
- [ ] La **suite corre en local**; el **smoke** verifica contra la URL real que lo
      guardado **persiste entre requests**
- [ ] Cero credenciales en el repo, y nada sensible en el directorio de assets

## Fuera de este ciclo (Etapa 2)

- **Identidad, cuentas, login, permisos, multiusuario.**
- **Migración** de `localStorage`.
- **Búsqueda y filtros** sobre las ideas.
- **Otra base que no sea D1.**

---

## Aprobación — Ciclo 2

- [ ] **Aprobado por el usuario** — fecha:
- [ ] Cambios solicitados:
- ⚠ **Decisión de producto pendiente (D-5):** sin identidad, **cualquiera con la
  URL ve todas las ideas**. Se acepta, se mitiga, o se difiere la persistencia
  remota hasta que haya login.

---

**Gate G1 ⭐ (humano):** cada criterio se puede convertir en un test concreto.
Sin aprobación explícita del usuario, no se avanza a diseño.
