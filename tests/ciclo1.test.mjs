// T-1 — Esqueleto del wizard de Crisol: casos C-01..C-06 (Grupo A, HU-1).
//
// Contrato (docs/04-DISENO.md § Contratos): los nombres de paso y sus títulos
// son exactos. El marcado observado por los tests es:
//   - cada paso:  <li data-paso="<id>" data-estado="bloqueado|activo|completo">
//   - título:     elemento .paso-titulo dentro del paso
//   - controles:  <button data-accion="confirmar"> y campos de texto del paso
//   - contador:   [data-contador] con el total en [data-contador] [data-total]
//   - lista:      [data-lista-ideas] con un <li> por idea registrada
//
// Los casos de comportamiento ejecutan el artefacto: servidor node:http en
// puerto efímero + Chrome headless por CDP. No se lee el HTML como texto.
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

let app;

before(async () => { app = await abrirNavegador(); });
after(async () => { if (app) await app.cerrar(); });
beforeEach(async () => { await app.irAlaApp(); });

test('C-01 · los 7 pasos se muestran en orden', async () => {
  const pasos = await app.evaluar(`
    Array.from(document.querySelectorAll('[data-paso]')).map(paso => ({
      id: paso.getAttribute('data-paso'),
      titulo: ((paso.querySelector('.paso-titulo') || {}).textContent || '')
        .replace(/\\s+/g, ' ').trim(),
    }))
  `);

  assert.equal(
    pasos.length, 7,
    `el DOM debe tener exactamente 7 pasos; hay ${pasos.length}: ${JSON.stringify(pasos)}`
  );
  assert.deepEqual(
    pasos.map(paso => paso.id), IDS,
    'los ids de los 7 pasos, en el orden del contrato PASOS'
  );
  assert.deepEqual(
    pasos.map(paso => paso.titulo), TITULOS,
    'los títulos de los 7 pasos, en el orden del contrato PASOS'
  );
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

test('C-03 · los pasos futuros son visibles, no ocultos', async () => {
  const r = await app.evaluar(`
    Array.from(document.querySelectorAll('[data-paso]')).map(paso => {
      const titulo = paso.querySelector('.paso-titulo');
      const estiloPaso = getComputedStyle(paso);
      const estiloTitulo = titulo ? getComputedStyle(titulo) : null;
      return {
        id: paso.getAttribute('data-paso'),
        estado: paso.getAttribute('data-estado'),
        titulo: ((titulo || {}).textContent || '').replace(/\\s+/g, ' ').trim(),
        oculto: paso.hasAttribute('hidden') ||
                estiloPaso.display === 'none' ||
                estiloPaso.visibility === 'hidden' ||
                (estiloTitulo &&
                  (estiloTitulo.display === 'none' ||
                   estiloTitulo.visibility === 'hidden')),
      };
    })
  `);

  assert.equal(
    r.length, 7,
    `deben existir los 7 pasos; se hallaron ${r.length}`
  );
  r.forEach((paso, i) => {
    assert.equal(
      paso.titulo, TITULOS[i],
      `el título del paso ${i + 1} debe ser «${TITULOS[i]}»; es «${paso.titulo}»`
    );
    assert.equal(
      paso.oculto, false,
      `el paso ${paso.id} está oculto (display/visibility/hidden); los pasos futuros deben verse`
    );
    if (i > 0) {
      assert.equal(
        paso.estado, 'bloqueado',
        `el paso ${paso.id} debe estar bloqueado aunque sea visible; estado: ${paso.estado}`
      );
    }
  });
});

test('C-04 · se indica el total de pasos', async () => {
  const r = await app.evaluar(`
    (() => {
      const contador = document.querySelector('[data-contador]');
      const total = document.querySelector('[data-contador] [data-total]');
      return {
        texto: contador
          ? contador.textContent.replace(/\\s+/g, ' ').trim()
          : null,
        total: total ? total.textContent.replace(/\\s+/g, ' ').trim() : null,
      };
    })()
  `);

  assert.ok(
    r.texto !== null,
    'debe existir un contador de pasos ([data-contador]) con el total'
  );
  assert.equal(
    r.total, '7',
    `el total de pasos indicado debe ser 7; se leyó ${JSON.stringify(r.total)} (contador: «${r.texto}»)`
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
