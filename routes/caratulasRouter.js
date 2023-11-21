const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');



router.get('/', (req, res) => {
    connection.query('SELECT caratulaId FROM caratula', (err, caratulas) => {
        if (err) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
        } else {
            const caratulasConExpedientes = [];
            const promises = caratulas.map(caratula => {
                return new Promise((resolve, reject) => {
                    connection.query('SELECT codigoExp FROM expediente WHERE caratulaId = ?', [caratula.caratulaId], (err, codigoExp) => {
                        if (err) {
                            reject(err);
                        } else {
                            const caratulaConExpediente = {
                                caratulaId: caratula.caratulaId,
                                codigoExp: codigoExp[0].codigoExp,
                                demandantes: [],
                                demandados: []
                            };
                            connection.query('CALL demandantesPorExpediente(?)', [caratulaConExpediente.codigoExp], (err, demandantes) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    caratulaConExpediente.demandantes = demandantes[0];
                                    connection.query('CALL demandadosPorExpediente(?)', [caratulaConExpediente.codigoExp], (err, demandados) => {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            caratulaConExpediente.demandados = demandados[0];
                                            caratulasConExpedientes.push(caratulaConExpediente);
                                            resolve();
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            });

            Promise.all(promises)
                .then(() => {
                    console.log(caratulasConExpedientes[0].demandantes);
                    res.render('caratulas', { caratulasConExpedientes });
                })
                .catch(error => {
                    res.render('error', { message: 'Error al obtener datos de la base de datos', error });
                });
        }
    });
});




module.exports = router;