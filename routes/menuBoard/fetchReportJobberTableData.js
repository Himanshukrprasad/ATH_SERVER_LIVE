const express = require('express');
const bodyParser = require('body-parser');
//const mysql = require('mysql2/promise');
const cors = require('cors');
const router = express.Router();
require('dotenv').config();
const pool = require('../dbConfigPromise')

// const pool = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0,
// });




  router.post('/', async (req, res) => {
    try {
        const { jobber } = req.body;
       

        // Array to hold the results from different tables
        const searchResults = [];

        // Get a connection from the pool
        const connection = await pool.getConnection();

        try {
            // Define your process mappings here
            const processMappings = [
                
                {
                  header: 'cutting_header',
                  tables: {
                    source: 'cutting_item_detail',
                    destination: 'cutting_component',
                  },
                },
                {
                  header: 'emb_iss_header',
                  tables: {
                    source: 'emb_iss_source',
                    destination: 'emb_iss_destination',
                  },
                },
                {
                  header: 'emb_rec_header',
                  tables: {
                    source: 'emb_rec_destination',
                    destination: 'emb_rec_source',
                  },
                },
                {
                  header: 'fus_iss_header',
                  tables: {
                    source: 'fus_iss_source',
                    destination: 'fus_iss_destination',
                  },
                },
                {
                  header: 'fus_rec_header',
                  tables: {
                    source: 'fus_rec_destination',
                    destination: 'fus_rec_source',
                  },
                },
                {
                  header: 'handwork_iss_header',
                  tables: {
                    source: 'handwork_iss_source',
                    destination: 'handwork_iss_destination',
                  },
                },
                {
                  header: 'handwork_rec_header',
                  tables: {
                    source: 'handwork_rec_source',
                    destination: 'handwork_rec_destination',
                  },
                },
                {
                  header: 'washing_iss_header',
                  tables: {
                    source: 'washing_iss_source',
                    destination: 'washing_iss_destination',
                  },
                },
                {
                  header: 'washing_rec_header',
                  tables: {
                    source: 'washing_rec_destination',
                    destination: 'washing_rec_source',
                  },
                },
                {
                  header: 'stitching_iss_header',
                  tables: {
                    source: 'stitching_iss_source',
                    destination: 'stitching_iss_destination',
                  },
                },
                {
                  header: 'stitching_rec_header',
                  tables: {
                    source: 'stitching_rec_destination',
                    destination: 'stitching_rec_source',
                  },
                },
                {
                  header: 'Refinishing_iss_header',
                  tables: {
                    source: 'Refinishing_iss_source',
                    destination: 'Refinishing_iss_destination',
                  },
                },
                {
                  header: 'Refinishing_rec_header',
                  tables: {
                    source: 'Refinishing_rec_destination',
                    destination: 'Refinishing_rec_source',
                  },
                },
                {
                  header: 'printing_iss_header',
                  tables: {
                    source: 'printing_iss_source',
                    destination: 'printing_iss_destination',
                  },
                },
                {
                  header: 'printing_rec_header',
                  tables: {
                    source: 'printing_rec_destination',
                    destination: 'printing_rec_source',
                  },
                },
                {
                  header: 'pleating_iss_header',
                  tables: {
                    source: 'pleating_iss_source',
                    destination: 'pleating_iss_destination',
                  },
                },
                {
                  header: 'pleating_rec_header',
                  tables: {
                    source: 'pleating_rec_destination',
                    destination: 'pleating_rec_source',
                  },
                },
                {
                  header: 'smoking_iss_header',
                  tables: {
                    source: 'smoking_iss_source',
                    destination: 'smoking_iss_destination',
                  },
                },
                {
                  header: 'smoking_rec_header',
                  tables: {
                    source: 'smoking_rec_destination',
                    destination: 'smoking_rec_source',
                  },
                },
                {
                  header: 'iron_iss_header',
                  tables: {
                    source: 'iron_iss_source',
                    destination: 'iron_iss_destination',
                  },
                },
                {
                  header: 'iron_rec_header',
                  tables: {
                    source: 'iron_rec_destination',
                    destination: 'iron_rec_source',
                  },
                }
              ];
            for (const process of processMappings) {
                const { header, tables } = process;
                const { source, destination } = tables;

                // Fetch vch_no from the header table
                const [headerRows] = await connection.query(
                    `SELECT * FROM ${header} WHERE jobber_name = ?`,
                    [jobber]
                );

                if (headerRows.length > 0) {
                    // For each vch_no, fetch data from the source and destination tables
                    for (const headerRow of headerRows) {
                        const { vch_no } = headerRow;

                        headerRow.table_name = header;
                        
                        // Fetch rows from the source table
                        const [sourceRows] = await connection.query(
                            `SELECT * FROM ${source} WHERE vch_no = ?`,
                            [vch_no]
                        );

                        // Fetch rows from the destination table
                        const [destinationRows] = await connection.query(
                            `SELECT * FROM ${destination} WHERE vch_no = ?`,
                            [vch_no]
                        );

                        // Store the results in the searchResults array
                        searchResults.push({
                            header: headerRow,  
                            source: sourceRows,
                            destination: destinationRows,
                        });
                    }
                }
            }

            // Send the search results as the response
            res.json(searchResults);

        } finally {
            // Release the connection back to the pool
            connection.release();
        }
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).send('Internal Server Error');
    }
});



module.exports = router;