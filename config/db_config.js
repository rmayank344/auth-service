const Sequelize = require("sequelize");
require('dotenv').config()
let sequelize;
try {
    sequelize = new Sequelize(
        process.env.SQL_DB_NAME,
        process.env.SQL_DB_USER,
        process.env.SQL_DB_PASSWORD,
        {
            dialect: "mysql",
            host: process.env.SQL_DB_HOST,
            define: {
                timestamps: false,
            },
        }
    );
    console.log('sql db connected succesfully')
} catch(error) {
    console.log('sql db connection error', error)
}


module.exports = sequelize