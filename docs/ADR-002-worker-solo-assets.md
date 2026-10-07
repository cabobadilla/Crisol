# ADR-002 — Worker solo-assets, no Pages ni Worker con script

> Architecture Decision Record. Una decisión técnica no obvia = un ADR.

- **Fecha:** 2026-10-07
- **Estado:** ⤳ SUPERADO por `ADR-005` (2026-10-07) — se conserva por su razonamiento
- **Decisor:** Arquitecto
- **Fuente:** skill `cloudflare-architecture`, verificada el 2026-10-07

## Contexto

Cloudflare es el servicio preferido del usuario y el despliegue es un requisito de la
Etapa 1 (HU-8). Hay que elegir **la forma** del despliegue: Pages, un Worker con
script, o un Worker **solo** con assets.

Dos hechos verificados hoy, no supuestos:
1. Cloudflare dice *«start new projects with Workers»* — Pages sigue funcionando, pero
   las features nuevas aterrizan en Workers.
2. Los requests que sirven assets son **gratis e ilimitados**; solo se factura lo que
   **invoca el script**.

## Decisión

**Un Worker solo-assets: `assets.directory: "./public"`, sin `main`.**

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| **Cloudflare Pages** | Funciona, pero es la plataforma que Cloudflare ya no recomienda para proyectos nuevos. Elegirla hoy es arrancar en la rama que no recibe features |
| **Worker con `main`** (script) | No daría **ninguna** capacidad: no hay API, no hay backend, la persistencia es del navegador. Y **sí** crearía dos límites nuevos: 100.000 requests/día y **10 ms de CPU** por invocación |
| **GitHub Pages** | Es lo que venía usando el harness por inercia. No es la plataforma preferida del usuario y no ofrece rollback atómico ni versionado |
| **Assets + Worker con `run_worker_first`** | Agrega el script al camino del request sin necesidad, y en Free agotar la cuota devuelve **429 sin caer de vuelta a los assets**: el sitio se cae entero |

## Consecuencias

**Positivas:**
- **Cero límites de plan en Etapa 1.** Sin `main`, ningún request ejecuta código: no
  hay cuota que agotar ni presupuesto de CPU que romper.
- El rollback restaura **todo junto** (HTML y CSS se suben con la versión): no existe
  una ventana donde el HTML viejo apunte a un asset que ya no está.
- La migración a la Etapa 2 es limpia: agregar `main` y bindings **sin cambiar de
  plataforma** ni de comando.

**Negativas / costo asumido:**
- Se pierde la detección automática de SPA/404 de Pages: hay que declarar
  `not_found_handling` explícitamente (se declaró `single-page-application`).
- Un dominio propio exigiría nameservers gestionados por Cloudflare (no aplica ahora).

**Qué se vuelve difícil después de esto:**
- **Nada en Etapa 1.** En Etapa 2, cuando entre el agente LLM, va a hacer falta un
  `main` — y **ese** es el momento en que los 10 ms de CPU pasan a ser una restricción
  de diseño real. Queda anotado en `04-DISENO.md` § Presupuesto de CPU.
