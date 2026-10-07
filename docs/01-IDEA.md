# 01 — Idea

> Fase 1. **No decidir nada aquí.** Capturar el requerimiento crudo, tal como se
> dijo. Si ya suena a solución, se anota igual y la crítica va en la fase 2.

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07
- **Origen:** mensaje del usuario (Telegram), tras cerrar el Ciclo 2 de `MyHermesTest`

## Requerimiento crudo

> «Necesito crear una app para crear y registrar ideas de productos digitales que
> se apalanquen en agentes, para esto me imagino una herramienta con un wizard que
> ayude al usuario a registrar la idea usando algún framework detrás que pida
> especificación clara respondiendo a un proceso determinístico (buscar
> referencias) y establecido, el cual se pueda potenciar con apoyo de un agente
> que haga challenge a las definiciones antes de avanzar.»

## Contexto adicional

- **Origen del pedido:** es el **segundo proyecto** del harness, y se pidió
  explícitamente para «seguir mejorando el harness». El proceso es tan entregable
  como el producto.
- Es el **primer proyecto que pasa por `new-project.sh`** y el primero que debe
  usar la **matriz de casos (v0.13)**. Las dos capacidades existían sin haberse
  ejercitado nunca.
- El usuario **ya vive este proceso**: es el mismo que construimos y corrimos en
  `MyHermesTest` — idea → análisis → definición → diseño → implementación, con un
  agente que ejecuta y otro que verifica adversarialmente.
- La frase «buscar referencias» aparece **dentro** de la definición del proceso
  determinístico: el usuario no la menciona como feature aparte, sino como **un
  paso del framework**.
- «Challenge a las definiciones» es, palabra por palabra, lo que en este harness
  hace el **gate**: un paso que puede rechazar y devolver a la fase anterior.

## Lo que explícitamente se pidió

- [ ] Una **app** (herramienta)
- [ ] Para **crear y registrar ideas** de productos digitales
- [ ] Esas ideas son de productos **que se apalancan en agentes**
- [ ] Un **wizard** que guíe al usuario en el registro
- [ ] Un **framework detrás** que **exija especificación clara**
- [ ] El framework responde a un **proceso determinístico y establecido**
- [ ] Ese proceso **incluye buscar referencias**
- [ ] Un **agente que haga _challenge_ a las definiciones** antes de avanzar
- [ ] El agente **potencia** el proceso, no lo reemplaza (el proceso es determinístico)

## Lo que explícitamente NO se dijo

> Se anota acá para no resolverlo por cuenta propia en la fase 3.

- Quién usa la app (¿solo él? ¿un equipo? ¿clientes?)
- Dónde viven las ideas (¿local? ¿nube? ¿compartidas?)
- Si «agente» significa un LLM real o un mecanismo determinístico
- Si el framework es el del harness u otro framework conocido
- Si hay más de un framework posible o uno fijo

---

**Gate G0:** existe esta idea, sin interpretación agregada.

---

# Idea 2 — Persistencia de las ideas en una base de datos (Ciclo 2)

- **Proyecto:** Crisol
- **Fecha:** 2026-10-07
- **Origen:** mensaje del usuario (Telegram), **con el Ciclo 1 en implementación**
- **Ciclo:** 2 (propuesto — se registra acá porque el proyecto ya está en marcha)

## Requerimiento crudo

> «incorpora la capacidad de persistir las ideas en una base de datos minima
> (verifica que tipo de BD -la mas pequeña- se puede usar el Cloudflare)»

## Contexto adicional

- Se pide **para probar el flujo** del harness con un requerimiento que llega
  **a mitad de la implementación**, no al principio.
- **Trae exactamente lo que la iteración anterior difirió.** `03-DEFINICION.md`,
  § *Fuera de esta iteración*: «**Backend y almacenamiento en Cloudflare**
  (KV / D1 / R2 / DO): la Etapa 1 persiste en `localStorage` del navegador».
- Trae una **tarea de verificación explícita**: no se acepta un supuesto sobre
  qué base usar. «Verifica» es parte del requerimiento, no una recomendación.

## Lo que explícitamente se pidió

- [ ] **Persistir las ideas** en una **base de datos**
- [ ] Que sea **mínima** («la más pequeña»)
- [ ] **Verificar** qué tipos de BD ofrece Cloudflare y cuál es la más pequeña
- [ ] La base es de **Cloudflare**

## Lo que explícitamente NO se dijo

> Se anota acá para no resolverlo por cuenta propia en la fase 3.

- Si la base **reemplaza** a `localStorage` o **convive** con él
- **Quién** puede leer esas ideas (no se menciona identidad ni usuarios)
- Si la idea se guarda **entera** en la base o solo un puntero
- Si hay que **migrar** lo ya guardado en el navegador

---

**Gate G0:** existe esta idea, sin interpretación agregada.
