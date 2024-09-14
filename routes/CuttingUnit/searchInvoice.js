const express = require('express');
const bodyParser = require('body-parser');
//const mysql = require('mysql2/promise');
const cors = require('cors');

const router = express.Router();

require('dotenv').config();
const pool = require('../dbConfigPromise')

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });


// Search endpoint
router.post('/', async (req, res) => {
   
    try {
        // Trim whitespace from the search value
        const { vchSearchValue } = req.body;
        //const trimmedVchSearchValue = vchSearchValue.trim();
   
        
        // Array to hold the results from different tables
        const searchResults = [];
        
        // Get a connection from the pool
        const connection = await pool.getConnection();
        
        try {
            // First, fetch the vch_no from cutting_header where design_no matches vchSearchValue
            const headerQuery = `SELECT master_id FROM cutting_header WHERE design_no = ? AND is_delete = 0`;
            const [headerResults] = await connection.execute(headerQuery, [vchSearchValue]);
            
            if (headerResults.length === 0) {
                // No matching vch_no found, return empty results
                return res.json(searchResults);
            }
            
            // Extract the vch_no from the result
            const mId = headerResults[0].master_id;
            
            // Array of tables to search in
            const tables = ['cutting_header', 'cutting_component', 'cutting_item_detail'];
            
            // Loop through tables to perform search
            for (const table of tables) {
                // Query to search for the value in the current table
                const query = `SELECT * FROM ${table} WHERE master_id = ?`;
                
                // Execute the query
                const [results] = await connection.execute(query, [mId]);
                
                // Add results along with table and column names to searchResults array
                results.forEach((row) => {
                    searchResults.push({
                        tableName: table,
                        data: row
                    });
                });
            }
        } finally {
            // Ensure the connection is released even if an error occurs
            connection.release();
        }
     
       
        res.json(searchResults);
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;
