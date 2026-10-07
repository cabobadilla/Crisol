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
