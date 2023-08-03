const express = require('express');
const router  = express.Router(); 
const cartasController = require('../controllers/cartas');


router.get('/', cartasController.getCartas);
router.get('/generarTablas', cartasController.generarTablas);

module.exports = router;