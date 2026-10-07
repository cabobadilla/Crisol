// T-1 / T-1b — Esqueleto del wizard de Crisol: casos C-01..C-06, C-86/C-87 y C-88
// (Grupo A, HU-1).
//
// LA FORMA es requisito (docs/03-DEFINICION.md § HU-1 y docs/04-DISENO.md §
// Matriz): los 7 pasos van en UNA fila horizontal, uno al lado del otro, arriba
// del contenido; debajo, solo el paso activo muestra su formulario.
//
// Marcado observado por los tests (T-1b):
//   - fila (barra horizontal de pasos):
//       <li data-paso-indicador="<id>"
//           data-estado-indicador="activo|completo|bloqueado">
//         <span class="paso-numero">…</span>            <- número del paso
//         <span class="paso-nombre">…</span>            <- nombre del paso
//         <span class="paso-marca">✓</span>             <- visible si completo
//         <span class="paso-indicador-estado">…</span>  <- estado, para lectores
//       </li>
//   - panel (formulario del paso):
//       <section data-paso="<id>" data-estado="activo|completo|bloqueado">
//         .paso-titulo, .paso-estado, .paso-exige, .paso-campos,
//         .paso-mensaje, <button data-accion="confirmar">
//   - contador:   [data-contador] con «Paso <n> de <total>»
//   - lista:      [data-lista-ideas] con un <li> por idea registrada
//
// C-01 y C-03 se miden con GEOMETRÍA sobre los 7 indicadores de la fila
// (getBoundingClientRect del DOM renderizado, no del texto del archivo);
// C-86 y C-87 se miden con el viewport en 390 px. El navegador es Chrome
// headless por CDP: servidor node:http + Runtime.evaluate.
import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { abrirNavegador } from './helpers/cdp.mjs';

const PASOS = [
  { id: 'idea', titulo: 'Idea' },
  { id: 'problema', titulo: 'Problema' },
  { id: 'valor', titulo: 'Valor y metrica' },
  { id: 'referencias', titulo: 'Referencias' },
  { id: 'alcance', titulo: 'Alcance' },
  { id: 'terminado', titulo: 'Criterio de terminado' },
  { id: 'challenge', titulo: 'Challenge' },
];

const IDS = PASOS.map(paso => paso.id);
const TITULOS = PASOS.map(paso => paso.titulo);

// Viewports del contrato: C-01/C-03 se miden a 1200 px; C-86/C-87 a 390 px.
const ANCHO_GEOMETRIA = 1200;
const ANCHO_ANGOSTO = 390;
const ALTO_ANGOSTO = 844;

const dosDecimales = lista => JSON.stringify(lista.map(valor => Number(valor.toFixed(2))));

let app;

before(async () => { app = await abrirNavegador(); });
after(async () => { if (app) await app.cerrar(); });
beforeEach(async () => {
  await app.irAlaApp();
  await app.tamano(ANCHO_GEOMETRIA, 800);
});

test('C-01 · los 7 pasos están en UNA fila horizontal', async () => {
  const r = await app.evaluar(`
    Array.from(document.querySelectorAll('[data-paso-indicador]')).map(paso => {
      const rect = paso.getBoundingClientRect();
      return {
        id: paso.getAttribute('data-paso-indicador'),
        nombre: ((paso.querySelector('.paso-nombre') || {}).textContent || '')
          .replace(/\\s+/g, ' ').trim(),
        top: rect.top,
        left: rect.left,
      };
    })
  `);

  assert.equal(
    r.length, 7,
    `la fila debe tener exactamente 7 pasos; hay ${r.length}: ${JSON.stringify(r)}`
  );
  assert.deepEqual(
    r.map(paso => paso.id), IDS,
    'los ids de los 7 pasos de la fila, en el orden del contrato PASOS'
  );
  assert.deepEqual(
    r.map(paso => paso.nombre), TITULOS,
    'los nombres de los 7 pasos de la fila, en el orden del contrato PASOS'
  );

  const tops = r.map(paso => paso.top);
  const desvioTop = Math.max(...tops) - Math.min(...tops);
  assert.ok(
    desvioTop <= 2,
    `los 7 pasos deben compartir el mismo top (±2 px); el desvío medido es ` +
      `${desvioTop.toFixed(2)} px. tops = ${dosDecimales(tops)}`
  );

  const lefts = r.map(paso => paso.left);
  for (let i = 0; i < lefts.length - 1; i++) {
    assert.ok(
      lefts[i] < lefts[i + 1],
      `el left debe ser estrictamente creciente en la fila: el paso ${i + 1} ` +
        `(${r[i].id}) tiene left=${lefts[i].toFixed(2)} y el paso ${i + 2} ` +
        `(${r[i + 1].id}) left=${lefts[i + 1].toFixed(2)} → están apilados en ` +
        `la misma columna. lefts = ${dosDecimales(lefts)}`
    );
  }
});

test('C-02 · al cargar sin datos, solo el paso 1 es accesible', async () => {
  const r = await app.evaluar(`
    (() => {
      const controlesDe = paso => Array.from(
        paso.querySelectorAll('button, input, textarea, select')
      ).map(control => {
        control.focus();
        return {
          etiqueta: control.getAttribute('data-accion') ||
                   control.getAttribute('data-campo') ||
                   control.tagName,
          enfocado: document.activeElement === control,
        };
      });
      const pasos = Array.from(document.querySelectorAll('[data-paso]'));
      const info = pasos.map(paso => ({
        id: paso.getAttribute('data-paso'),
        estado: paso.getAttribute('data-estado'),
        controles: controlesDe(paso),
      }));
      const confirmarSegundo =
        document.querySelector('[data-paso="problema"] [data-accion="confirmar"]');
      if (confirmarSegundo) confirmarSegundo.click();
      const activo = document.querySelector('[data-estado="activo"]');
      return {
        cantidad: pasos.length,
        info,
        activoTrasClicSegundo: activo ? activo.getAttribute('data-paso') : null,
      };
    })()
  `);

  assert.equal(
    r.cantidad, 7,
    `los pasos 2..7 deben existir en el DOM; se hallaron ${r.cantidad} pasos`
  );
  assert.equal(r.info[0].estado, 'activo', 'el paso 1 debe ser el activo al cargar');

  assert.ok(
    r.info[0].controles.length > 0,
    'el paso 1 debe tener controles que acepten interacción'
  );
  assert.ok(
    r.info[0].controles.some(control => control.enfocado),
    `el paso 1 debe aceptar interacción (foco); controles: ${JSON.stringify(r.info[0].controles)}`
  );

  for (const paso of r.info.slice(1)) {
    assert.equal(
      paso.estado, 'bloqueado',
      `el paso ${paso.id} debe estar declarado bloqueado; estado: ${paso.estado}`
    );
    for (const control of paso.controles) {
      assert.equal(
        control.enfocado, false,
        `el paso ${paso.id} está bloqueado pero su control «${control.etiqueta}» aceptó foco`
      );
    }
  }

  assert.equal(
    r.activoTrasClicSegundo, 'idea',
    `el paso 2 está bloqueado: su confirmar no debe avanzar; tras el clic el paso activo es ${r.activoTrasClicSegundo}`
  );
});

test('C-03 · los 7 pasos se ven aunque estén bloqueados (geometría)', async () => {
  const r = await app.evaluar(`
    (() => {
      const indicadores = Array.from(document.querySelectorAll('[data-paso-indicador]'));
      return {
        anchoVentana: window.innerWidth,
        pasos: indicadores.map(paso => {
          const rect = paso.getBoundingClientRect();
          const nombre = paso.querySelector('.paso-nombre');
          const estilo = getComputedStyle(paso);
          return {
            id: paso.getAttribute('data-paso-indicador'),
            estado: paso.getAttribute('data-estado-indicador'),
            nombre: ((nombre || {}).textContent || '').replace(/\\s+/g, ' ').trim(),
            ancho: rect.width,
            alto: rect.height,
            izq: rect.left,
            der: rect.right,
            oculto: paso.hasAttribute('hidden') ||
                    estilo.display === 'none' ||
                    estilo.visibility === 'hidden',
          };
        }),
      };
    })()
  `);

  assert.equal(
    r.pasos.length, 7,
    `deben existir los 7 pasos en la fila; se hallaron ${r.pasos.length}`
  );
  assert.equal(
    r.anchoVentana, ANCHO_GEOMETRIA,
    `la geometría se mide a ${ANCHO_GEOMETRIA} px; el viewport medido es ${r.anchoVentana} px`
  );

  r.pasos.forEach((paso, i) => {
    assert.equal(
      paso.nombre, TITULOS[i],
      `el nombre del paso ${i + 1} debe ser «${TITULOS[i]}»; es «${paso.nombre}»`
    );
    assert.equal(
      paso.oculto, false,
      `el paso ${paso.id} está oculto (display/visibility/hidden); los pasos futuros deben verse`
    );
    assert.ok(
      paso.ancho > 0,
      `el paso ${paso.id} mide ancho=${paso.ancho.toFixed(2)}; los 7 deben medir ancho > 0`
    );
    assert.ok(
      paso.alto > 0,
      `el paso ${paso.id} mide alto=${paso.alto.toFixed(2)}; los 7 deben medir alto > 0`
    );
    assert.ok(
      paso.izq >= 0 && paso.der <= r.anchoVentana,
      `el paso ${paso.id} quedó fuera del viewport en el eje de la fila: ` +
        `[${paso.izq.toFixed(2)}, ${paso.der.toFixed(2)}] con anchoVentana=${r.anchoVentana}`
    );
    if (i > 0) {
      assert.equal(
        paso.estado, 'bloqueado',
        `el paso ${paso.id} debe estar bloqueado aunque sea visible; estado: ${paso.estado}`
      );
    }
  });
});

test('C-04 · se indica el paso actual y el total, y el activo está en la fila', async () => {
  const r = await app.evaluar(`
    (() => {
      const contador = document.querySelector('[data-contador]');
      const total = document.querySelector('[data-contador] [data-total]');
      const fila = Array.from(document.querySelectorAll('[data-paso-indicador]'));
      const activos = fila.filter(
        paso => paso.getAttribute('data-estado-indicador') === 'activo'
      );
      const activo = activos[0] || null;
      return {
        texto: contador
          ? contador.textContent.replace(/\\s+/g, ' ').trim()
          : null,
        total: total ? total.textContent.replace(/\\s+/g, ' ').trim() : null,
        fila: fila.map(paso => paso.getAttribute('data-paso-indicador')),
        cantidadActivos: activos.length,
        activoId: activo ? activo.getAttribute('data-paso-indicador') : null,
        activoEnFila: activo ? fila.indexOf(activo) : -1,
        ariaCurrent: activo ? activo.getAttribute('aria-current') : null,
      };
    })()
  `);

  assert.ok(
    r.texto !== null,
    'debe existir un contador de pasos ([data-contador]) con el total'
  );
  assert.ok(
    /\b1\s+de\s+7\b/.test(r.texto),
    `el contador debe indicar «1 de 7»; dice «${r.texto}»`
  );
  assert.equal(
    r.total, '7',
    `el total de pasos indicado debe ser 7; se leyó ${JSON.stringify(r.total)} (contador: «${r.texto}»)`
  );
  assert.equal(
    r.fila.length, 7,
    `la fila de pasos debe tener 7 elementos; tiene ${r.fila.length}: ${JSON.stringify(r.fila)}`
  );
  assert.equal(
    r.cantidadActivos, 1,
    `debe haber exactamente 1 paso activo en la fila; hay ${r.cantidadActivos}`
  );
  assert.equal(
    r.activoId, 'idea',
    `el paso activo de la fila debe ser el 1º (idea); es ${r.activoId}`
  );
  assert.equal(
    r.activoEnFila, 0,
    `el paso 1 debe estar marcado como activo EN la fila (índice 0); su índice es ${r.activoEnFila}`
  );
  assert.equal(
    r.ariaCurrent, 'step',
    `el paso activo de la fila debe marcar aria-current="step"; tiene ${JSON.stringify(r.ariaCurrent)}`
  );
});

test('C-05 · completar un paso avanza al siguiente', async () => {
  const r = await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return { idAntes: null };
      const id = activo.getAttribute('data-paso');
      activo.querySelectorAll('textarea, input[type="text"], input:not([type])')
        .forEach((campo, i) => {
          campo.value = 'respuesta de ' + id + ' ' + i;
          campo.dispatchEvent(new Event('input', { bubbles: true }));
        });
      const confirmar = activo.querySelector('[data-accion="confirmar"]');
      if (confirmar) confirmar.click();
      const despues = document.querySelector('[data-estado="activo"]');
      const antes = document.querySelector('[data-paso="' + id + '"]');
      return {
        idAntes: id,
        habiaConfirmar: !!confirmar,
        idDespues: despues ? despues.getAttribute('data-paso') : null,
        estadoAntes: antes ? antes.getAttribute('data-estado') : null,
      };
    })()
  `);

  assert.equal(r.idAntes, 'idea', 'el paso activo al cargar debe ser idea');
  assert.equal(r.habiaConfirmar, true, 'el paso activo debe tener botón de confirmar');
  assert.equal(
    r.idDespues, 'problema',
    `tras confirmar un paso válido el paso activo debe ser problema; es ${r.idDespues}`
  );
  assert.equal(
    r.estadoAntes, 'completo',
    `el paso confirmado debe quedar marcado completo; quedó en ${r.estadoAntes}`
  );
});

test('C-06 · completar los 7 pasos registra la idea', async () => {
  const recorrido = [];
  for (let i = 0; i < 7; i++) {
    const id = await app.evaluar(`
      (() => {
        const activo = document.querySelector('[data-estado="activo"]');
        if (!activo) return null;
        const id = activo.getAttribute('data-paso');
        activo.querySelectorAll('textarea, input[type="text"], input:not([type])')
          .forEach((campo, j) => {
            campo.value = id + '-dato-' + j;
            campo.dispatchEvent(new Event('input', { bubbles: true }));
          });
        const confirmar = activo.querySelector('[data-accion="confirmar"]');
        if (confirmar) confirmar.click();
        return id;
      })()
    `);
    recorrido.push(id);
  }

  assert.deepEqual(
    recorrido, IDS,
    'las 7 confirmaciones deben recorrer los 7 pasos en orden; recorrido: ' +
      JSON.stringify(recorrido)
  );

  const lista = await app.evaluar(`
    (() => {
      const contenedor = document.querySelector('[data-lista-ideas]');
      if (!contenedor) return null;
      return Array.from(contenedor.querySelectorAll('li'))
        .map(li => li.textContent.replace(/\\s+/g, ' ').trim());
    })()
  `);

  assert.ok(
    lista !== null,
    'debe existir la lista de ideas ([data-lista-ideas])'
  );
  assert.equal(
    lista.length, 1,
    `al completar los 7 pasos debe registrarse exactamente 1 idea; hay ${lista.length}: ${JSON.stringify(lista)}`
  );
  assert.ok(
    lista[0].includes('idea-dato-0'),
    `la idea registrada debe mostrar el dato del paso idea; lista: «${lista[0]}»`
  );
  assert.ok(
    lista[0].includes('problema-dato-0'),
    `la idea registrada debe mostrar el dato del paso problema; lista: «${lista[0]}»`
  );
});

test('C-86 · a 390 px la fila no desborda el viewport', async () => {
  await app.tamano(ANCHO_ANGOSTO, ALTO_ANGOSTO);
  const r = await app.evaluar(`
    (() => {
      const scrollWidth = document.scrollingElement.scrollWidth;
      const desbordes = Array.from(document.querySelectorAll('body *'))
        .map(el => {
          const rect = el.getBoundingClientRect();
          const clases = typeof el.className === 'string' && el.className
            ? '.' + el.className.trim().split(/\\s+/).join('.')
            : '';
          return {
            sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + clases,
            izq: Number(rect.left.toFixed(2)),
            der: Number(rect.right.toFixed(2)),
          };
        })
        .filter(item => item.der > window.innerWidth + 0.5 || item.izq < -0.5)
        .slice(0, 6);
      return { scrollWidth, innerWidth: window.innerWidth, desbordes };
    })()
  `);

  assert.ok(
    r.scrollWidth <= 392,
    `a ${ANCHO_ANGOSTO} px el documento no debe desbordar (scrollWidth <= 392); ` +
      `mide ${r.scrollWidth} con innerWidth=${r.innerWidth}. ` +
      `Elementos que sobresalen: ${JSON.stringify(r.desbordes)}`
  );
});

test('C-87 · a 390 px el contenido respeta el margen de 16 px', async () => {
  await app.tamano(ANCHO_ANGOSTO, ALTO_ANGOSTO);
  const r = await app.evaluar(`
    (() => {
      const primero = document.querySelector('[data-paso-indicador]');
      const rect = primero ? primero.getBoundingClientRect() : null;
      return {
        id: primero ? primero.getAttribute('data-paso-indicador') : null,
        izq: rect ? Number(rect.left.toFixed(2)) : null,
        ancho: rect ? Number(rect.width.toFixed(2)) : null,
        innerWidth: window.innerWidth,
      };
    })()
  `);

  assert.equal(
    r.innerWidth, ANCHO_ANGOSTO,
    `el margen se mide a ${ANCHO_ANGOSTO} px; el viewport medido es ${r.innerWidth} px`
  );
  assert.ok(
    r.id !== null,
    `debe existir el primer paso de la fila para medir su margen izquierdo`
  );
  assert.ok(
    r.izq >= 16,
    `a ${ANCHO_ANGOSTO} px el primer paso (${r.id}) debe empezar a >= 16 px del ` +
      `borde izquierdo; empieza en ${r.izq} px (ancho ${r.ancho})`
  );
});

test('C-88 · a 1200 px los 7 pasos caben sin recortar en su contenedor', async () => {
  await app.tamano(ANCHO_GEOMETRIA, 800);
  const r = await app.evaluar(`
    (() => {
      const cont = document.querySelector('[data-paso-indicador]').parentElement;
      const rectCont = cont.getBoundingClientRect();
      const pasos = Array.from(cont.querySelectorAll('[data-paso-indicador]'));
      return {
        scrollWidth: cont.scrollWidth,
        clientWidth: cont.clientWidth,
        innerWidth: window.innerWidth,
        contenedorRight: Number(rectCont.right.toFixed(2)),
        pasos: pasos.map(p => {
          const r = p.getBoundingClientRect();
          return {
            id: p.getAttribute('data-paso-indicador'),
            right: Number(r.right.toFixed(2)),
          };
        }),
      };
    })()
  `);

  assert.ok(
    r.scrollWidth <= r.clientWidth + 2,
    `C-88 FAIL: contenedor recorta — scrollWidth=${r.scrollWidth} > clientWidth=${r.clientWidth} ` +
      `(innerWidth=${r.innerWidth}). Pasos: ${JSON.stringify(r.pasos)}`
  );

  const fuera = r.pasos.filter(p => p.right > r.contenedorRight + 0.5);
  assert.equal(
    fuera.length, 0,
    `C-88 FAIL: ${fuera.length} paso(s) quedan fuera del contenedor (right > contenedor.right): ` +
      `${JSON.stringify(fuera)}. contenedor.right=${r.contenedorRight}, ` +
      `scrollWidth=${r.scrollWidth}, clientWidth=${r.clientWidth}`
  );
});
