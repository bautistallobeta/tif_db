const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');


router.get('/', (req, res) => {
    connection.query('SELECT * FROM Centro_Judicial', (err, centrosJudiciales) => {
        if (err) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error: err });
        } else {
            res.render('centroJudicial', { centrosJudiciales });
        }
    });
});


module.exports = router;