
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
});
connection.connect(function(err) {
  if (err) throw err
  console.log('You are now connected...')
  //connection.query('CREATE TABLE people(id int primary key, name varchar(255), age int, address text)')
})