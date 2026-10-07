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

- **Dado** que abro la app sin ideas previas
  **cuando** carga
  **entonces** veo **un solo paso activo** (el primero) y los siguientes
  **visibles pero inaccesibles**, con la cantidad total de pasos indicada (**7**)

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
