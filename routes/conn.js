const mysql = require("mysql2");


const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "capstone"
})

conn.connect((error)=>{
    if(error) throw error;
    console.log("connected !")
});

module.exports = conn

