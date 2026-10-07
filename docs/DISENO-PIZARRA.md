# Diseño Pizarra — extraído del proyecto anterior

> **Documento de origen.** No es una inspiración: son los valores exactos, con
> procedencia verificable. Lo que está acá manda sobre cualquier gusto.
>
> **Procedencia:** `cabobadilla/MyHermesTest`, `index.html`, piel `slate`
> (`{ id: 'slate', label: 'Pizarra', headingFont: 'Inter', bodyFont: 'Inter' }`),
> líneas 191–221. Extraído el 2026-10-07, no copiado de memoria.

- **Fecha:** 2026-10-07
- **Origen:** requerimiento del usuario — *«jala el diseño Pizarra del proyecto
  anterior (HermesTest) para usar en este proyecto, incluye eso como un requisito»*
- **Alcance de la reutilización:** la **piel** (tokens y tipografía) y las
  **convenciones de componentes**. **No** la estructura de la landing.

---

## 1 · Los 13 tokens

### Modo claro

```css
[data-mode="light"] {
  --bg: #f6f7f9;
  --surface: #ffffff;
  --surface-2: #eef1f5;
  --text: #16191f;
  --muted: #565d6b;
  --accent: #1f5fbf;
  --on-accent: #ffffff;
  --border: #d9dee5;
  --shadow: 0 1px 2px rgba(22, 27, 45, 0.09);
  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 10px;
  --container: 1120px;
}
```

### Modo oscuro

```css
[data-mode="dark"] {
  --bg: #0f1216;
  --surface: #171b21;
  --surface-2: #1f242b;
  --text: #e8eaee;
  --muted: #a3abb8;
  --accent: #7aa8ff;
  --on-accent: #0d1117;
  --border: #2a313a;
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 10px;
  --container: 1120px;
}
```

> **El acento oscuro NO es una inversión.** `#7aa8ff` es un azul **rediseñado**
> más claro y desaturado, no el `#1f5fbf` claro puesto sobre fondo oscuro. Es la
> regla que el BRIEF del proyecto anterior ya exigía.

## 2 · Tipografía

**Inter en ambos roles** (títulos y cuerpo), vía Google Fonts CDN. Sin build, sin
auto-hospedaje. `system-ui` como primer fallback.

## 3 · Contraste — medido, no estimado

Calculado con la fórmula de WCAG 2.1. Umbral AA: **4.5:1** para texto, **3:1** para
componentes de interfaz.

| Modo | Par | Ratio | Texto (4.5) | UI (3.0) |
|---|---|---|---|---|
| claro | text / bg | 16.42 | ✅ | ✅ |
| claro | text / surface | 17.60 | ✅ | ✅ |
| claro | muted / bg | 6.17 | ✅ | ✅ |
| claro | muted / surface | 6.62 | ✅ | ✅ |
| claro | accent / bg | 5.68 | ✅ | ✅ |
| claro | accent / surface | 6.09 | ✅ | ✅ |
| claro | on-accent / accent | 6.09 | ✅ | ✅ |
| claro | **border / surface** | **1.35** | ❌ | ❌ |
| oscuro | text / bg | 15.59 | ✅ | ✅ |
| oscuro | text / surface | 14.35 | ✅ | ✅ |
| oscuro | muted / bg | 8.11 | ✅ | ✅ |
| oscuro | muted / surface | 7.47 | ✅ | ✅ |
| oscuro | accent / bg | 7.93 | ✅ | ✅ |
| oscuro | accent / surface | 7.30 | ✅ | ✅ |
| oscuro | on-accent / accent | 8.00 | ✅ | ✅ |
| oscuro | **border / surface** | **1.32** | ❌ | ❌ |

### ⚠️ Consecuencia obligatoria: el borde NO puede ser la única señal

`--border` da **1.35:1** (claro) y **1.32:1** (oscuro), muy por debajo de 3:1. Eso
**no es un defecto a corregir** — es una decisión válida mientras el borde sea
**decorativo** y el `--surface` cargue la separación.

Pero en **esta** app hay una consecuencia dura: el wizard tiene pasos
**bloqueados**, **disponibles**, **completos** e **inválidos**. Si esos estados se
distinguieran **solo por el color del borde**, sería:

1. **Inaccesible** — viola WCAG 1.4.1 (el color como único medio).
2. **Invisible** — a 1.35:1 el ojo no lo distingue de todos modos.

**Requisito:** cada estado debe ser distinguible por **al menos dos señales
independientes** del color: forma, texto, icono, tamaño, o el propio contenido del
paso. El color **acompaña**; nunca **decide**.

## 4 · Convenciones de componentes

Extraídas del mismo archivo. Son el vocabulario visual que hay que respetar.

**Botón base**
```css
padding: 0.7rem 1.25rem;  border: 1px solid var(--border);
border-radius: var(--radius);  background: var(--surface);
color: var(--text);  font-weight: 600;
```

**Botón primario** — `background: var(--accent); border-color: var(--accent); color: var(--on-accent);`

**Foco visible (obligatorio en todo lo interactivo)**
```css
outline: 2px solid var(--accent);  outline-offset: 2px;
```

**Barra superior** — `position: fixed; inset: 0 0 auto; background: var(--surface); border-bottom: 1px solid var(--border);`

**Chips** (secundarios) — `padding: 0.35rem 0.7rem; border: 1px solid var(--border); background: var(--bg); color: var(--muted);`

## 5 · Lo que NO se reutiliza

- **La estructura de la landing** (hero, secciones, 10 pieles). Crisol es un wizard,
  no una página de marketing.
- **El selector de pieles.** Crisol usa **una sola** piel: Pizarra. El switcher era
  el objeto de estudio del proyecto anterior, no una feature de este.
- **Las otras 9 pieles.** No entran.
- **El contador `NN/10`** y todo lo que dependía de 10 pieles.

## 6 · Defecto conocido que se hereda si no se corrige

El proyecto anterior tiene un hallazgo **H-1 (severidad alta)**: `.bar__group` **no
tiene `flex-wrap`**, así que a 375 px la barra desborda y deja contenido fuera de
pantalla. **79 tests verdes no lo vieron** — lo encontró la verificación en navegador.

**Si Crisol copia la barra, copia el defecto.** Requisito explícito: `.bar__group`
**debe envolver** a 375 px, y el ancho de la barra **no debe exceder** el viewport.

> **Lección que aplica a todo el harness:** reutilizar un diseño de otro proyecto
> reutiliza **también sus defectos**. Un diseño extraído se reutiliza **con su lista
> de hallazgos**, no con su lista de aciertos.

## 7 · Cómo se verifica

- Los **13 tokens**, en ambos modos, presentes y con los valores exactos.
- El **acento oscuro no es** el claro reutilizado (regla de no-inversión).
- Contraste **AA ≥4.5:1** en los pares de texto, calculado por una **implementación
  independiente** de la que lo declaró. *(Lección de MyHermesTest: la suite de
  contraste era circular — usaba la misma calculadora que verificaba.)*
- **Todo lo interactivo** tiene foco visible.
- A **375 px** y **1440 px**, nada desborda.

---

**Este documento es un requisito, no una sugerencia.** Si el Coder se aparta de los
tokens, el diseño está mal aunque se vea bien.
