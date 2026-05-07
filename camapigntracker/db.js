const mysql = require("mysql2");

const db = mysql.createConnection(process.env.MYSQL_URL || {
  host: "localhost",
  user: "root",
  password: "Gokul@123",
  database: "campaign_tracker",
  port: 3306
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected");
});

module.exports = db;