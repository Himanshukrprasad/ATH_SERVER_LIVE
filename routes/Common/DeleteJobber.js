const express = require("express");
const router = express.Router();
require('dotenv').config();
const pool = require('../dbConfigPromise');

router.post("/", async (req, res) => {
    let { vchNo } = req.body;

    if (!vchNo) {
        return res.status(400).json({ message: "vchNo is required" });
    }

    try {
        // Begin a transaction
        await pool.query('START TRANSACTION');

        // Update is_delete to 1 in 'purchase_bill_header'
        await pool.query(`
            UPDATE purchase_bill_header 
            SET is_delete = 1 
            WHERE vch_no = ?`, [vchNo]);

        // Update is_delete to 1 in 'purchase_bill_tax_detail'
        await pool.query(`
            UPDATE purchase_bill_tax_detail 
            SET is_delete = 1 
            WHERE vch_no = ?`, [vchNo]);

        // Update is_delete to 1 in 'purchase_bill_detail'
        await pool.query(`
            UPDATE purchase_bill_detail 
            SET is_delete = 1 
            WHERE vch_no = ?`, [vchNo]);

        // Commit the transaction
        await pool.query('COMMIT');

        // Respond with success
        res.status(200).json({ message: `Records updated successfully for vch_no: ${vchNo}` });
    } catch (error) {
        // Rollback the transaction in case of error
        await pool.query('ROLLBACK');
        console.error("Error updating records:", error);
        res.status(500).json({ message: "An error occurred", error });
    }
});

module.exports = router;
