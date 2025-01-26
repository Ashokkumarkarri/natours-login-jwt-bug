const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Catching Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!🔥 Shutting down...');
  process.exit(1); //code 0:success, code 1:uncaught exception
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on ${port}....`);
});
console.log(`running on ${process.env.NODE_ENV} Environment `);

//globally handling unhandled rejection.
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!🔥 Shutting down...');
  server.close(() => {
    process.exit(1); //code 0:success, code 1:uncaught exception
  });
});
