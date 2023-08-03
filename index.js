const express = require("express");
const mysql = require("mysql");
const api = express();
const routesCartas = require('./routes/cartas');
const cors = require('cors');

api.use(cors({ origin: '*' }));

api.set("port", process.env.PORT || 4000);

api.use(express.urlencoded({extended:false}));
api.use(express.json());

api.use('/cartas', routesCartas);


api.get("/", function(req, res)
{
  res.json(
    {
      status: "OK",
      message: "API corriendo correctamente"
    })
});


//Iniciando el servidor
api.listen(api.get("port"),()=>
{
    console.log(`API escuchando en el puerto: ${api.get('port')}`);
});