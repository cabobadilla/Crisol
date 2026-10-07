# 04 — Diseño

> Fase 4. Dueño: **Arquitecto**. Decidir *cómo* se construye. Termina con
> trazabilidad completa hacia la definición.

- **Proyecto:**
- **Fecha:**
- **Basado en:** `03-DEFINICION.md`

## Arquitectura

### Componentes

| Componente | Responsabilidad | Límite |
|---|---|---|
| … | … | … |

### Flujo de datos

> Diagrama o descripción paso a paso.

### Diagrama

> Opcional: generar con la skill `architecture-diagram`.

## Contratos

> Lo bastante precisos para que el Coder no tenga que adivinar nada.

### API / Interfaces

```
<endpoint o firma>
Entrada: …
Salida: …
Errores: …
```

### Esquemas de datos

```
<estructura>
```

## Stack y dependencias

| Elección | Versión | Justificación |
|---|---|---|
| … | … | … |

## Decisiones (ADRs)

> Una decisión técnica no obvia = un ADR. Ver `templates/ADR.md`.

- `ADR-001-<tema>.md` — …
- `ADR-002-<tema>.md` — …

## Matriz de casos de prueba  ⭐ OBLIGATORIA

> **Los casos se identifican acá, en el diseño.** No son código: son el contrato de
> qué significa "terminado". El Coder los traduce a tests ejecutables y **puede
> agregar los que se le ocurran; no puede quitar ninguno.**
>
> **Por qué acá y no en el Coder.** El Coder es dueño de los tests, pero si además
> *inventa los casos*, decide qué significa "hecho" — y eso es alcance, con disfraz
> de test. `ROLES.md` ya dice que el Coder no decide alcance.

| ID | Caso | Criterio de origen | Tipo | Observable esperado |
|---|---|---|---|---|
| `C-01` | … | HU-1 / #1 | estructura / comportamiento / umbral / empaquetado | qué se mide y con qué límite |

**Reglas de la matriz:**

1. **Toda fila nace de un criterio de aceptación de la fase 3.** Un caso sin
   criterio de origen es alcance no pedido.
2. **El `ID` es el contrato.** El test que lo cubre **se nombra con ese ID**
   (`test('C-01 · …')`). Así la cobertura es **comprobable**:
   `scripts/check-coverage.sh <proyecto>` verifica que todo ID de la matriz tiene
   su test. Sin el ID en el nombre, la cobertura es una opinión.
3. **Todo criterio de aceptación tiene ≥1 caso.** Un criterio sin caso es un
   criterio que nadie va a verificar.
4. **`Observable esperado`: qué se mide.** No "funciona bien" — "el contador
   muestra `02/10` tras avanzar una piel". Si no se puede escribir el observable,
   el caso no está definido.
5. **Los casos de tipo `comportamiento` ejecutan el artefacto**, no lo leen. Un
   test que solo comprueba que existe el CSS que *haría* la transición no verifica
   la transición.
6. **Los umbrales se escriben numéricos y con su límite** (contraste ≥ 4.5:1,
   respuesta < 200 ms), nunca como "aceptable".

### Cobertura combinada

Si hay ejes que se multiplican (N variantes × M estados), **la matriz tiene una
fila por combinación o una fórmula explícita** (`C-40..C-59: 10 pieles × 2 modos`).
Una fórmula sin filas es donde se esconden los literales escritos en duro.

## Trazabilidad

> El eslabón completo: **criterio → caso → tarea → test**. Si falta un eslabón, algo
> se está colando sin verificar.

| Criterio (fase 3) | Casos | Tarea(s) | Test que lo cubre |
|---|---|---|---|
| HU-1 / #1 | `C-01`, `C-02` | T-1 | `C-01 · …` |

---

**Gate G2:** todo criterio tiene ≥1 caso **con observable esperado**, todo caso nace
de un criterio, toda tarea apunta a ≥1 caso, y cada ADR tiene alternativas
descartadas.
