# ADR-005 — GitHub Pages para la Etapa 1, Cloudflare para la Etapa 2

- **Estado:** ⤳ SUPERADO por `ADR-006` (2026-10-07, mismo día) — se conserva por su razonamiento
- **Decide:** el Arquitecto
- **Reemplaza a:** `ADR-002-worker-solo-assets.md` (superado)

## Contexto

`ADR-002` eligió un Worker de Cloudflare solo-assets. La decisión era correcta **para
la pregunta que se hizo** («¿Workers o Pages en Cloudflare?») pero no se hizo la
pregunta anterior: **¿Cloudflare hace falta?**

Regla del usuario, textual:

> *«cuando la app a construir sea solo html es mejor desplegar en GitHub Pages, si es
> más complejo usar Cloudflare — creo que el arquitecto es quien debe decidir esto»*

**Y la pregunta se responde por etapa, no por proyecto.** Crisol Etapa 1, verificado:

```
public/          → index.html (un archivo)
<script>         → 1, INLINE (es del navegador, no del servidor)
llamadas de red  → 0
bindings         → ninguno
```

Es estático **de verdad**: no hay código que corra en el servidor. Y la Etapa 2,
textual en `03-DEFINICION.md`: *«Diferido a la Etapa 2: Agente LLM real para el
challenge — necesita backend o key: una app estática no puede…»*.

## Decisión

| Etapa | Plataforma | Por qué |
|---|---|---|
| **Etapa 1** (estática) | **GitHub Pages** | No hay nada que administrar: ni token, ni cuenta, ni cuota, ni `compatibility_date`. El sitio ya existe — es el mismo que sirve el tablero. |
| **Etapa 2** (agente LLM) | **Cloudflare Workers** | El agente **ejecuta** código y guarda una key. Pages no corre un script: ahí hace falta la única plataforma que sí. |

**El corte es de etapa.** La Etapa 1 no necesita Cloudflare; la Etapa 2 no puede
quedarse en Pages.

## Alternativas descartadas

- **Worker solo-assets en Cloudflare para ambas etapas** (`ADR-002`): funciona, pero
  **paga un costo de administración por nada** en la Etapa 1 — token, cuenta, y la
  disciplina de un `wrangler.jsonc` para servir un archivo que Pages ya sirve.
- **Pages para ambas etapas**: **imposible**, no por preferencia. Pages no ejecuta
  código, y el agente de la Etapa 2 lo exige.
- **GitHub Pages desde una rama `gh-pages` separada**: agrega un paso de publicación
  y una rama que mantener, para aislar un `docs/` que **igual es público en
  github.com** porque el repo es público. No compra nada.

## Consecuencias

**Aceptadas, y declaradas — no descubiertas:**

- **`docs/` queda accesible en el sitio.** Pages sirve la **raíz del repo**, así que
  `…github.io/Crisol/docs/03-DEFINICION.md` responde **200**. Verificado. **No es una
  fuga nueva**: el repo es público y ese contenido ya se ve en github.com. Pero se
  declara, y si el repo se volviera privado, **Pages gratis dejaría de publicar** —
  esa razón sola mandaría a Cloudflare.
- **El ciclo se publica en una ruta del mismo sitio**: `…github.io/Crisol/preview/1/`.
  Pages sirve **una sola rama** y no da URL por rama como Workers Builds; para un
  estático esto lo resuelve sin token, sin App y sin beta.
- **`ADR-004` sigue vigente**: el despliegue lo hace el **Orquestador**, no el Coder.
  Ahora con menos superficie todavía: publicar en Pages es un `push` a `main`.
- **El token de Cloudflare no se usa en la Etapa 1.** Queda configurado para la
  Etapa 2 y para otros proyectos del harness.

## Cómo se verifica

- `C-50`..`C-56` — el destino declarado, la ruta publicable, cero credenciales, sin
  build, la URL documentada, el techo de la etapa declarado, y **el smoke comparando
  el hash de lo publicado contra el repo**.
- Que el tablero siga respondiendo en la raíz (no se movió nada).
