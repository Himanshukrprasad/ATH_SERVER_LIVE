const mysql = require('mysql2');

// Database connection configuration
const connection = mysql.createConnection({
  host: '184.168.99.250',
  user: 'u114727550_artherv',
  password: 'Artherv@321',
  database: 'u114727550_artherv_db'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Connection failed:', err.message);
  } else {
    console.log('Connected successfully to the database!');
  }
});

// Optional: Close the connection
connection.end();
