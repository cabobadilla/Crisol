// T-7a — Piel Pizarra: casos C-40, C-41, C-42, C-48
// Los 13 tokens se leen del DOM con getComputedStyle sobre el elemento raíz (CDP).
import test from 'node:test';
import assert from 'node:assert/strict';
import { abrirNavegador } from './helpers/cdp.mjs';

const TOKENS_LIGHT = {
  '--bg': '#f6f7f9',
  '--surface': '#ffffff',
  '--surface-2': '#eef1f5',
  '--text': '#16191f',
  '--muted': '#565d6b',
  '--accent': '#1f5fbf',
  '--on-accent': '#ffffff',
  '--border': '#d9dee5',
  '--shadow': '0 1px 2px rgba(22, 27, 45, 0.09)',
  '--font-heading': "'Inter', system-ui, -apple-system, sans-serif",
  '--font-body': "'Inter', system-ui, -apple-system, sans-serif",
  '--radius': '10px',
  '--container': '1120px',
};

const TOKENS_DARK = {
  '--bg': '#0f1216',
  '--surface': '#171b21',
  '--surface-2': '#1f242b',
  '--text': '#e8eaee',
  '--muted': '#a3abb8',
  '--accent': '#7aa8ff',
  '--on-accent': '#0d1117',
  '--border': '#2a313a',
  '--shadow': '0 1px 2px rgba(0, 0, 0, 0.5)',
  '--font-heading': "'Inter', system-ui, -apple-system, sans-serif",
  '--font-body': "'Inter', system-ui, -apple-system, sans-serif",
  '--radius': '10px',
  '--container': '1120px',
};

function normalizarColor(valor) {
  // Normaliza rgb/rgba a hex si es color sólido, deja sombras y fuentes tal cual
  if (valor.startsWith('rgb')) {
    const match = valor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
    if (match) {
      const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
      const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
      const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
  }
  return valor.trim();
}

function normalizarFuente(valor) {
  return valor.replace(/\s+/g, ' ').replace(/'/g, '"').trim();
}

let app;

test('C-40 · modo claro expone los 13 tokens exactos en :root[data-mode="light"]', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  const tokens = await app.evaluar(`
    (() => {
      const root = document.documentElement;
      const estilo = getComputedStyle(root);
      const tokens = {};
      [
        '--bg', '--surface', '--surface-2', '--text', '--muted', '--accent',
        '--on-accent', '--border', '--shadow', '--font-heading', '--font-body',
        '--radius', '--container'
      ].forEach(nombre => {
        tokens[nombre] = estilo.getPropertyValue(nombre).trim();
      });
      return tokens;
    })()
  `);

  await app.cerrar();
  app = null;

  for (const [nombre, esperado] of Object.entries(TOKENS_LIGHT)) {
    const obtenido = normalizarColor(tokens[nombre]);
    const espNorm = normalizarColor(esperado);
    assert.equal(
      obtenido, espNorm,
      `token ${nombre}: esperado "${espNorm}", obtenido "${obtenido}"`
    );
  }
});

test('C-41 · modo oscuro expone los 13 tokens exactos en :root[data-mode="dark"]', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  const tokens = await app.evaluar(`
    (() => {
      const root = document.documentElement;
      root.setAttribute('data-mode', 'dark');
      const estilo = getComputedStyle(root);
      const tokens = {};
      [
        '--bg', '--surface', '--surface-2', '--text', '--muted', '--accent',
        '--on-accent', '--border', '--shadow', '--font-heading', '--font-body',
        '--radius', '--container'
      ].forEach(nombre => {
        tokens[nombre] = estilo.getPropertyValue(nombre).trim();
      });
      return tokens;
    })()
  `);

  await app.cerrar();
  app = null;

  for (const [nombre, esperado] of Object.entries(TOKENS_DARK)) {
    const obtenido = normalizarColor(tokens[nombre]);
    const espNorm = normalizarColor(esperado);
    assert.equal(
      obtenido, espNorm,
      `token ${nombre}: esperado "${espNorm}", obtenido "${obtenido}"`
    );
  }
});

test('C-42 · todo el CSS usa var(--…) en lugar de hex sueltos', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  const resultado = await app.evaluar(`
    (() => {
      const hojas = Array.from(document.styleSheets);
      const violaciones = [];
      for (const hoja of hojas) {
        try {
          const reglas = Array.from(hoja.cssRules || []);
          for (const regla of reglas) {
            if (regla.type === 1) { // CSSStyleRule
              // Saltar las reglas donde se definen los tokens (:_root[data-mode])
              if (regla.selectorText && regla.selectorText.includes(':root[data-mode')) continue;
              const estilo = regla.style;
              for (let i = 0; i < estilo.length; i++) {
                const prop = estilo[i];
                const valor = estilo.getPropertyValue(prop);
                // Busca colores hex que NO sean dentro de var()
                if (/#[0-9a-fA-F]{3,8}/.test(valor) && !/var\\(/.test(valor)) {
                  violaciones.push({
                    selector: regla.selectorText,
                    propiedad: prop,
                    valor: valor.trim()
                  });
                }
              }
            }
          }
        } catch (e) {
          // Hojas cross-origin u otras que no se pueden leer
        }
      }
      return violaciones;
    })()
  `);

  await app.cerrar();
  app = null;

  assert.equal(
    resultado.length, 0,
    `CSS contiene valores hex sueltos (no var()): ${JSON.stringify(resultado, null, 2)}`
  );
});

test('C-48 · el contenedor usa max-width: var(--container)', async () => {
  app = await abrirNavegador();
  await app.tamano(1200, 800);

  const resultado = await app.evaluar(`
    (() => {
      const main = document.querySelector('main');
      if (!main) return { encontrado: false };
      const estilo = getComputedStyle(main);
      return {
        encontrado: true,
        maxWidth: estilo.getPropertyValue('max-width').trim(),
        width: estilo.getPropertyValue('width').trim()
      };
    })()
  `);

  await app.cerrar();
  app = null;

  assert.ok(resultado.encontrado, 'debe existir el elemento main');
  assert.ok(
    resultado.maxWidth.includes('1120px') || resultado.maxWidth.includes('var(--container)'),
    `main debe tener max-width: var(--container) (1120px); max-width actual: "${resultado.maxWidth}"`
  );
});