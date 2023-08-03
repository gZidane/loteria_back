const express = require("express");
const connection = require('../db.js');


// MÉTODO QUE OBTIENE TODAS LAS CARTAS EN LA BD. SE PONE SOLO POR SI SE NECESITA CONSULTAR TODOS LOS DATOS
// Se usa otro método de conexión a la BD como ejemplo

const getCartas = (req, res, next) =>
{
    var connection = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "bytheswordslash",
        database: "loteria"
    });

    connection.connect((err) =>
    {
        if (err)
        {
        console.log("Error occurred", err);
        }
        else
        {
        console.log("Connected to MySQL succesfuly");

        const sql = "SELECT *FROM cartas";

        connection.query(sql, function(err, result)
        {
            if(err)
            {
            console.log("Error occurred", err);
            }
            else
            {
            res.json(
                {
                status: "OK",
                data: result
                });
            }
        });
        }
    });
};

// MÉTODO QUE GENERA LAS TABLAS DE LOTERÍA
const generarTablas = async (req, res) =>
{
    // Se declara un objeto vacío donde se guardarán los datos de cada tabla y sus cartas correspondientes
    let tablas = [];
    
    // Se recupera el número de tablas que el usuario quiere generar
    let numeroTablas = parseInt(req.query.numeroTablas);

    // Se genera un bucle con el número de iteraciones igual al número de tablas que de requieren
    for(let i = 1; i<=numeroTablas; i++)
    {
        // Se declara un objeto vacío para guardar las cartas de cada tabla
        let cartasTabla = [];

        // Como cada tabla debe contener 16 cartas se hace un bucle con 16 iteraciones
        while(cartasTabla.length < 16)
        {
            // PONGO 3 FORMAS DIFERENTES DE GENERAR NÚMEROS ALEATORIOS PARA QUE SE ELIJA EL QUE MEJOR SE PREFIERA. TAMBIÉN SE PUEDEN USAR LIBRERÍAS SI SE QUIERE UN GRADO DE ALEATORIEDAD MAYOR

            // Se genera un número aleatorio entre 1 y 54 que son el número total de cartas que
            // tiene el juego de la lotería 

            // var numeroAleatorio = Math.floor((Math.random() * (54 - 1 + 1)) + 1);
            // var numeroAleatorio = Math.round(Math.random() * (54 - 1)) + 1;
            var numeroAleatorio = generarNumeroAleatorio(1, 54);

            // Se verifica si la carta seleccionada no se encuentra ya en las correspondientes a la tabla que se está generando actualmente
            if(!cartasTabla.includes(numeroAleatorio))
            {
                // Si la carta aún no está en la tabla, se puede agregar
                // Esto porque ninguna tabla debe repetir cartas
                cartasTabla.push(numeroAleatorio);
            }

            
        }
        // Se convierte a string el array de cartas para concatenarlo a la consulta sql
        let cartasNumeros = cartasTabla.join(', ');
        
    
        try {

            // Se declara una consulta sql para obtener todas las cartas de cada tabla de una sola vez
            // Esto porque no debe sobrecargarse la BD con tantas consultas
            let sql = "SELECT * FROM cartas WHERE id in (" + cartasNumeros + ")";
            console.log(sql);
            let [rows, fileds] = await connection.query(sql);
            
            // Se crea un objeto cn los datos de la tabla actual
            let datosTabla =
            {
                tabla: i,
                cartas: rows
            }

            // Se agregan los datos de la tabla actual al objeto que contienen los datos de todas las tablas
            tablas.push(datosTabla);
        }
        catch(err)
        {
            console.log(err);

        }

    }

    console.log(tablas);

    // Se envía una respuesta por parte de la API en formato JSON
    res.json(tablas);


}

function generarNumeroAleatorio(min, max)
{
    const range = max - min + 1;
    let numeroAleatorio = Math.floor(Math.random() * range) + min;
    return numeroAleatorio;
}




module.exports = {getCartas, generarTablas};