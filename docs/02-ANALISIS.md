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
