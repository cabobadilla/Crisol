# 06 — QA Report

> Fase 5. Dueño: **QA (Hermes, contexto aislado del Coder)**.
> **Este reporte se llena ejecutando, no leyendo.**
> El resumen del Coder nunca es evidencia válida.

- **Proyecto:**
- **Fecha:**
- **Iteración:**
- **Verificado contra:** `03-DEFINICION.md`
- **Commit verificado:** <sha>

## Resultado por criterio de aceptación

> Cada criterio de la fase 3 debe tener veredicto. Sin excepciones.

### HU-1 / criterio #1
- **Veredicto:** ✅ pasa / ❌ falla / ⚠️ parcial
- **Comando:**
  ```
  <comando exacto>
  ```
- **Salida real:**
  ```
  <salida pegada sin editar>
  ```
- **Notas:**

### HU-1 / criterio #2
…

## Casos borde y de error

> Probados, no asumidos.

| Caso | Comando | Resultado real | Veredicto |
|---|---|---|---|
| … | … | … | … |

## Hallazgos

> Un QA que aprueba todo sistemáticamente no está verificando, está firmando.

### H-1 — <título>
- **Severidad:** alta / media / baja
- **Reproducción:** pasos + comando
- **Comportamiento observado:**
- **Comportamiento esperado:**

## Casos cuyo verificador NO es un test (declarados)

> El invariante del harness es «todo caso termina en un test **o** en un hueco declarado,
> nunca en nada». Un caso puede tener un verificador **legítimo que no sea un archivo de
> `tests/`** — pero entonces se declara acá, con el comando que lo verifica. Lo que no vale
> es que el caso exista y no lo verifique nadie.

| Caso | Verificador | Comando | Por qué no es un test |
|---|---|---|---|
| `C-97` | `scripts/smoke.sh` (lo corre **Hermes** tras desplegar) | `bash scripts/smoke.sh <url> --c97 verificar` | Es un **umbral contra el edge**: no se puede ejercitar en local — el emulador **no aplica** los límites del plan. La mitad de CPU se mide **a mano** en el dashboard (`cpuTimeP50`) y se registra |

## Lo que NO se probó

> Honestidad explícita sobre los huecos de cobertura.

- …

## Veredicto final

- [ ] **Aprobado** — todos los criterios pasan
- [ ] **Aprobado con observaciones** — criterios pasan, hay hallazgos no bloqueantes
- [ ] **Rechazado** — hay criterios que fallan → vuelve a fase 5

---

**Gate G5:** cada veredicto trae comando y salida real. Sin evidencia ejecutable, este reporte es inválido.
