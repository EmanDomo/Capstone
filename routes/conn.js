// const mysql = require("mysql2");


// const conn = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB
// })

// conn.connect((error)=>{
//     if(error) throw error;
//     console.log("connected !")
// });

// module.exports = conn


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