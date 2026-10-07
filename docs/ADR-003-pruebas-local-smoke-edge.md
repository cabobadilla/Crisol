# ADR-003 — La suite en local, el smoke en el edge

> Architecture Decision Record. Una decisión técnica no obvia = un ADR.

- **Fecha:** 2026-10-07
- **Estado:** aceptado
- **Decisor:** Arquitecto

## Contexto

Hay que decidir **dónde corren las pruebas**. La pregunta parecía binaria — local o
Cloudflare — y no lo es.

Dos hechos que la condicionan:
1. `wrangler dev` corre Miniflare/workerd **offline**, pero **no aplica los límites
   del plan**: no corta a los 10 ms de CPU ni cuenta requests.
2. La suite completa de este producto tiene **85 casos**, la mayoría de comportamiento.

## Decisión

**Dos niveles con propósitos distintos: la suite completa corre en LOCAL; un smoke
chico corre contra la URL real de Cloudflare después de cada deploy.**

| | Suite | Smoke |
|---|---|---|
| Dónde | Local (`wrangler dev` + Chrome headless) | Cloudflare (URL real) |
| Qué prueba | El **comportamiento** (los 85 casos) | Que lo publicado **es** lo construido |
| Quién | El Coder | Hermes |

## Alternativas descartadas

| Alternativa | Por qué se descartó |
|---|---|
| **Todo en Cloudflare** | 85 casos contra producción: lento, frágil, y **consume la cuota diaria**. Peor: el veredicto **cambiaría según el día** — un test que pasa el lunes y falla el martes por cuota no es un test |
| **Todo en local** | No verifica el edge. El emulador **no aplica los límites del plan**, así que pasar en local **no prueba** que sobreviva a producción. Y no detecta lo que solo existe en el deploy: routing de assets, `not_found_handling`, o que `docs/` haya quedado público |
| **Solo tests estructurales** | Un test que comprueba que existe el `if` que bloquearía **no verifica el bloqueo**. Los 60 casos de comportamiento necesitan ejecutar el artefacto |
| **Suite de comportamiento con un DOM simulado (jsdom)** | Menos fiel que un navegador real, y **Chrome 154 ya está instalado**: no hay costo de instalación que justifique el atajo |

## Consecuencias

**Positivas:**
- La suite es **determinista** y no depende de la red ni del plan.
- El smoke es **chico y explícito**: si falla, se sabe exactamente qué buscar.
- El reparto coincide con los roles: **el Coder prueba en su máquina, Hermes verifica
  lo publicado** — y el Coder no necesita credenciales.

**Negativas / costo asumido:**
- Hay dos lugares donde pueden fallar cosas, y hay que mantener **los dos**.
- El smoke consume cuota real (una decena de requests por deploy: irrelevante).

**Qué se vuelve difícil después de esto:**
- **Nada**, mientras el smoke se mantenga chico. Un smoke que crezca hasta parecerse a
  la suite reintroduce exactamente el problema que esta decisión evita.
- **Disparador de revisión:** si el smoke pasa de ~15 verificaciones, se recorta.
