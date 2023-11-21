const express = require('express');
const router = express.Router();
const connection = require('../dbConexion');

router.get('/', (req, res) => {
    const query = `
        SELECT 
            secretario.cuil AS cuilSecretario,
            persona.nombre AS nombreSecretario,
            persona.apellido AS apellidoSecretario,
            secretario.fechalngreso AS fechaIngreso,
            secretario.telefono,
            secretario.correo,
            juez.secretarioCuil AS cuilJuez,
            juezPersona.nombre AS nombreJuez,
            juezPersona.apellido AS apellidoJuez
        FROM 
            secretario
        INNER JOIN persona ON secretario.cuil = persona.cuilCuit
        LEFT JOIN juez ON juez.secretarioCuil = secretario.cuil
        LEFT JOIN persona AS juezPersona ON juezPersona.cuilCuit = juez.cuil
    `;

    connection.query(query, (error, results) => {
        if (error) {
            res.render('error', { message: 'Error al obtener datos de la base de datos', error });
        } else {
            res.render('secretarios', { secretariosData: results });
        }
    });
});


module.exports = router;