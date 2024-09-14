const express = require("express");
const router = express.Router();
//const mysql2 = require("mysql2/promise");
require('dotenv').config();
const pool = require('./dbConfigPromise')

// const pool = mysql2.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

router.post("/", async (req, res) => {
  const { designNo, designId } = req.body;

  try {
    // Query to check if both designNo and designId exist in the cutting_header table
    const [rows] = await pool.execute(
      `SELECT * FROM cutting_header WHERE design_no = ? AND design_id = ?`,
      [designNo, designId]
    );

    // Check if a matching row was found
    if (rows.length > 0) {
      return res.json({ status: false });
    } else {
      return res.json({ status: true });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    return res.status(500).json({ error: "Database query error" });
  }
});

module.exports = router;
