// T-11 — El Worker: la API de dos operaciones (Ciclo 2 · HU-9). Casos C-91, C-92, C-99.
//
// Reutiliza el mecanismo de ciclo2-t10.test.mjs: puerto libre, --persist-to dentro de ./.tmp/,
// aplicar la migración, cerrar el proceso al terminar. Sin red.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP_BASE = path.join(REPO_ROOT, '.tmp', 'ciclo2-t11');

function puertoLibre() {
  return new Promise((resolver, rechazar) => {
    const servidor = net.createServer();
    servidor.once('error', rechazar);
    servidor.listen(0, '127.0.0.1', () => {
      const puerto = servidor.address().port;
      servidor.close(() => resolver(puerto));
    });
  });
}

const dormir = (ms) => new Promise((resolver) => setTimeout(resolver, ms));

function iniciarWranglerDev(puerto, persistir) {
  const registro = [];
  const proceso = spawn(
    'npx',
    ['wrangler', 'dev', '--port', `${puerto}`, '--persist-to', persistir],
    {
      cwd: REPO_ROOT,
      env: { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', NO_UPDATE_NOTIFIER: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: true,
    },
  );
  proceso.stdout.on('data', (f) => registro.push(f.toString()));
  proceso.stderr.on('data', (f) => registro.push(f.toString()));
  return { proceso, leer: () => registro.join('') };
}

function terminarWranglerDev(proceso) {
  if (!proceso || proceso.exitCode !== null) return;
  try {
    process.kill(-proceso.pid, 'SIGTERM');
  } catch {
    /* ya terminado */
  }
  const fin = Date.now() + 5000;
  while (proceso.exitCode === null && Date.now() < fin) {}
  if (proceso.exitCode === null) {
    try {
      process.kill(-proceso.pid, 'SIGKILL');
    } catch {
      /* ya terminado */
    }
  }
}

async function esperarRespuesta(instancia, puerto) {
  const limite = Date.now() + 60000;
  while (Date.now() < limite) {
    if (instancia.proceso.exitCode !== null) {
      throw new Error(
        `wrangler dev terminó antes de responder (código ${instancia.proceso.exitCode}). ` +
          `stderr: ${instancia.leer().slice(-1500)}`,
      );
    }
    try {
      const respuesta = await fetch(`http://127.0.0.1:${puerto}/api/salud`);
      return respuesta;
    } catch {
      // El servidor todavía no escucha.
    }
    await dormir(400);
  }
  throw new Error(`wrangler dev no respondió en 60s. stderr: ${instancia.leer().slice(-1500)}`);
}

async function cuerpoJson(respuesta) {
  const texto = await respuesta.text();
  try {
    return JSON.parse(texto);
  } catch {
    return { texto };
  }
}

test("C-91 · Guardar escribe en la base, no en el navegador", async () => {
  const dir = path.join(TMP_BASE, 'c91');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const puerto = await puertoLibre();
  let dev = null;
  try {
    const aplicar = spawnSync(
      'npx',
      ['wrangler', 'd1', 'migrations', 'apply', 'crisol-ideas', '--local', '--persist-to', dir],
      { cwd: REPO_ROOT, env: { ...process.env, CI: 'true' }, encoding: 'utf-8' },
    );
    assert.equal(aplicar.status, 0, `migración debe aplicar: ${(aplicar.stdout || '') + (aplicar.stderr || '')}`);

    dev = iniciarWranglerDev(puerto, dir);
    await esperarRespuesta(dev, puerto);

    const idea = {
      id: 'idea-c91-1',
      titulo: 'Idea C91',
      estado: 'en_curso',
      paso_alcanzado: 1,
      idea_json: '{"paso1":"valor1"}',
      veredicto: null,
      veredicto_json: null,
      creado_en: '2026-10-07T10:00:00Z',
      actualizado_en: '2026-10-07T10:00:00Z',
    };

    const post = await fetch(`http://127.0.0.1:${puerto}/api/ideas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(idea),
    });
    assert.equal(post.status, 201, 'POST /api/ideas debe devolver 201');
    const postBody = await cuerpoJson(post);
    assert.equal(postBody.id, idea.id);
    assert.ok(postBody.actualizado_en);

    const get = await fetch(`http://127.0.0.1:${puerto}/api/ideas`);
    assert.equal(get.status, 200, 'GET /api/ideas debe devolver 200');
    const getBody = await cuerpoJson(get);
    assert.ok(Array.isArray(getBody.ideas));
    assert.equal(getBody.ideas.length, 1);
    assert.equal(getBody.ideas[0].id, idea.id);
  } finally {
    terminarWranglerDev(dev?.proceso);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("C-92 · Guardar dos veces no duplica", async () => {
  const dir = path.join(TMP_BASE, 'c92');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const puerto = await puertoLibre();
  let dev = null;
  try {
    const aplicar = spawnSync(
      'npx',
      ['wrangler', 'd1', 'migrations', 'apply', 'crisol-ideas', '--local', '--persist-to', dir],
      { cwd: REPO_ROOT, env: { ...process.env, CI: 'true' }, encoding: 'utf-8' },
    );
    assert.equal(aplicar.status, 0, `migración debe aplicar: ${(aplicar.stdout || '') + (aplicar.stderr || '')}`);

    dev = iniciarWranglerDev(puerto, dir);
    await esperarRespuesta(dev, puerto);

    const idea = {
      id: 'idea-c92-1',
      titulo: 'Idea C92',
      estado: 'en_curso',
      paso_alcanzado: 1,
      idea_json: '{"paso1":"valor1"}',
      veredicto: null,
      veredicto_json: null,
      creado_en: '2026-10-07T10:00:00Z',
      actualizado_en: '2026-10-07T10:00:00Z',
    };

    const post1 = await fetch(`http://127.0.0.1:${puerto}/api/ideas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(idea),
    });
    assert.equal(post1.status, 201);

    const idea2 = { ...idea, titulo: 'Idea C92 Actualizada', actualizado_en: '2026-10-07T11:00:00Z' };
    const post2 = await fetch(`http://127.0.0.1:${puerto}/api/ideas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(idea2),
    });
    assert.equal(post2.status, 201);

    const get = await fetch(`http://127.0.0.1:${puerto}/api/ideas`);
    assert.equal(get.status, 200);
    const getBody = await cuerpoJson(get);
    assert.equal(getBody.ideas.length, 1);
  } finally {
    terminarWranglerDev(dev?.proceso);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('C-99 · clasificarError: cuota_diaria vs base_no_disponible', async () => {
  const workerModule = await import('file://' + path.join(REPO_ROOT, 'src', 'worker.js'));
  assert.equal(typeof workerModule.clasificarError, 'function', 'src/worker.js debe exportar clasificarError');

  assert.equal(
    workerModule.clasificarError(new Error('cuota diaria de D1 agotada')),
    'cuota_diaria',
  );
  assert.equal(
    workerModule.clasificarError(new Error('Daily D1 quota exceeded')),
    'cuota_diaria',
  );
  assert.equal(
    workerModule.clasificarError(new Error('cloudflare d1 quota exceeded')),
    'cuota_diaria',
  );

  assert.equal(workerModule.clasificarError(new Error('binding not found')), 'base_no_disponible');
  assert.equal(workerModule.clasificarError(new Error('table ideas does not exist')), 'base_no_disponible');
  assert.equal(workerModule.clasificarError('otro error'), 'base_no_disponible');
  assert.equal(workerModule.clasificarError(), 'base_no_disponible');
});
