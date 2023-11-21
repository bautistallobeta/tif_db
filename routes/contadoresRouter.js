const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

// Ruta para mostrar los datos de la tabla Contador
router.get('/', (req, res) => {
    connection.query(`
      SELECT 
        contador.*, 
        persona.nombre AS nombreContador,
        persona.apellido AS apellidoContador,
        fuero.fuero AS especialidad
      FROM 
        contador
        INNER JOIN persona ON contador.cuil = persona.cuilCuit
        INNER JOIN fuero ON contador.especialidad = fuero.fueroId
    `, (err, contadores) => {
      if (err) {
        res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
      } else {
        res.render('contadores', { contadores: contadores });
      }
    });
  });
  
  // Ruta para mostrar los informes asociados a un contador específico
  router.get('/informes/:contadorCuil', (req, res) => {
    const contadorCuil = req.params.contadorCuil;
  
    connection.query(`
      CALL informesPorContador(?);
    `, [contadorCuil], (err, informes) => {
      if (err) {
        res.render('error', { message: 'Error al obtener informes del contador', error: err });
      } else {
        console.log(informes[0]);
        res.render('informesDeContador', { informes: informes[0] });
      }
    });
});

router.get('/:texto', (req, res) => {
  const textoBusqueda = req.params.texto;
  
  connection.query('CALL contadoresPorNombre(?)', [textoBusqueda], (err, rows) => {
    if (err) {
      res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
    } else {
      //console.log(rows[0][0]);
      res.render('contadores', { contadores: rows[0] });
    }
  });
});

  
  module.exports = router;