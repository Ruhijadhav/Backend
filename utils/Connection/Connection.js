import mysql from 'mysql2';
import env from 'dotenv';
env.config();
let connection = mysql.createConnection({
    host: "localhost",
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    port: 3306,
    database: 'dept'
});

export default connection;