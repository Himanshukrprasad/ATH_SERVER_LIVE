const express = require('express')
const router = express.Router();
//const mysql2 = require('mysql2/promise');
require('dotenv').config();
const pool = require('../dbConfigPromise')

// const pool = mysql2.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });


router.post("/", async (req, res) => {
    const { process } = req.body;
    console.log('process', process)
    try {
       
            // Fetch all rows from the header table based on the received filters (process, month, unit, year)
            const [headerRows] = await pool.query(`SELECT * FROM ${process} WHERE is_delete = 0 `);

            
        res.status(200).json(headerRows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
});


module.exports = router;
