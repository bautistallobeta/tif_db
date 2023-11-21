const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

router.get('/', (req, res) => {
    const query = 'SELECT * FROM nacionalidad';

    connection.query(query, (error, results) => {
        if (error) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error });
        } else {
            res.render('nacionalidad', { nacionalidadData: results });
        }
    });
});


module.exports = router;