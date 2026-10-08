// T-10 — La base y su migración (Ciclo 2 · HU-9). Casos C-89, C-90, C-96, C-98.
//
// La suite corre en local y no depende de la red. C-98 necesita el Worker vivo:
// lo levanta el PROPIO test con `npx wrangler dev` (D1 emulada, sin cuenta ni
// token) en un puerto libre, aplica la migración con
// `npx wrangler d1 migrations apply crisol-ideas --local` contra el directorio
// de persistencia del test, y lo cierra al terminar. Todo lo temporal va a
// ./.tmp/ dentro del proyecto.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(REPO_ROOT, '.tmp', 'ciclo2-t10');

function readJsonc(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content.replace(/\/\/.*$/gm, '').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'));
}

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

const dormir = ms => new Promise(resolver => setTimeout(resolver, ms));

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
  proceso.stdout.on('data', f => registro.push(f.toString()));
  proceso.stderr.on('data', f => registro.push(f.toString()));
  return { proceso, leer: () => registro.join('') };
}

function terminarWranglerDev(proceso) {
  if (!proceso || proceso.exitCode !== null) return;
  try { process.kill(-proceso.pid, 'SIGTERM'); } catch { /* ya terminado */ }
  const fin = Date.now() + 5000;
  while (proceso.exitCode === null && Date.now() < fin) {}
  if (proceso.exitCode === null) {
    try { process.kill(-proceso.pid, 'SIGKILL'); } catch { /* ya terminado */ }
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
  try { return JSON.parse(texto); } catch { return { texto }; }
}

test('C-89 · la config declara la forma B: main, binding DB y run_worker_first con /api/*', () => {
  const wranglerPath = path.join(REPO_ROOT, 'wrangler.jsonc');
  assert.ok(fs.existsSync(wranglerPath), 'wrangler.jsonc debe existir en la raíz del repo');
  const config = readJsonc(wranglerPath);

  assert.equal(config.main, './src/worker.js', 'wrangler.jsonc debe tener main "./src/worker.js"');

  assert.ok(Array.isArray(config.assets?.run_worker_first), 'assets.run_worker_first debe existir');
  assert.ok(
    config.assets.run_worker_first.includes('/api/*'),
    'assets.run_worker_first debe incluir "/api/*"',
  );
  assert.equal(config.assets.binding, 'ASSETS', 'assets.binding debe ser "ASSETS"');

  assert.ok(Array.isArray(config.d1_databases), 'wrangler.jsonc debe tener d1_databases');
  assert.equal(config.d1_databases[0]?.binding, 'DB', 'd1_databases[0].binding debe ser "DB"');
  assert.equal(config.d1_databases[0]?.database_name, 'crisol-ideas', 'd1_databases[0].database_name debe ser "crisol-ideas"');

  assert.notEqual(config.name, undefined, '"name" no se toca en el Ciclo 2');
  assert.notEqual(config.compatibility_date, undefined, '"compatibility_date" no se toca en el Ciclo 2');
});

test('C-90 · el diseño declara el límite que ahora aplica y no afirma "cero límites de plan"', () => {
  const diseno = fs.readFileSync(path.join(REPO_ROOT, 'docs', '04-DISENO.md'), 'utf-8');
  assert.ok(diseno.includes('100.000 requests/día'), '04-DISENO.md debe nombrar los 100.000 requests/día');
  assert.ok(diseno.includes('10 ms de CPU'), '04-DISENO.md debe nombrar los 10 ms de CPU');
  assert.ok(diseno.includes('Cuota diaria de D1'), '04-DISENO.md debe nombrar la cuota diaria de D1');
  assert.ok(
    diseno.includes('ahora sí aplican'),
    '04-DISENO.md debe afirmar que los límites del plan ahora aplican (no "cero límites")',
  );
});

test('C-96 · la migración existe y es versionada: CREATE TABLE ideas + el índice', () => {
  const migracionPath = path.join(REPO_ROOT, 'migrations', '0001_ideas.sql');
  assert.ok(fs.existsSync(migracionPath), 'debe existir migrations/0001_ideas.sql');
  const sql = fs.readFileSync(migracionPath, 'utf-8');
  assert.ok(sql.includes('CREATE TABLE ideas'), '0001_ideas.sql debe tener "CREATE TABLE ideas"');
  assert.ok(
    sql.includes('CREATE INDEX idx_ideas_actualizado'),
    '0001_ideas.sql debe tener "CREATE INDEX idx_ideas_actualizado"',
  );
  assert.ok(
    sql.includes('idx_ideas_actualizado ON ideas'),
    'el índice debe ser sobre la tabla ideas',
  );
});

test('C-98 · GET /api/salud responde contra la tabla: con migración 200 y conteo real; sin migración falla', async () => {
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });
  const puertoSinMigracion = await puertoLibre();
  const puertoMigrado = await puertoLibre();
  const dirSinMigracion = path.join(TMP, 'd1-sin-migracion');
  const dirMigrado = path.join(TMP, 'd1-migrado');

  let devSinMigracion = null;
  let devMigrado = null;
  try {
    // 1) Sin migración aplicada: el binding está, pero la tabla no existe.
    //    /api/salud debe FALLAR (500 base_no_disponible), no inventar un conteo.
    devSinMigracion = iniciarWranglerDev(puertoSinMigracion, dirSinMigracion);
    const respuestaSinMigracion = await esperarRespuesta(devSinMigracion, puertoSinMigracion);
    const cuerpoSinMigracion = await cuerpoJson(respuestaSinMigracion);
    assert.equal(
      respuestaSinMigracion.status,
      500,
      'sin migración /api/salud debe fallar con 500 (no devolver un conteo inventado)',
    );
    assert.equal(
      cuerpoSinMigracion.error,
      'base_no_disponible',
      'sin migración el error debe ser "base_no_disponible"',
    );
    terminarWranglerDev(devSinMigracion.proceso);
    devSinMigracion = null;

    // 2) Aplicar la migración a UNA base emulada local (sin cuenta y sin token),
    //    y comprobar que /api/salud devuelve el conteo real contra la tabla.
    const aplicar = spawnSync(
      'npx',
      ['wrangler', 'd1', 'migrations', 'apply', 'crisol-ideas', '--local', '--persist-to', dirMigrado],
      { cwd: REPO_ROOT, env: { ...process.env, CI: 'true' }, encoding: 'utf-8' },
    );
    const salidaAplicar = (aplicar.stdout || '') + (aplicar.stderr || '');
    assert.equal(aplicar.status, 0, `la migración local debe aplicar; salida: ${salidaAplicar.slice(-1500)}`);

    // 2b) Insertar 3 filas CONOCIDAS en la misma base emulada (mismo --persist-to),
    //     ANTES de levantar el worker migrado, para que el conteo no pueda acertarse
    //     con una tabla vacía: con 0 filas un conteo inventado coincide con el real.
    const insertar = spawnSync(
      'npx',
      [
        'wrangler', 'd1', 'execute', 'crisol-ideas', '--local',
        '--persist-to', dirMigrado,
        '--command',
        'INSERT INTO ideas (id, titulo, estado, paso_alcanzado, idea_json, creado_en, actualizado_en) VALUES ' +
          "('c98-1','idea 1','definida',1,'{}','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')," +
          "('c98-2','idea 2','definida',2,'{}','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')," +
          "('c98-3','idea 3','definida',3,'{}','2026-01-01T00:00:00Z','2026-01-01T00:00:00Z')",
      ],
      { cwd: REPO_ROOT, env: { ...process.env, CI: 'true' }, encoding: 'utf-8' },
    );
    const salidaInsertar = (insertar.stdout || '') + (insertar.stderr || '');
    assert.equal(
      insertar.status,
      0,
      `las 3 filas deben insertarse en la base emulada; salida: ${salidaInsertar.slice(-1500)}`,
    );

    devMigrado = iniciarWranglerDev(puertoMigrado, dirMigrado);
    const respuestaMigrado = await esperarRespuesta(devMigrado, puertoMigrado);
    const cuerpoMigrado = await cuerpoJson(respuestaMigrado);
    assert.equal(respuestaMigrado.status, 200, 'con migración aplicada /api/salud debe responder 200');
    assert.equal(cuerpoMigrado.ok, true, 'el cuerpo debe ser {"ok":true,"ideas":<n>}');
    assert.equal(
      cuerpoMigrado.ideas,
      3,
      'se insertaron exactamente 3 filas: el conteo debe ser 3 (real), no 0 ni un valor inventado',
    );
  } finally {
    terminarWranglerDev(devSinMigracion?.proceso);
    terminarWranglerDev(devMigrado?.proceso);
    fs.rmSync(TMP, { recursive: true, force: true });
  }
});