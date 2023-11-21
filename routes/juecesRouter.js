const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

router.get('/', (req, res) => {
    connection.query(`
      SELECT 
        juez.*, 
        estado_actual.estadoActualCol AS estadoActual,
        fuero.fuero AS especialidad,
        persona.nombre AS nombreJuez,
        persona.apellido AS apellidoJuez
      FROM 
        juez 
        INNER JOIN estado_actual ON juez.estadoActualId = estado_actual.estadoActualId
        INNER JOIN fuero ON juez.especialidad = fuero.fueroId
        INNER JOIN persona ON juez.cuil = persona.cuilCuit
    `, (err, rows) => {
      if (err) {
        res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
      } else {
        const promises = rows.map(juez => {
          return new Promise((resolve, reject) => {
            connection.query(`
              CALL secretarioPorJuez(?);`, [juez.cuil], (err, result) => {
              if (!err && result.length > 0) {
                juez.nombreSecretario = result[0][0].nombre;
                console.log(result[0][0]);
                juez.apellidoSecretario = result[0][0].apellido;
                resolve();
              } else {
                reject(err);
              }
            });
          });
        });
  
        Promise.all(promises)
          .then(() => {
            res.render('jueces', { jueces: rows });
          })
          .catch(error => {
            res.render('error', { message: 'Error al obtener datos de secretarios', error: error });
          });
      }
    });
  });
  

  router.get('/:texto', (req, res) => {
    const texto = req.params.texto;

    connection.query('CALL juecesPorNombre(?)', [texto], (err, rows) => {
        if (err) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
        } else {
            const promises = rows[0].map(juez => {
                return new Promise((resolve, reject) => {
                    connection.query('CALL secretarioPorJuez(?);', [juez.cuil], (err, result) => {
                        if (!err && result.length > 0) {
                            juez.nombreSecretario = result[0][0].nombre;
                            juez.apellidoSecretario = result[0][0].apellido;
                            resolve();
                        } else {
                            reject(err);
                        }
                    });
                });
            });

            Promise.all(promises)
                .then(() => {
                    res.render('jueces', { jueces: rows[0] });
                })
                .catch(error => {
                    res.render('error', { message: 'Error al obtener datos de secretarios', error: error });
                });
        }
    });
});

router.get('/camara/:camaraId', (req, res) => {
  const camaraId = req.params.camaraId;

  connection.query(
    'SELECT cuilJuez1, cuilJuez2 FROM camara WHERE camaraId = ?',
    [camaraId],
    (err, rows) => {
      if (err) {
        res.render('error', { message: 'Error al obtener datos de la cámara', error: err });
      } else {
        const cuiles = rows[0]; // Obtiene los cuiles de la cámara

        connection.query(
          'SELECT juez.*, estado_actual.estadoActualCol AS estadoActual, fuero.fuero AS especialidad, personaJuez.nombre AS nombreJuez, personaJuez.apellido AS apellidoJuez, personaSecretario.nombre AS nombreSecretario, personaSecretario.apellido AS apellidoSecretario FROM juez INNER JOIN estado_actual ON juez.estadoActualId = estado_actual.estadoActualId INNER JOIN fuero ON juez.especialidad = fuero.fueroId INNER JOIN Persona AS personaJuez ON juez.cuil = personaJuez.cuilCuit INNER JOIN Persona AS personaSecretario ON juez.secretarioCuil = personaSecretario.cuilCuit WHERE juez.cuil IN (?)',
          [Object.values(cuiles)],
          (err, jueces) => {
            if (err) {
              res.render('error', { message: 'Error al obtener datos de los jueces', error: err });
            } else {
              res.render('juecesDeCamara', { jueces: jueces });
            }
          }
        );
      }
    }
  );
});






  module.exports = router;