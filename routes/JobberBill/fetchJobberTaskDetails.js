const express = require("express");
const router = express.Router();
//const mysql2 = require("mysql2");
require('dotenv').config();
const pool = require('../dbConfig')

// const pool = mysql2.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

function mergeResults(results) {
  const merged = {};

  results.forEach(row => {
    const key = `${row.vch_no}_${row.design_no}_${row.design_id}_${row.jw_amt}_${row.destination_design_no}_${row.type}`;

    if (!merged[key]) {
      merged[key] = {
        ...row,
        jobwork_names: new Set()
      };
    }

    merged[key].jobwork_names.add(row.jobwork_name);
  });

  return Object.values(merged).map(row => ({
    ...row,
    jobwork_names: Array.from(row.jobwork_names)
  }));
}

router.post("/", (req, res) => {
  const { jobberName } = req.body;
  
  if (!jobberName) {
    res.status(400).send("jobberName is required");
    return;
  }

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).send("Error connecting to the database");

    }

    const fetchDataQuery = `
 WITH JobberCTE AS (
  SELECT ? AS jobber_name
)
SELECT 
  'emb_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  emb_rec_header hdr
JOIN 
  emb_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'fus_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  fus_rec_header hdr
JOIN 
  fus_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'handwork_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  src.jw_amt,
  src.design_no AS destination_design_no,
  src.type,  -- Fetch type from source
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  handwork_rec_header hdr
JOIN 
  handwork_rec_source src ON hdr.vch_no = src.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'washing_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  washing_rec_header hdr
JOIN 
  washing_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'Refinishing_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  Refinishing_rec_header hdr
JOIN 
  Refinishing_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'printing_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  printing_rec_header hdr
JOIN 
  printing_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'pleating_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  pleating_rec_header hdr
JOIN 
  pleating_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'iron_rec_header' AS table_name, 
  hdr.design_no, 
  hdr.design_id,
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  iron_rec_header hdr
JOIN 
  iron_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'stitching_rec_header' AS table_name, 
  hdr.design_no,
  hdr.design_id, 
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  stitching_rec_header hdr
JOIN 
  stitching_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'smoking_rec_header' AS table_name, 
  hdr.design_no,
  hdr.design_id, 
  hdr.vch_no,
  dst.jw_amt,
  dst.design_no AS destination_design_no,
  dst.type,  -- Fetch type from destination
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  smoking_rec_header hdr
JOIN 
  smoking_rec_destination dst ON hdr.vch_no = dst.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE)
UNION ALL
SELECT 
  'cutting_header' AS table_name,
  hdr.design_no,
  hdr.design_id,
  hdr.vch_no,
  (hdr.actual_qty * cc.cutting_charges) AS jw_amt,
  hdr.design_no AS destination_design_no,  -- Use hdr.design_no for destination_design_no
  NULL AS type,  -- Placeholder to match column count
  hdr.estimate_cs_vch_no,
  hdr.is_delete
FROM 
  cutting_header hdr
JOIN 
  cutting_item_detail itm ON hdr.vch_no = itm.vch_no
JOIN 
  JobberCTE j ON hdr.jobber_name = j.jobber_name
LEFT JOIN 
  cutting_component cc ON hdr.vch_no = cc.vch_no
WHERE 
  hdr.jobber_name = (SELECT jobber_name FROM JobberCTE);
  `;


  connection.query(fetchDataQuery, [jobberName], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      connection.release();
      return res.status(500).send("Error fetching data");
    }
  
    if (results.length === 0){
      connection.release();
      return res.json([]);
    }
  
    const mergedResults = mergeResults(results);
    const estimateCsVchNos = mergedResults.map(row => row.estimate_cs_vch_no).filter(Boolean);
  
    if (estimateCsVchNos.length === 0) {
      connection.release();
      return res.json(mergedResults);
    }
  
    const fetchJobworkNameQuery = `
      SELECT vch_no, jobwork_name
      FROM Estimated_CS_JW_Detail
      WHERE vch_no IN (?) AND jobber_name = ?
    `;
  
    connection.query(fetchJobworkNameQuery, [estimateCsVchNos, jobberName], (jobworkError, jobworkResults) => {
      if (jobworkError) {
        console.error("Error fetching jobwork names:", jobworkError);
        connection.release();
        return res.status(500).send("Error fetching jobwork names");
      }
  
      const jobworkMap = jobworkResults.reduce((acc, row) => {
        acc[row.vch_no] = row.jobwork_name;
        return acc;
      }, {});
  
      let combinedResults = mergedResults.map(row => ({
        ...row,
        jobwork_names: row.jobwork_names.concat(jobworkMap[row.estimate_cs_vch_no] || [])
      }));
  
      const fetchVchNoQuery = `
        SELECT vch_no 
        FROM purchase_bill_header 
        WHERE party_name = ? AND is_delete = 0
      `;
      connection.query(fetchVchNoQuery, [jobberName], (vchNoError, vchNoResults) => {
        if (vchNoError) {
          console.error("Error fetching vch_no:", vchNoError);
          connection.release();
          return res.status(500).send("Error fetching vch_no");
        }
  
        const vchNos = vchNoResults.map(row => row.vch_no);
  
        if (vchNos.length === 0) {
          connection.release();
          return res.json(combinedResults);
        }
  
        // Fetch both design_no and type from purchase_bill_detail
        const fetchDesignNoAndTypeQuery = `
          SELECT design_no, process_vch_no
          FROM purchase_bill_detail
          WHERE vch_no IN (?)
        `;
  
        connection.query(fetchDesignNoAndTypeQuery, [vchNos], (designNoError, designNoResults) => {
          connection.release();
  
          if (designNoError) {
            console.error("Error fetching design_no and type:", designNoError);
            return res.status(500).send("Error fetching design_no and type");
          }
  
          // Create a set of objects containing both design_no and process_vch_no for filtering
          const designAndProcessVchNoSet = new Set(designNoResults.map(row => `${row.design_no}-${row.process_vch_no}`));
        
          // Filter combinedResults to exclude any entries with matching design_no and vch_no
          combinedResults = combinedResults.filter(row => {
            const designTypeKey = `${row.destination_design_no}-${row.vch_no}`;
          
            return !designAndProcessVchNoSet.has(designTypeKey);
          });
         
          res.json(combinedResults);
        });
      });
    });
  });
  
  });
});








module.exports = router;
