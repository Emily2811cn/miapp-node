const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Middleware de logging simple
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Puerto asignado por Render
const PORT = process.env.PORT || 3000;

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido a mi aplicación Node.js en Render!');
});

// Ruta de información
app.get('/info', (req, res) => {
  res.json({
    app: 'Demo Node.js',
    version: '1.0.0',
    autor: 'Emily Cruz',
    plataforma: 'Render (PaaS)'
  });
});

// Ruta tipo API para simular base de datos
let productos = [
  { id: 1, nombre: 'Laptop', precio: 1200 },
  { id: 2, nombre: 'Mouse', precio: 25 },
  { id: 3, nombre: 'Teclado', precio: 45 }
];

// Obtener todos los productos
app.get('/productos', (req, res) => {
  res.json(productos);
});

// Agregar un producto
app.post('/productos', (req, res) => {
  const nuevoProducto = {
    id: productos.length + 1,
    nombre: req.body.nombre,
    precio: req.body.precio
  };
  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

// Buscar producto por ID
app.get('/productos/:id', (req, res) => {
  const producto = productos.find(p => p.id == req.params.id);
  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(producto);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
