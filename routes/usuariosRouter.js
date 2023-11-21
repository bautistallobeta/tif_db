const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');


router.get('/', (req, res) => {
    connection.query('CALL listarUsuarios()', (err, rows) => {
        console.log(rows);
        if (err) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
        } else {
            res.render('usuarios', { usuarios: rows[0] });
        }
    });
});

router.get('/accesosAExpedientes', (req, res) => {
    connection.query('CALL listarAccesosExpedientes()', (err, rows) => {
        if (err) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
        } else {
            console.log(rows[0]);
            res.render('accesosAExpedientes', { expedientesUsuarios: rows[0] });
        }
    });
});


module.exports = router;