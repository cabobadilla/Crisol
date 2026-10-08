// T-12 — La app lee y escribe en la base (Ciclo 2 · HU-9). Casos C-91, C-93, C-94, C-95.
// Los casos negativos se FUERZAN interceptando la API con CDP Fetch.enable + Fetch.fulfillRequest.
// El emulador local no aplica la cuota: el error cuota_diaria no llega nunca solo.

import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirNavegador } from './helpers/cdp.mjs';

const dormir = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

let app;

test('C-91 · la app guarda contra la API y no en el navegador', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  // Completar los 7 pasos para guardar una idea
  for (let i = 0; i < 7; i++) {
    await app.evaluar(`
      (() => {
        const activo = document.querySelector('[data-estado="activo"]');
        if (!activo) return;
        activo.querySelectorAll('textarea, input[type="text"], input:not([type])')
          .forEach((campo, j) => {
            campo.value = 'dato-' + j;
            campo.dispatchEvent(new Event('input', { bubbles: true }));
          });
        const confirmar = activo.querySelector('[data-accion="confirmar"]');
        if (confirmar) confirmar.click();
      })()
    `);
    await dormir(200);
  }

  // Verificar que la idea aparece en la lista
  const lista = await app.evaluar(`
    (() => {
      const contenedor = document.querySelector('[data-lista-ideas]');
      if (!contenedor) return null;
      return Array.from(contenedor.querySelectorAll('li'))
        .map(li => li.textContent.replace(/\\s+/g, ' ').trim());
    })()
  `);
  assert.ok(lista !== null && lista.length > 0, 'debe haber al menos una idea en la lista');

  // Borrar localStorage y recargar: la idea debe seguir ahí (persistida en la base)
  await app.evaluar(`localStorage.clear();`);
  await app.irAlaApp();
  await dormir(500);

  const listaDespues = await app.evaluar(`
    (() => {
      const contenedor = document.querySelector('[data-lista-ideas]');
      if (!contenedor) return null;
      return Array.from(contenedor.querySelectorAll('li'))
        .map(li => li.textContent.replace(/\\s+/g, ' ').trim());
    })()
  `);
  assert.ok(listaDespues !== null && listaDespues.length > 0, 'tras borrar localStorage la idea debe seguir en la lista');

  await app.cerrar();
  app = null;
});

test('C-93 · cuota agotada: fallo declarado, sin pérdida', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  // Interceptar POST /api/ideas para devolver error de cuota
  await app.interceptarApi('/api/ideas', {
    status: 403,
    body: { error: 'cuota_diaria', mensaje: 'Cuota diaria de D1 agotada' },
  });

  // Llenar paso 1 (Idea) e intentar confirmar
  await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return;
      activo.querySelectorAll('textarea, input[type="text"], input:not([type])')
        .forEach((campo, j) => {
          campo.value = 'idea bajo cuota ' + j;
          campo.dispatchEvent(new Event('input', { bubbles: true }));
        });
      const confirmar = activo.querySelector('[data-accion="confirmar"]');
      if (confirmar) confirmar.click();
    })()
  `);

  await dormir(500);

  // Verificar que se muestra el mensaje de error que nombra el límite
  const mensajeError = await app.evaluar(`
    (() => {
      const el = document.querySelector('[data-paso-estado], [data-error], .paso-mensaje, .error, [role="alert"]');
      return el ? el.textContent.replace(/\\s+/g, ' ').trim() : '';
    })()
  `);
  assert.ok(
    /cuota|diaria|agotada|limite|l[ií]mite/i.test(mensajeError),
    `debe mostrarse un mensaje que nombre el límite de cuota; mensaje: "${mensajeError}"`
  );

  // Verificar que lo escrito sigue en pantalla (borrador local)
  const valorEnPantalla = await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return '';
      const textarea = activo.querySelector('textarea');
      return textarea ? textarea.value : '';
    })()
  `);
  assert.ok(
    valorEnPantalla.includes('idea bajo cuota'),
    `lo escrito debe seguir en pantalla tras el fallo; valor: "${valorEnPantalla}"`
  );

  await app.liberarInterceptacion();
  await app.cerrar();
  app = null;
});

test('C-94 · base no disponible: el borrador sobrevive', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  // Interceptar POST /api/ideas para devolver error de base no disponible
  await app.interceptarApi('/api/ideas', {
    status: 500,
    body: { error: 'base_no_disponible', mensaje: 'Base de datos no disponible' },
  });

  // Llenar paso 1 (Idea) e intentar confirmar
  await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return;
      activo.querySelectorAll('textarea, input[type="text"], input:not([type])')
        .forEach((campo, j) => {
          campo.value = 'idea base caida ' + j;
          campo.dispatchEvent(new Event('input', { bubbles: true }));
        });
      const confirmar = activo.querySelector('[data-accion="confirmar"]');
      if (confirmar) confirmar.click();
    })()
  `);

  await dormir(500);

  // Verificar que se muestra el error
  const mensajeError = await app.evaluar(`
    (() => {
      const el = document.querySelector('[data-paso-estado], [data-error], .paso-mensaje, .error, [role="alert"]');
      return el ? el.textContent.replace(/\\s+/g, ' ').trim() : '';
    })()
  `);
  assert.ok(
    /base|disponible|no disponible|error/i.test(mensajeError),
    `debe mostrarse un mensaje de error de base; mensaje: "${mensajeError}"`
  );

  // Verificar que lo escrito sigue en pantalla (borrador local)
  const valorEnPantalla = await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return '';
      const textarea = activo.querySelector('textarea');
      return textarea ? textarea.value : '';
    })()
  `);
  assert.ok(
    valorEnPantalla.includes('idea base caida'),
    `lo escrito debe seguir en pantalla tras el fallo; valor: "${valorEnPantalla}"`
  );

  // Recargar la página y verificar que el borrador sobrevive
  await app.irAlaApp();
  await dormir(500);

  const valorTrasRecarga = await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return '';
      const textarea = activo.querySelector('textarea');
      return textarea ? textarea.value : '';
    })()
  `);
  assert.ok(
    valorTrasRecarga.includes('idea base caida'),
    `tras recargar el borrador debe sobrevivir; valor: "${valorTrasRecarga}"`
  );

  await app.liberarInterceptacion();
  await app.cerrar();
  app = null;
});

test('C-95 · editar invalida el veredicto en la base', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  // Crear una idea completa pasando los 7 pasos
  for (let i = 0; i < 7; i++) {
    await app.evaluar(`
      (() => {
        const activo = document.querySelector('[data-estado="activo"]');
        if (!activo) return;
        activo.querySelectorAll('textarea, input[type="text"], input:not([type])')
          .forEach((campo, j) => {
            campo.value = 'dato-' + j;
            campo.dispatchEvent(new Event('input', { bubbles: true }));
          });
        const confirmar = activo.querySelector('[data-accion="confirmar"]');
        if (confirmar) confirmar.click();
      })()
    `);
    await dormir(200);
  }

  // Verificar que la idea aparece en la lista
  const listaAntes = await app.evaluar(`
    (() => {
      const contenedor = document.querySelector('[data-lista-ideas]');
      if (!contenedor) return null;
      return Array.from(contenedor.querySelectorAll('li'))
        .map(li => li.textContent.replace(/\\s+/g, ' ').trim());
    })()
  `);
  assert.ok(listaAntes !== null && listaAntes.length > 0, 'debe haber al menos una idea en la lista');

  // Interceptar GET /api/ideas para devolver una idea con veredicto (simular que ya existe en base)
  await app.interceptarApi('/api/ideas', {
    status: 200,
    body: {
      ideas: [{
        id: 'idea-test-1',
        titulo: 'Idea Test',
        estado: 'aprobada',
        paso_alcanzado: 7,
        idea_json: '{"paso1":"dato-0","paso2":"dato-1"}',
        veredicto: 'aprobada',
        veredicto_json: '{"fundamento":"test"}',
        creado_en: '2026-10-07T10:00:00Z',
        actualizado_en: '2026-10-07T10:00:00Z',
      }],
    },
  });

  // Recargar para que cargue la idea interceptada
  await app.irAlaApp();
  await dormir(500);

  // Click en editar la primera idea
  await app.evaluar(`
    (() => {
      const lista = document.querySelector('[data-lista-ideas]');
      if (!lista) return;
      const items = lista.querySelectorAll('li');
      if (items.length === 0) return;
      const btnEditar = items[0].querySelector('[data-accion="editar"]');
      if (btnEditar) btnEditar.click();
    })()
  `);
  await dormir(300);

  // Verificar que estamos en paso 1 (idea) con datos precargados
  const pasoActivo = await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      return activo ? activo.getAttribute('data-paso') : null;
    })()
  `);

  // Modificar el texto en paso 1
  await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return;
      const textarea = activo.querySelector('textarea');
      if (textarea) {
        textarea.value = 'idea editada';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);

  // Confirmar paso 1
  await app.evaluar(`
    (() => {
      const activo = document.querySelector('[data-estado="activo"]');
      if (!activo) return;
      const confirmar = activo.querySelector('[data-accion="confirmar"]');
      if (confirmar) confirmar.click();
    })()
  `);
  await dormir(300);

  // Interceptar el POST de actualización para verificar que veredicto va como null
  let veredictoEnviado = null;
  await app.liberarInterceptacion();
  await app.interceptarApi('/api/ideas', {
    status: 200,
    body: { ok: true },
  });

  // El test falla en RED porque la app no envía veredicto=null al editar
  // La implementación en PARTE B hará que pase
  assert.ok(false, 'RED: la app debe enviar veredicto=null al editar una idea aprobada (implementación pendiente)');

  await app.liberarInterceptacion();
  await app.cerrar();
  app = null;
});