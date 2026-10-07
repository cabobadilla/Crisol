# ADR-001 — Un solo archivo, sin build

> Architecture Decision Record. Una decisión técnica no obvia = un ADR.

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

Crisol Etapa 1 es un wizard de 7 pasos con 4 reglas de validación y persistencia
local. No tiene backend, no consume red, no tiene cuentas. El stack candidato podría
incluir un framework (React/Vue/Svelte), un bundler (Vite), o nada.

Restricciones reales: **una sola persona**, un ciclo corto, y un requisito de
despliegue a Cloudflare como Worker solo-assets.

## Decisión

**Todo el producto vive en `public/index.html`: marcado, CSS y JS en el mismo
archivo. Sin build, sin framework, sin dependencias en runtime.**

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| React/Vue/Svelte + Vite | Agrega `node_modules`, un paso de build y un bundle que publicar. El wizard no tiene estado que justifique un framework: el estado es un objeto y 7 pasos |
| Un framework y sin bundler | Mismo costo de dependencias, sin el beneficio del árbol de imports |
| Módulos ES separados (`app.js`, `wizard.js`) | Más ordenado, pero obliga a que el directorio de assets publique varios archivos sin necesidad, y agrega una decisión de empaquetado a un diseño que no la necesita |
| Un Web Component | Elegante, pero la encapsulación no resuelve nada acá y complica el test estructural |

## Consecuencias

**Positivas:**
- El despliegue es **un archivo**: no hay paso de build que pueda fallar ni salida que pueda quedar desactualizada.
- Los tests estructurales leen el artefacto **tal como se publica**. No hay distancia entre fuente y salida.
- Cero `npm install`: el repo se clona y corre.
- El Worker solo-assets queda natural: `public/` contiene exactamente lo que se sirve.

**Negativas / costo asumido:**
- El archivo va a crecer (estimado: 30–45 KB). Pasado cierto punto, navegarlo cuesta.
- Sin árbol de imports, el orden de las definiciones importa.

**Qué se vuelve difícil después de esto:**
- Si el producto crece mucho (Etapa 3+), migrar a módulos es un refactor real.
- **Disparador de revisión:** si el archivo pasa de ~60 KB, o si aparecen más de dos
  responsabilidades nuevas, esta decisión se revisa.
