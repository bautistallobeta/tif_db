const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');



router.get('/', (req,res) => {
    connection.query('SELECT * FROM informe', (err, rows) => {
      if (err) {
        console.error("Error al obtener informes:", err);
        res.render('error', { message: 'Error al obtener informes', error: err });
      } else {
        const informes = rows; // Suponiendo que los resultados son directamente los informes
  
        informes.forEach((informe, index) => {
          connection.query('CALL contadoresPorInforme(?)', [informe.informeId], (err, contadorRows) => {
            if (err) {
              console.error("Error al llamar al stored procedure de contadores:", err);
              informes[index].contadores = [];
            } else {
              console.log(contadorRows);
              informes[index].contadores = contadorRows[0];
            }
  
            // Obtener el estado del informe desde la tabla estado_inf
            connection.query('SELECT estadoInforme FROM estado_inf WHERE estadoInformeId = ?', [informe.estadoInformeId], (err, estadoRows) => {
              if (err) {
                console.error("Error al obtener el estado del informe:", err);
                informes[index].estadoInforme = 'Desconocido';
              } else {
                informes[index].estadoInforme = estadoRows[0] ? estadoRows[0].estadoInforme : 'Desconocido';
              }
  
              if (index === informes.length - 1) {
                //console.log(informes); // Verificar los datos antes de renderizar la vista
                res.render('informes', { informes });
              }
            });
          });
        });
      }
    });
  });


  router.get('/:informeId', (req, res) => {
    const informeId = req.params.informeId;
  
    connection.query('CALL informePorCodigo(?)', [informeId], (err, rows) => {
      if (err) {
        res.render('error', { message: 'Error al obtener el informe', error: err });
      } else {
        const informes = [];
        if(rows[0][0]){
          const informe = rows[0][0]; // Primer conjunto de resultados del primer conjunto de resultados
          
          informes[0] = informe;
          res.render('informes', { informes });
        }else{
          res.render('informes', { informes : rows[0][0]} );
        }
      }
    });
  });
  

module.exports = router;
