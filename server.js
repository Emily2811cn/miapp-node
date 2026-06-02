const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json());

// Configuración de conexión a PostgreSQL desde Render
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ruta principal de bienvenida
app.get('/', (req, res) => {
  res.send('<h1>¡Bienvenido a mi aplicación Node.js en Render con PostgreSQL!</h1>');
});

// Ruta GET con salida en HTML (tabla de productos)
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

// Ruta POST para agregar productos (respuesta JSON para Postman)
app.post('/productos', async (req, res) => {
  const { nombre, precio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.json({ mensaje: 'Producto agregado', producto: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

// Ruta DELETE para eliminar productos (respuesta HTML en navegador)
app.delete('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM productos WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rowCount > 0) {
      res.send(`<p>Producto con ID ${id} eliminado correctamente.</p>`);
    } else {
      res.send(`<p>No se encontró producto con ID ${id}.</p>`);
    }
  } catch (err) {
    res.status(500).send('Error al eliminar producto');
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
