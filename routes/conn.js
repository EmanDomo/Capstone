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
    password: "Qw01093512734863",
    database: "capstone",
    multipleStatements: true
})

conn.connect((error) => {
    if (error) throw error;
    console.log("connected !")
});

module.exports = conn

