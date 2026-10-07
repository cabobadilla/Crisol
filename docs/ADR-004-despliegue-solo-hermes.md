# ADR-004 — Solo Hermes despliega al cloud

> Architecture Decision Record. Una decisión técnica no obvia = un ADR.

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

Desplegar a Cloudflare requiere un **token**. El role del Coder (OpenCode) es
escribir e implementar código; el de Hermes es orquestar e integrar.

El harness ya tiene una regla análoga y probada: **el Coder nunca trabaja sobre
`main`** — solo Hermes integra, con doble verificación. La pregunta es si el despliegue
sigue el mismo patrón o si el Coder también despliega.

## Decisión

**El Coder despliega en LOCAL (`wrangler dev`). Solo Hermes despliega en CLOUDFLARE.
El token nunca entra al entorno del Coder.**

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| **El Coder despliega** | Le exigiría tener el token en su entorno. Un proceso que puede **filtrar, mal-usar o romper producción** no debería tener la credencial. Y en el mejor caso sería una **convención** («no lo uses para esto»), no un límite |
| **El token en el repo** | Inaceptable por definición. Además `wrangler.jsonc` y el directorio de assets son **públicos**: un token ahí es un token publicado |
| **El token en `.dev.vars`** | Es el lugar de los secretos **de desarrollo**, y viaja con la máquina del proyecto. El token de despliegue no es un secreto de la app: es una credencial de infraestructura |
| **Que el Coder no use red y despliegue Hermes desde el workdir del Coder** | Mezcla los dos entornos y hace que «el Coder despliega en local» deje de ser cierto. `wrangler dev` corre **sin cuenta y sin token** — esa propiedad se pierde si el workdir tiene credenciales |

## Consecuencias

**Positivas:**
- **El Coder no necesita pedir ningún token.** `wrangler dev` corre en local sin cuenta
  y sin credenciales: la separación no le cuesta nada.
- El token vive junto al resto de credenciales (`~/.hermes/.env`), fuera del repo y
  fuera del alcance del Coder.
- La regla es un **límite**, no una convención: si el Coder no tiene el token, no puede
  desplegar aunque quiera.
- Se alinea con la regla de la rama: **el Coder no toca `main` ni producción.**

**Negativas / costo asumido:**
- Desplegar es un paso **manual en el ciclo**: Hermes tiene que ejecutarlo. No puede
  quedar «automático» sin devolverle el token a un proceso automatizado.
- Si Hermes no está disponible, nadie despliega. Es el precio de que la credencial viva
  en un solo lugar.

**Qué se vuelve difícil después de esto:**
- **Disparador de revisión:** si aparece la necesidad de CI/CD que despliegue solo, habrá
  que decidir **dónde** vive el token de ese sistema — y ese token habrá que tratarlo
  como una credencial de producción, con su propio alcance y rotación.
