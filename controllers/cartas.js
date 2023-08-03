const express = require("express");
const connection = require('../db.js');

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


const generarTablas = async (req, res) =>
{

    let tablas = [];
    
    let numeroTablas = parseInt(req.query.numeroTablas);

    for(let i = 1; i<=numeroTablas; i++)
    {
        let cartasTabla = [];
        while(cartasTabla.length < 16)
        {
            // var numeroAleatorio = Math.floor((Math.random() * (54 - 1 + 1)) + 1);
            // var numeroAleatorio = Math.round(Math.random() * (54 - 1)) + 1;
            var numeroAleatorio = generarNumeroAleatorio(1, 54);

            if(!cartasTabla.includes(numeroAleatorio))
            {
                cartasTabla.push(numeroAleatorio);
            }

            
        }

        let cartasNumeros = cartasTabla.join(', ');
        
    
        try {
            let sql = "SELECT * FROM cartas WHERE id in (" + cartasNumeros + ")";
            console.log(sql);
            let [rows, fileds] = await connection.query(sql);
            
            let datosTabla =
            {
                tabla: i,
                cartas: rows
            }

            tablas.push(datosTabla);
        }
        catch(err)
        {
            console.log(err);

        }

    }

    console.log(tablas);

    res.json(tablas);


}

function generarNumeroAleatorio(min, max)
{
    const range = max - min + 1;
    let numeroAleatorio = Math.floor(Math.random() * range) + min;
    return numeroAleatorio;
}




module.exports = {getCartas, generarTablas};