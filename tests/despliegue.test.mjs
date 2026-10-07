import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function readJsonc(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content.replace(/\/\/.*$/gm, '').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']'));
}

function getTrackedFiles() {
  try {
    const output = execSync('git ls-files', { cwd: REPO_ROOT, encoding: 'utf-8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

test('C-50 · wrangler.jsonc tiene assets.directory y no tiene main', () => {
  const wranglerPath = path.join(REPO_ROOT, 'wrangler.jsonc');
  assert.ok(fs.existsSync(wranglerPath), 'wrangler.jsonc debe existir en la raíz del repo');
  const config = readJsonc(wranglerPath);
  assert.ok('assets' in config, 'wrangler.jsonc debe tener clave "assets"');
  assert.ok('directory' in config.assets, 'wrangler.jsonc debe tener assets.directory');
  assert.equal('main' in config, false, 'wrangler.jsonc NO debe tener clave "main" (worker solo-assets)');
});

test('C-51 · assets.directory === "./public"', () => {
  const wranglerPath = path.join(REPO_ROOT, 'wrangler.jsonc');
  const config = readJsonc(wranglerPath);
  assert.equal(config.assets.directory, './public', 'assets.directory debe ser "./public"');
});

test('C-52 · public/ contiene index.html y nada de docs/, tests/, scripts/', () => {
  const publicDir = path.join(REPO_ROOT, 'public');
  assert.ok(fs.existsSync(publicDir), 'directorio public/ debe existir');

  const files = fs.readdirSync(publicDir);
  assert.ok(files.includes('index.html'), 'public/ debe contener index.html');

  const forbidden = ['docs', 'tests', 'scripts'];
  for (const f of forbidden) {
    assert.ok(!files.includes(f), `public/ NO debe contener ${f}/`);
  }
});

test('C-53 · el README menciona npx wrangler dev', () => {
  const readmePath = path.join(REPO_ROOT, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf-8');
  assert.ok(content.includes('npx wrangler dev'), 'README.md debe mencionar "npx wrangler dev"');
});

test('C-54 · el README menciona npx wrangler deploy y que lo corre Hermes', () => {
  const readmePath = path.join(REPO_ROOT, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf-8');
  assert.ok(content.includes('npx wrangler deploy'), 'README.md debe mencionar "npx wrangler deploy"');
  assert.ok(content.includes('Hermes'), 'README.md debe mencionar que el deploy lo corre Hermes');
});

test('C-55 · ningún archivo versionado contiene un token; .env y .dev.vars están ignorados', () => {
  const gitignorePath = path.join(REPO_ROOT, '.gitignore');
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');

  assert.ok(gitignore.includes('.env'), '.gitignore debe ignorar .env');
  assert.ok(gitignore.includes('.dev.vars'), '.gitignore debe ignorar .dev.vars');
  assert.ok(gitignore.includes('.wrangler/'), '.gitignore debe ignorar .wrangler/');
  assert.ok(gitignore.includes('node_modules/'), '.gitignore debe ignorar node_modules/');

  const trackedFiles = getTrackedFiles();
  const tokenPatterns = [
    /cfat_[a-zA-Z0-9_-]{16,}/,
    /sk-[a-zA-Z0-9]{32,}/,
    /ghp_[a-zA-Z0-9]{36}/,
    /glpat-[a-zA-Z0-9_-]{20,}/,
    /AKIA[0-9A-Z]{16}/,
    /Bearer\s+[a-zA-Z0-9._-]{20,}/,
  ];

  for (const file of trackedFiles) {
    if (file.endsWith('.gitignore') || file.endsWith('.gitattributes')) continue;
    const fullPath = path.join(REPO_ROOT, file);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');
    for (const pattern of tokenPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        assert.fail(`Archivo versionado ${file} contiene posible token: ${matches[0]}`);
      }
    }
  }
});