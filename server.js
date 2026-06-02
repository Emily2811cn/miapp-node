const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

// Conexión a PostgreSQL usando la variable de entorno
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // necesario en Render
});

// Crear tabla si no existe
pool.query(`
  CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre TEXT,
    precio NUMERIC
  )
`);

// Ruta para obtener productos desde la BD
app.get('/productos', async (req, res) => {
  const result = await pool.query('SELECT * FROM productos');
  res.json(result.rows);
});

// Ruta para agregar producto a la BD
app.post('/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  const result = await pool.query(
    'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
    [nombre, precio]
  );
  res.status(201).json(result.rows[0]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
// Eliminar producto por ID
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM productos WHERE id = $1 RETURNING *',
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ mensaje: 'Producto no encontrado' });
  }

  res.json({ mensaje: 'Producto eliminado', producto: result.rows[0] });
});
// Ruta GET con salida en HTML
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos');
    let html = `
      <h1>Inventario de Productos</h1>
      <table border="1" cellpadding="5">
        <tr><th>ID</th><th>Nombre</th><th>Precio</th></tr>
    `;
    result.rows.forEach(p => {
      html += `<tr><td>${p.id}</td><td>${p.nombre}</td><td>${p.precio}</td></tr>`;
    });
    html += `</table>`;
    res.send(html);
  } catch (err) {
    res.status(500).send('Error al obtener productos');
  }
});

