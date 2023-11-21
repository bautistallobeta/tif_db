const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

router.get('/', (req, res) => {
  connection.query(`
    SELECT 
      expediente.*, 
      FUERO.fuero AS nombreFuero, 
      CENTRO_JUDICIAL.nombre AS nombreCentroJudicial, 
      INSTANCIA.instancia AS nombreInstancia, 
      ESTADO_EXP.estadoExpediente AS nombreEstadoExpediente, 
      ACCESO.acceso AS nombreNivelAcceso, 
      CASE 
        WHEN CAMARA.camaraId IS NOT NULL THEN 
          CONCAT(CAMARA.direcCalle, ' ', CAMARA.direcNum) -- Dirección de la cámara
        WHEN JUZGADO.juzgadoId IS NOT NULL THEN 
          CONCAT(JUZGADO.direcCalle, ' ', JUZGADO.direcNum) -- Dirección del juzgado
      END AS direccion,
      (
        SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) 
        FROM Persona 
        INNER JOIN camara ON (camara.cuilJuez1 = persona.cuilCuit OR camara.cuilJuez2 = persona.cuilCuit)
        WHERE camara.camaraId = CAMARA.camaraId
      ) AS nombreJuecesCamara,
      (
        SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) 
        FROM Persona 
        INNER JOIN juzgado ON juzgado.juezId = persona.cuilCuit
        WHERE juzgado.juzgadoId = JUZGADO.juzgadoId
      ) AS nombreJuecesJuzgado,
      (
        SELECT GROUP_CONCAT(CONCAT(demandante.nombre, ' ', demandante.apellido)) 
        FROM Persona demandante
        JOIN es_demandante ON demandante.cuilCuit = es_demandante.demandanteCuilCuit
        WHERE es_demandante.caratulaId = expediente.caratulaId
      ) AS demandantes,
      (
        SELECT GROUP_CONCAT(CONCAT(demandado.nombre, ' ', COALESCE(demandado.apellido, ''))) 
        FROM Persona demandado
        JOIN es_demandado ON demandado.cuilCuit = es_demandado.demandadoCuilCuit
        WHERE es_demandado.caratulaId = expediente.caratulaId
      ) AS demandados,
      INFORME.*, 
      ESTADO_INF.estadoInforme 
    FROM 
      EXPEDIENTE 
      INNER JOIN FUERO ON expediente.fueroId = FUERO.fueroId 
      INNER JOIN CENTRO_JUDICIAL ON expediente.centroJudicialId = CENTRO_JUDICIAL.centroJudicialId 
      INNER JOIN INSTANCIA ON expediente.instanciaId = INSTANCIA.instanciaId 
      INNER JOIN ESTADO_EXP ON expediente.estadoExpedienteId = ESTADO_EXP.estadoExpedienteId 
      INNER JOIN ACCESO ON expediente.nivelAccesoId = ACCESO.nivelAccesoId 
      LEFT JOIN CAMARA ON expediente.camaraId = CAMARA.camaraId 
      LEFT JOIN JUZGADO ON expediente.juzgadoId = JUZGADO.juzgadoId
      LEFT JOIN INFORME ON expediente.codigoExp = INFORME.codigoExp
      LEFT JOIN ESTADO_INF ON informe.estadoInformeId = ESTADO_INF.estadoInformeId`,
    (err, rows) => {
      if (err) {
        res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
      } else {
        const promises = rows.map(expediente => {
          return new Promise((resolve, reject) => {
            if (expediente.camaraId) {
              connection.query(`
                SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) AS nombreJueces
                FROM Persona
                INNER JOIN camara ON (camara.cuilJuez1 = persona.cuilCuit OR camara.cuilJuez2 = persona.cuilCuit)
                WHERE camara.camaraId = ?
              `, [expediente.camaraId], (err, result) => {
                if (!err && result.length > 0) {
                  expediente.nombreJueces = result[0].nombreJueces;
                  resolve();
                } else {
                  reject(err);
                }
              });
            } else if (expediente.juzgadoId) {
              connection.query(`
                SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) AS nombreJueces
                FROM Persona
                INNER JOIN juzgado ON juzgado.juezId = persona.cuilCuit
                WHERE juzgado.juzgadoId = ?
              `, [expediente.juzgadoId], (err, result) => {
                if (!err && result.length > 0) {
                  expediente.nombreJueces = result[0].nombreJueces;
                  resolve();
                } else {
                  reject(err);
                }
              });
            }
          });
        });

        Promise.all(promises)
          .then(() => {
            rows.forEach(row => {
              row.demandados = row.demandados ? row.demandados.split(',') : []; // Convertir a arreglo
            });
            res.render('expedientes', { expedientes: rows });
          })
          .catch(error => {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error: error });
          });
      }
    }
  );
});

router.get('/centro/:centroJudicialId', (req, res) => {
  const centroJudicialId = req.params.centroJudicialId;

  connection.query(`
      SELECT 
          expediente.*, 
          FUERO.fuero AS nombreFuero, 
          CENTRO_JUDICIAL.nombre AS nombreCentroJudicial, 
          INSTANCIA.instancia AS nombreInstancia, 
          ESTADO_EXP.estadoExpediente AS nombreEstadoExpediente, 
          ACCESO.acceso AS nombreNivelAcceso, 
          CASE 
              WHEN CAMARA.camaraId IS NOT NULL THEN 
                  CONCAT(CAMARA.direcCalle, ' ', CAMARA.direcNum) 
              WHEN JUZGADO.juzgadoId IS NOT NULL THEN 
                  CONCAT(JUZGADO.direcCalle, ' ', JUZGADO.direcNum)
          END AS direccion,
          (
              SELECT GROUP_CONCAT(CONCAT(demandante.nombre, ' ', demandante.apellido)) 
              FROM Persona demandante
              JOIN es_demandante ON demandante.cuilCuit = es_demandante.demandanteCuilCuit
              WHERE es_demandante.caratulaId = expediente.caratulaId
          ) AS demandantes,
          (
              SELECT GROUP_CONCAT(CONCAT(demandado.nombre, ' ', COALESCE(demandado.apellido, ''))) 
              FROM Persona demandado
              JOIN es_demandado ON demandado.cuilCuit = es_demandado.demandadoCuilCuit
              WHERE es_demandado.caratulaId = expediente.caratulaId
          ) AS demandados,
          INFORME.*, 
          ESTADO_INF.estadoInforme 
      FROM 
          EXPEDIENTE 
          INNER JOIN FUERO ON expediente.fueroId = FUERO.fueroId 
          INNER JOIN CENTRO_JUDICIAL ON expediente.centroJudicialId = CENTRO_JUDICIAL.centroJudicialId 
          INNER JOIN INSTANCIA ON expediente.instanciaId = INSTANCIA.instanciaId 
          INNER JOIN ESTADO_EXP ON expediente.estadoExpedienteId = ESTADO_EXP.estadoExpedienteId 
          INNER JOIN ACCESO ON expediente.nivelAccesoId = ACCESO.nivelAccesoId 
          LEFT JOIN CAMARA ON expediente.camaraId = CAMARA.camaraId 
          LEFT JOIN JUZGADO ON expediente.juzgadoId = JUZGADO.juzgadoId
          LEFT JOIN INFORME ON expediente.codigoExp = INFORME.codigoExp
          LEFT JOIN ESTADO_INF ON informe.estadoInformeId = ESTADO_INF.estadoInformeId
      WHERE CENTRO_JUDICIAL.centroJudicialId = ?
  `, [centroJudicialId], (err, expedientes) => {
      if (err) {
          res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
      } else {
          const promises = expedientes.map(expediente => {
              return new Promise((resolve, reject) => {
                  let juezQuery = '';
                  if (expediente.camaraId) {
                      juezQuery = `
                          SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) AS nombreJueces
                          FROM Persona
                          INNER JOIN camara ON (camara.cuilJuez1 = persona.cuilCuit OR camara.cuilJuez2 = persona.cuilCuit)
                          WHERE camara.camaraId = ?
                      `;
                  } else if (expediente.juzgadoId) {
                      juezQuery = `
                          SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) AS nombreJueces
                          FROM Persona
                          INNER JOIN juzgado ON juzgado.juezId = persona.cuilCuit
                          WHERE juzgado.juzgadoId = ?
                      `;
                  }

                  connection.query(juezQuery, [expediente.camaraId || expediente.juzgadoId], (err, result) => {
                      if (!err && result.length > 0) {
                          expediente.nombreJueces = result[0].nombreJueces;
                          resolve();
                      } else {
                          reject(err);
                      }
                  });
              });
          });

          Promise.all(promises)
              .then(() => {
                  expedientes.forEach(expediente => {
                      expediente.demandados = expediente.demandados ? expediente.demandados.split(',') : [];
                  });
                  res.render('expedientes', { expedientes: expedientes });
              })
              .catch(error => {
                  res.render('error', { message: 'Error al obtener datos de la base de datos', error: error });
              });
      }
  });
});



router.get('/:codigoExp/:id', (req, res) => {
  const codigoExpediente = req.params.codigoExp;
  const id = req.params.id;
  const codigoExp = codigoExpediente + '/' + id;

  connection.query('CALL expedientePorCodigo(?)', [codigoExp], (err, rows) => {
    if (err) {
      res.render('error', { message: 'Error al obtener datos del expediente', error: err });
    } else {
      const expediente = rows[0][0]; // Primer conjunto de resultados del primer conjunto de resultados

      // Obtener demandantes y demandados
      connection.query('CALL demandantesPorExpediente(?)', [codigoExp], (err, resultDemandantes) => {
        if (!err && expediente!=undefined) {
          expediente.demandantes = resultDemandantes[0]; // Añadir demandantes al objeto de expediente
          
          // Obtener demandados
          connection.query('CALL demandadosPorExpediente(?)', [codigoExp], (err, resultDemandados) => {
            if (!err) {
              expediente.demandados = resultDemandados[0]; // Añadir demandados al objeto de expediente

              // Obtener los nombres de los jueces asociados a la cámara o juzgado específico
              connection.query(`
                SELECT GROUP_CONCAT(CONCAT(persona.nombre, ' ', persona.apellido)) AS nombreJueces
                FROM Persona
                LEFT JOIN camara ON (camara.cuilJuez1 = persona.cuilCuit OR camara.cuilJuez2 = persona.cuilCuit)
                LEFT JOIN juzgado ON juzgado.juezId = persona.cuilCuit
                WHERE camara.camaraId = ? OR juzgado.juzgadoId = ?
              `, [expediente.camaraId, expediente.juzgadoId], (err, resultJueces) => {
                if (!err) {
                  expediente.nombreJueces = resultJueces[0].nombreJueces; // Agregar los nombres de los jueces al objeto de expediente
                  res.render('expedientesPorCodigo', { expedientes: expediente });
                } else {
                  res.render('error', { message: 'Error al obtener datos de los jueces', error: err });
                }
              });
            } else {
              res.render('error', { message: 'Error al obtener datos de demandados', error: err });
            }
          });
        } else {
          if(!err){
            res.render('expedientes', {expedientes : resultDemandantes[0]});
          }
          else{
            res.render('error', { message: 'Error al obtener datos de demandantes', error: err });
          }
        }
      });
    }
  });
});






router.get('/informes/:codigoExp/:id', (req, res) => {
  const codigoExp = req.params.codigoExp;
  const id = req.params.id;
  const codigoExpediente = codigoExp + '/' + id;
  
  // Llamar al stored procedure para obtener los informes del expediente especificado
  connection.query('CALL informePorExpediente(?)', [codigoExpediente], (err, rows) => {
    if (err) {
      console.error("Error al llamar al stored procedure:", err);
      res.render('error', { message: 'Error al obtener informes', error: err });
    } else {
      const informes = rows[0]; // Suponiendo que los resultados están en el primer conjunto de resultados
      
      informes.forEach((informe, index) => {
        connection.query('CALL contadoresPorInforme(?)', [informe.informeId], (err, contadorRows) => {
          
          if (err) {
            console.error("Error al llamar al stored procedure de contadores:", err);
            informes[index].contadores = [];
          } else {
            informes[index].contadores = contadorRows[0];
          }
          
          if (index === informes.length - 1) {
            res.render('informes', { informes });
          }
        });
      });
    }
  });
});



module.exports = router;
