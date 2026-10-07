# Crisol

Proyecto construido con **HermesHarness**.

- **Harness:** https://github.com/cabobadilla/HermesHarness.git @ `313af19`
- **Proceso:** idea → análisis → definición → diseño → implementación y pruebas

## Artefactos

| Archivo | Fase | Dueño |
|---|---|---|
| `docs/01-IDEA.md` | Idea | usuario / PO |
| `docs/02-ANALISIS.md` | Análisis | PO |
| `docs/03-DEFINICION.md` | Definición | PO → **aprobación humana** |
| `docs/04-DISENO.md` + `docs/ADR-*.md` | Diseño | Arquitecto |
| `docs/05-TAREAS.md` | Diseño (salida) | Arquitecto |
| `docs/06-QA-REPORT.md` | Implementación y pruebas | QA |
| `docs/PROMPT-CODER.md` | Contrato del Coder | Arquitecto |

## Guardias (scripts/)

El proceso no es solo documentación: estas guardias lo hacen cumplir.

| Script | Para qué |
|---|---|
| `preflight-model.sh <nivel>` | Verifica que el modelo esté VIVO antes de despachar |
| `freeze-tests.sh seal / verify` | Sella los tests con hash: el Coder no puede tocarlos |
| `cycle-branch.sh start / check / merge <n>` | Rama por ciclo; el Coder nunca toca `main` |
| `review.sh` | Revisión mecánica: tests, sello, frescura, commits |
| `update-status.sh [--push]` | Regenera y publica el tablero (`progreso.html`) |

## Estado

- [ ] G0 Idea registrada
- [ ] G1a Análisis con preguntas
- [ ] G1 Definición aprobada
- [ ] G2 Diseño trazable
- [ ] G3 Tests primero
- [ ] G4 Code review
- [ ] G5 QA con evidencia
