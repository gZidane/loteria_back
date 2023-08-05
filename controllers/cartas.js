const express = require("express");
const connection = require('../db.js');
const { v4: uuidv4 } = require('uuid');


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
    // NOTA: UN PANORAMA MÁS AMPLIO DE COMO GENERAR LAS TABLAS DE LA LOTERÍA DEBERÍA INCLUIR EL SIGUIENTE PROCESO:
    // 1. GENERAR UNA PARTIDA Y GUARDARLA EN LA BD
    // 2. GENERAR EL NÚMERO DE TABLAS CORRESPONDIENTES, REFERENCIANDO EL ID DE LA PARTIDA CREADA EN EL PASO 1
    // 3. GUARDAR LAS CARTAS GENERADAS PARA CADA TABLA Y REFERENCIAR EL ID DE LA TABLA Y EL ID DE CADA TABLA EN LA TABLA DE LA BD LLAMADA "cartas_tabla" PERO SE OMITEN ESTOS PASOS DADA LA NATURALEZA DE LA PRUEBA QUE PIDE ENFASIS EN GENERAR LAS CARTAS Y SU NO REPETICION, ETC

    // Se declara un objeto vacío donde se guardarán los datos de cada tabla y sus cartas correspondientes
    let tablas = [];
    
    // Se recupera el número de tablas que el usuario quiere generar
    let numeroTablas = parseInt(req.query.numeroTablas);


    try {

        const uuid = uuidv4();

        let sqlCrearPartida = "INSERT INTO Partidas(nombre) value('" + uuid + "')"
        const [result] = await connection.query(sqlCrearPartida);

        console.log("result", result);

        if(result.insertId != null || result.insertId != undefined)
        {
            let insertId = result.insertId;

            // Se genera un bucle con el número de iteraciones igual al número de tablas que de requieren
            for(let i = 1; i<=numeroTablas; i++)
            {
                // Se declara un objeto vacío para guardar las cartas de cada tabla
                let cartasTabla = [];

                let sqlInsertarTabla = "INSERT INTO tablas(id_partida) value(" + insertId + ")"
                const [result] = await connection.query(sqlInsertarTabla);

                var insertId2 = result.insertId;


                // Como cada tabla debe contener 16 cartas se hace un bucle con 16 iteraciones
                while(cartasTabla.length < 16)
                {
                    // PONGO 3 FORMAS DIFERENTES DE GENERAR NÚMEROS ALEATORIOS PARA QUE SE ELIJA EL QUE MEJOR SE PREFIERA. TAMBIÉN SE PUEDEN USAR LIBRERÍAS SI SE QUIERE UN GRADO DE ALEATORIEDAD MAYOR

                    // Se genera un número aleatorio entre 1 y 54 que son el número total de cartas que
                    // tiene el juego de la lotería 

                    // var numeroAleatorio = Math.floor((Math.random() * (54 - 1 + 1)) + 1);
                    var numeroAleatorio = Math.round(Math.random() * (54 - 1)) + 1;
                    // var numeroAleatorio = generarNumeroAleatorio(1, 54);
                    // var numeroAleatorio = generarNumeroAleatorioSemilla(1, 54);

                    // Se verifica si la carta seleccionada no se encuentra ya en las correspondientes a la tabla que se está generando actualmente
                    if(!cartasTabla.includes(numeroAleatorio))
                    {
                        // Si la carta aún no está en la tabla, se puede agregar
                        // Esto porque ninguna tabla debe repetir cartas

                        if(result.insertId != null || result.insertId != undefined)
                        {
                            let sqlInsertarCarta = "INSERT INTO cartas_tabla(id_tabla, id_carta) value(" + insertId2 + ", " + numeroAleatorio + ")"
                            const [result] = await connection.query(sqlInsertarCarta);
                            
                            cartasTabla.push(numeroAleatorio);
                            
                        }
                        
                    }

                    
                }

                let cartasNumeros = cartasTabla.join(', ');

                let sql = "SELECT * FROM cartas WHERE id in (" + cartasNumeros + ")";
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

            res.json(tablas);

        }

        


    }
    catch (err)
    {
        console.log(err)
    }
    

    /*
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
            var numeroAleatorio = Math.round(Math.random() * (54 - 1)) + 1;
            // var numeroAleatorio = generarNumeroAleatorio(1, 54);
            var numeroAleatorio = generarNumeroAleatorioSemilla(1, 54);

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
    */


}

function generarNumeroAleatorio(min, max)
{
    const range = max - min + 1;
    let numeroAleatorio = Math.floor(Math.random() * range) + min;
    return numeroAleatorio;
}

function generarNumeroAleatorioSemilla(min, max)
{
    const timestamp = Date.now();
    const rango = max - min + 1;
    const numeroAleatorio = Math.floor((timestamp % rango) + min);
    return numeroAleatorio;
}




module.exports = {getCartas, generarTablas};