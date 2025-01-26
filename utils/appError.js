class AppError extends Error {
  //Error is a built-in JavaScript class.
  constructor(message, statusCode) {
    // Call the parent class (Error) constructor
    super(message); // The built-in Error class only needs the message as an argument

    // Custom properties for our AppError class
    this.statusCode = statusCode; // HTTP status code (e.g., 404, 500)

    // Determine the status of the error (fail or error)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; //400-499* (clint error (fail))  , \\500 -599 (server error (error))

    // Mark this error as operational (not a programming or unknown error)
    this.isOperational = true;

    // Capture the stack trace, excluding this constructor call from the trace
    Error.captureStackTrace(this, this.constructor);
  }
}

//es6 inheritance, one class inherit from another class
//apError class inherit from Error class
//we use super to call parent class

//stack tray
//every error has a stack, it will tell then error and where it has happend

module.exports = AppError;
