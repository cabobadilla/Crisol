export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/salud' && request.method === 'GET') {
      try {
        const fila = await env.DB.prepare('SELECT count(*) AS n FROM ideas').first();
        return Response.json({ ok: true, ideas: fila.n }, { status: 200 });
      } catch (error) {
        return Response.json(
          { error: 'base_no_disponible', mensaje: String((error && error.message) || error) },
          { status: 500 },
        );
      }
    }
    return Response.json({ error: 'no_encontrado' }, { status: 404 });
  },
};