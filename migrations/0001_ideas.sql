CREATE TABLE ideas (
  id             TEXT PRIMARY KEY,        -- uuid generado en el Worker (crypto.randomUUID)
  titulo         TEXT NOT NULL,
  estado         TEXT NOT NULL,           -- en_curso | definida | rechazada
  paso_alcanzado INTEGER NOT NULL,        -- 1..7
  idea_json      TEXT NOT NULL,           -- la Idea estructurada completa (los 7 pasos)
  veredicto      TEXT,                    -- null | aprobado | rechazado
  veredicto_json TEXT,                    -- objeciones con su id de regla
  creado_en      TEXT NOT NULL,           -- ISO-8601
  actualizado_en TEXT NOT NULL
);
CREATE INDEX idx_ideas_actualizado ON ideas (actualizado_en DESC);