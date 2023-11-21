const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

// Ruta para cada tabla
router.get('/', (req, res) => {
  res.render('index');
});

// Resto de rutas CRUD aquí

module.exports = router;