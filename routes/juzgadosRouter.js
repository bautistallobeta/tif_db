const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');


router.get('/', (req, res) => {
    connection.query('SELECT juzgadoId, nroOficina, juzgado.direcCalle, juzgado.direcNum, juridiccion, juezId, persona.nombre, persona.apellido FROM JUZGADO INNER JOIN PERSONA ON JUZGADO.juezId=PERSONA.cuilCuit', (err, rows) => {
      if (err) {
        res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
      } else {
        console.log(rows);
        res.render('juzgados', { juzgados: rows });
      }
    });
  });
  


module.exports = router;