const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

router.get('/', (req, res) => {
    const query = 'SELECT * FROM estado_civil';

    connection.query(query, (error, results) => {
        if (error) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error });
        } else {
            res.render('estadoCiv', { estadoCivilData: results });
        }
    });
});

module.exports = router;