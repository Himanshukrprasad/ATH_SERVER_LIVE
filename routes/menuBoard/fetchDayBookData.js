const express = require('express');
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

const processSets = [
    { header: 'Estimated_CS_header', tables: ['Estimated_CS_Item_Detail', 'Estimated_CS_JW_Detail'], tableName: 'ESTIMATED' },
    { header: 'cutting_header', tables: ['cutting_component', 'cutting_item_detail'], tableName: 'CUTTING' },
    { header: 'spliting_header', tables: [{ source: 'spliting_source', destination: 'spliting_destination' }], tableName: 'SPLITING' },
    { header: 'emb_iss_header', tables: [{ source: 'emb_iss_source', destination: 'emb_iss_destination' }], tableName: 'EMBROIDERY ISSUE' },
    { header: 'fus_iss_header', tables: [{ source: 'fus_iss_source', destination: 'fus_iss_destination' }], tableName: 'FUSING ISSUE' },
    { header: 'handwork_iss_header', tables: [{ source: 'handwork_iss_source', destination: 'handwork_iss_destination' }], tableName: 'HANDWORK ISSUE' },
    { header: 'washing_iss_header', tables: [{ source: 'washing_iss_source', destination: 'washing_iss_destination' }], tableName: 'WASHING ISSUE' },
    { header: 'stitching_iss_header', tables: [{ source: 'stitching_iss_source', destination: 'stitching_iss_destination' }], tableName: 'STITCHING ISSUE' },
    { header: 'Refinishing_iss_header', tables: [{ source: 'Refinishing_iss_source', destination: 'Refinishing_iss_destination' }], tableName: 'REFINISHING ISSUE' },
    { header: 'printing_iss_header', tables: [{ source: 'printing_iss_source', destination: 'printing_iss_destination' }], tableName: 'PRINTING ISSUE' },
    { header: 'pleating_iss_header', tables: [{ source: 'pleating_iss_source', destination: 'pleating_iss_destination' }], tableName: 'PLEATING ISSUE' },
    { header: 'smoking_iss_header', tables: [{ source: 'smoking_iss_source', destination: 'smoking_iss_destination' }], tableName: 'SMOKING ISSUE' },
    { header: 'iron_iss_header', tables: [{ source: 'iron_iss_source', destination: 'iron_iss_destination' }], tableName: 'IRON ISSUE' },
    { header: 'emb_rec_header', tables: [{ source: 'emb_rec_source', destination: 'emb_rec_destination' }], tableName: 'EMBROIDERY RECEIVE' },
    { header: 'fus_rec_header', tables: [{ source: 'fus_rec_source', destination: 'fus_rec_destination' }], tableName: 'FUSING RECEIVE' },
    { header: 'handwork_rec_header', tables: [{ source: 'handwork_rec_source', destination: 'handwork_rec_destination' }], tableName: 'HANDWORK RECEIVE' },
    { header: 'washing_rec_header', tables: [{ source: 'washing_rec_source', destination: 'washing_rec_destination' }], tableName: 'WASHING RECEIVE' },
    { header: 'stitching_rec_header', tables: [{ source: 'stitching_rec_source', destination: 'stitching_rec_destination' }], tableName: 'STITCHING RECEIVE' },
    { header: 'Refinishing_rec_header', tables: [{ source: 'Refinishing_rec_source', destination: 'Refinishing_rec_destination' }], tableName: 'REFINISHING RECEIVE' },
    { header: 'printing_rec_header', tables: [{ source: 'printing_rec_source', destination: 'printing_rec_destination' }], tableName: 'PRINTING RECEIVE' },
    { header: 'pleating_rec_header', tables: [{ source: 'pleating_rec_source', destination: 'pleating_rec_destination' }], tableName: 'PLEATING RECEIVE' },
    { header: 'smoking_rec_header', tables: [{ source: 'smoking_rec_source', destination: 'smoking_rec_destination' }], tableName: 'SMOKING RECEIVE' },
    { header: 'iron_rec_header', tables: [{ source: 'iron_rec_source', destination: 'iron_rec_destination' }], tableName: 'IRON RECEIVE' },
    { header: 'sfg_header', tables: [{source:'sfg_source'}, {destination:'sfg_destination'}], tableName: 'SEMI FINISHED GOODS' },
    { header: 'purchase_bill_header', tables: [{source:'purchase_bill_detail'}, {destination:'purchase_bill_tax_detail'}], tableName: 'JOBBER BILL' },
    { header: 'fc_header', tables: [{source:'fc_fabric_detail'}, {destination:'fc_process_detail'}], tableName: 'FINAL COSTING' }
];

router.post("/", async (req, res) => {
    const { startDate, endDate } = req.body; // Get startDate and endDate from the request body
 
    try {
        const result = [];

        for (const set of processSets) {
            const { header, tables, tableName } = set;

            // Fetch all rows from the header table where vch_date is between startDate and endDate
            const [headerRows] = await pool.query(
                `SELECT * FROM ${header} WHERE is_delete = 0 AND vch_date BETWEEN ? AND ?`,
                [startDate, endDate]
            );

            for (const headerRow of headerRows) {
                const vchNo = headerRow.vch_no;
                headerRow.tableName = tableName; // Add the header table name to the header object

                const groupedData = {
                    vch_no: vchNo,
                    header: headerRow,
                    tables: {}
                };

                // Fetch rows from the associated tables for the current vch_no
                for (const table of tables) {
                    if (typeof table === 'string') {
                        // If it's a simple table name, fetch as before
                        const [tableRows] = await pool.query(`SELECT * FROM ${table} WHERE vch_no = ?`, [vchNo]);
                        groupedData.tables[table] = tableRows;
                    } else {
                        // If the table is an object with source and destination
                        if (table.source) {
                            const [sourceRows] = await pool.query(`SELECT * FROM ${table.source} WHERE vch_no = ?`, [vchNo]);
                            groupedData.tables['source'] = sourceRows;
                        }
                        if (table.destination) {
                            const [destinationRows] = await pool.query(`SELECT * FROM ${table.destination} WHERE vch_no = ?`, [vchNo]);
                            groupedData.tables['destination'] = destinationRows;
                        }
                    }
                }

                result.push(groupedData);
            }
        }

        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred', error });
    }
});

module.exports = router;
