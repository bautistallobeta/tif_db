const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');


router.get('/', (req, res) => {
    connection.query('SELECT camaraId, nroOficina, direcCalle, direcNum, jurisdiccion FROM CAMARA', (err, rows) => {
      if (err) {
        res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
      } else {
        res.render('camaras', { camaras: rows });
      }
    });
  });
  


module.exports = router;