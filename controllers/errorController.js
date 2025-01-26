const AppError = require('./../utils/appError');

const handelCastErrorDB = (err) => {
  const message = `Invalid  ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handelDuplicateFieldsDB = (err) => {
  let val = err.keyValue.name;
  const message = `Duplicate field value: ${val}. Please use another value!`;
  return new AppError(message, 400);
};

const handelValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((val) => val.message);
  const message = `Invalid input data.. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handelJWTError = (err) =>
  new AppError('Invalid token. Please log in again', 401);

const handelJWTExpiredError = (err) =>
  new AppError('Your token has been expired!, Please login again', 401);
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational, trusted error:Send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Programming or 3 rd party or other unknown error: don't want to leak details to client
  } else {
    //1) Log Error
    console.error(`Error `, err);

    //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; //shallo coppy
    if (err.name === 'CastError') error = handelCastErrorDB(error);
    if (error.code === 11000) error = handelDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handelValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handelJWTError(error);
    if (err.name === 'TokenExpiredError') error = handelJWTExpiredError(error);
    sendErrorProd(error, res);
  }
};
