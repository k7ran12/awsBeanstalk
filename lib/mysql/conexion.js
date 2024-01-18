const mysql = require('mysql2/promise');
require('dotenv').config()

const createConexion = async () => {
    try {
        const connection = await mysql.createConnection({
          host: process.env.LOCALHOST,
          user: process.env.USER,
          database: process.env.DATABASE,
          password: process.env.PASSWORD,
        });
        return connection
      } catch (err) {
        console.log(err);
      }
}

module.exports = createConexion;