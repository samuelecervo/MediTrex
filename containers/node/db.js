require('dotenv').config();
const {Client} = require('pg')

const client = new Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_DATABASE,
  database: process.env.POSTGRES_DATABASE,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT
});

client.connect();

//ALL DB FUNCTIONS
class functions {
  
}

module.exports = functions;