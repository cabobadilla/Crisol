// Harness de navegador real para los casos de comportamiento.
// Sirve public/index.html con node:http en un puerto efímero, levanta Chrome
// headless con depuración remota y habla CDP por WebSocket (globales de Node).
// Ningún temporal sale del proyecto: los perfiles de Chrome van a ./.tmp/.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RUTA_HTML = path.join(RAIZ, 'public', 'index.html');

// Página de reemplazo cuando el artefacto todavía no existe: el navegador tiene
// un DOM que consultar, de modo que los tests fallan por aserción (no hay pasos)
// y no por un error del harness.
const PAGINA_SIN_ARTEFACTO = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>404</title></head>
<body><p id="pagina-sin-artefacto">public/index.html todavia no existe</p></body>
</html>`;

const dormir = ms => new Promise(resolver => setTimeout(resolver, ms));

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

function servirApp() {
  const servidor = createServer((peticion, respuesta) => {
    const url = (peticion.url || '/').split('?')[0];
    if (url === '/' || url === '/index.html') {
      // Se lee en el momento de la petición: nunca en el import del módulo.
      if (existsSync(RUTA_HTML)) {
        respuesta.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        respuesta.end(readFileSync(RUTA_HTML));
      } else {
        respuesta.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        respuesta.end(PAGINA_SIN_ARTEFACTO);
      }
      return;
    }
    respuesta.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    respuesta.end('no encontrado');
  });
  return new Promise((resolver, rechazar) => {
    servidor.once('error', rechazar);
    servidor.listen(0, '127.0.0.1', () => resolver(servidor));
  });
}

class Sesion {
  constructor(webSocket) {
    this.ws = webSocket;
    this.siguienteId = 0;
    this.pendientes = new Map();
    webSocket.onmessage = evento => {
      const mensaje = JSON.parse(evento.data);
      if (mensaje.id && this.pendientes.has(mensaje.id)) {
        const { resolver, rechazar } = this.pendientes.get(mensaje.id);
        this.pendientes.delete(mensaje.id);
        if (mensaje.error) rechazar(new Error(`CDP: ${mensaje.error.message}`));
        else resolver(mensaje.result);
      }
    };
  }

  enviar(metodo, parametros = {}) {
    return new Promise((resolver, rechazar) => {
      const id = ++this.siguienteId;
      const registrar = setTimeout(() => {
        if (this.pendientes.has(id)) {
          this.pendientes.delete(id);
          rechazar(new Error(`CDP no respondió: ${metodo}`));
        }
      }, 15000);
      this.pendientes.set(id, {
        resolver: valor => { clearTimeout(registrar); resolver(valor); },
        rechazar: error => { clearTimeout(registrar); rechazar(error); },
      });
      this.ws.send(JSON.stringify({ id, method: metodo, params: parametros }));
    });
  }

  // Evalúa una expresión en la página ya renderizada y devuelve su valor.
  async evaluar(expresion) {
    const respuesta = await this.enviar('Runtime.evaluate', {
      expression: expresion,
      returnByValue: true,
      awaitPromise: true,
    });
    if (respuesta.exceptionDetails) {
      const detalle =
        (respuesta.exceptionDetails.exception && respuesta.exceptionDetails.exception.description) ||
        respuesta.exceptionDetails.text;
      throw new Error(`La página lanzó una excepción: ${detalle}`);
    }
    return respuesta.result ? respuesta.result.value : undefined;
  }
}

export async function abrirNavegador() {
  const servidor = await servirApp();
  const direccion = `http://127.0.0.1:${servidor.address().port}/`;
  const puertoDepuracion = await puertoLibre();

  mkdirSync(path.join(RAIZ, '.tmp'), { recursive: true });
  const perfil = mkdtempSync(path.join(RAIZ, '.tmp', 'chrome-'));

  const chrome = spawn(CHROME, [
    '--headless=new',
    `--remote-debugging-port=${puertoDepuracion}`,
    '--remote-allow-origins=*',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--no-pings',
    `--user-data-dir=${perfil}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let registro = '';
  chrome.stderr.on('data', fragmento => { registro += fragmento.toString(); });

  let objetivo = null;
  const limite = Date.now() + 30000;
  while (Date.now() < limite && !objetivo) {
    if (chrome.exitCode !== null) {
      throw new Error(`Chrome terminó antes de responder (código ${chrome.exitCode}). stderr: ${registro.slice(-2000)}`);
    }
    try {
      const respuesta = await fetch(`http://127.0.0.1:${puertoDepuracion}/json/list`);
      if (respuesta.ok) {
        const lista = await respuesta.json();
        objetivo = lista.find(objeto => objeto.type === 'page' && objeto.webSocketDebuggerUrl) || null;
      }
    } catch {
      // Chrome todavía no está escuchando.
    }
    if (!objetivo) await dormir(150);
  }
  if (!objetivo) {
    chrome.kill('SIGKILL');
    throw new Error(`Chrome no publicó objetivos CDP en 30s. stderr: ${registro.slice(-2000)}`);
  }

  const ws = new WebSocket(objetivo.webSocketDebuggerUrl);
  await new Promise((resolver, rechazar) => {
    const reloj = setTimeout(() => rechazar(new Error('El WebSocket de CDP no se abrió')), 10000);
    ws.onopen = () => { clearTimeout(reloj); resolver(); };
    ws.onerror = () => { clearTimeout(reloj); rechazar(new Error('WebSocket de CDP falló')); };
  });

  const sesion = new Sesion(ws);
  await sesion.enviar('Page.enable');

  async function irAlaApp() {
    await sesion.enviar('Page.navigate', { url: direccion });
    const finCarga = Date.now() + 10000;
    while (Date.now() < finCarga) {
      try {
        if ((await sesion.evaluar('document.readyState')) === 'complete') break;
      } catch {
        // Contexto de ejecución en transición durante la navegación.
      }
      await dormir(50);
    }
    await dormir(80);
  }

  await irAlaApp();

  // Fija el tamaño del viewport renderizado (CDP Emulation). Los casos de
  // geometría se miden a 1200 px; los de umbral (C-86/C-87), a 390 px.
  // Sin esto el layout se mide en el viewport por defecto y el número no
  // significa nada.
  async function tamano(ancho, alto) {
    await sesion.enviar('Emulation.setDeviceMetricsOverride', {
      width: ancho,
      height: alto,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await dormir(120);
  }

  async function cerrar() {
    try {
      await Promise.race([sesion.enviar('Browser.close'), dormir(1500)]);
    } catch {
      // Si Browser.close no se puede desde la página, se mata el proceso.
    }
    if (chrome.exitCode === null) chrome.kill('SIGTERM');
    const finProceso = Date.now() + 3000;
    while (chrome.exitCode === null && Date.now() < finProceso) await dormir(50);
    if (chrome.exitCode === null) chrome.kill('SIGKILL');
    try { ws.close(); } catch { /* ya cerrado */ }
    if (servidor.closeAllConnections) servidor.closeAllConnections();
    await new Promise(resolver => servidor.close(resolver));
    rmSync(perfil, { recursive: true, force: true });
  }

  return {
    direccion,
    evaluar: expresion => sesion.evaluar(expresion),
    irAlaApp,
    tamano,
    cerrar,
  };
}
