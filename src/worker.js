export function clasificarError(error) {
  if (!error) return 'base_no_disponible';
  const message = String(error.message || error).toLowerCase();
  if (
    message.includes('cuota diaria') ||
    message.includes('d1 quota') ||
    message.includes('quota exceeded') ||
    message.includes('daily d1 quota') ||
    message.includes('cuota de d1 agotada')
  ) {
    return 'cuota_diaria';
  }
  return 'base_no_disponible';
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/salud' && request.method === 'GET') {
      try {
        const fila = await env.DB.prepare('SELECT count(*) AS n FROM ideas').first();
        return Response.json({ ok: true, ideas: fila.n }, { status: 200 });
      } catch (error) {
        return Response.json(
          { error: clasificarError(error), mensaje: String((error && error.message) || error) },
          { status: 500 },
        );
      }
    }

    if (url.pathname === '/api/ideas' && request.method === 'GET') {
      try {
        const resultados = await env.DB.prepare(
          'SELECT id, titulo, estado, paso_alcanzado, idea_json, veredicto, veredicto_json, creado_en, actualizado_en FROM ideas ORDER BY actualizado_en DESC',
        ).all();
        return Response.json({ ideas: resultados.results || [] }, { status: 200 });
      } catch (error) {
        return Response.json(
          { error: clasificarError(error), mensaje: String((error && error.message) || error) },
          { status: 500 },
        );
      }
    }

    if (url.pathname === '/api/ideas' && request.method === 'POST') {
      try {
        const body = await request.json();
        const actualizado_en = body.actualizado_en || new Date().toISOString();
        const creado_en = body.creado_en || actualizado_en;

        await env.DB.prepare(
          'INSERT INTO ideas (id, titulo, estado, paso_alcanzado, idea_json, veredicto, veredicto_json, creado_en, actualizado_en) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET titulo=excluded.titulo, estado=excluded.estado, paso_alcanzado=excluded.paso_alcanzado, idea_json=excluded.idea_json, veredicto=excluded.veredicto, veredicto_json=excluded.veredicto_json, actualizado_en=excluded.actualizado_en',
        )
          .bind(
            body.id,
            body.titulo,
            body.estado,
            body.paso_alcanzado,
            body.idea_json,
            body.veredicto,
            body.veredicto_json,
            creado_en,
            actualizado_en,
          )
          .run();

        return Response.json({ id: body.id, actualizado_en }, { status: 201 });
      } catch (error) {
        return Response.json(
          { error: clasificarError(error), mensaje: String((error && error.message) || error) },
          { status: 500 },
        );
      }
    }

    return Response.json({ error: 'no_encontrado' }, { status: 404 });
  },
};
