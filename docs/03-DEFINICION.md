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

## Fuera de esta iteración

- Agente LLM real, reglas 5..N, instrumentación real de la métrica, framework
  configurable, multiusuario, exportación, búsqueda asistida de referencias.

---

## Aprobación

- [ ] **Aprobado por el usuario** — fecha:
- [ ] Cambios solicitados:

---

**Gate G1 ⭐ (humano):** cada criterio se puede convertir en un test concreto.
Sin aprobación explícita del usuario, no se avanza a diseño.
