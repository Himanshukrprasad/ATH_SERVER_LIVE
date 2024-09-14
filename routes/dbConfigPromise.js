// db.js
const mysql2 = require("mysql2/promise");
require('dotenv').config();  // Load environment variables from .env file

// Create a connection pool with the required database configurations
const pool = mysql2.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 500,  // Set the maximum number of connections in the pool
  queueLimit: 0,        // No limit for queueing connection requests
});

// Export the pool so it can be used in other files
module.exports = pool;
