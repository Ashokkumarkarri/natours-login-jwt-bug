const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path'); //core module, built in module, we use path module to manipulate the path names.
const cookieParser = require('cookie-parser');
const cors = require('cors');

// const { execArgv } = require('process');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug'); //pug templates are called views in express
app.set('views', path.join(__dirname, 'views'));
//views,path to views: we are setting the path to the views folder

//1)GLOBAL MIDDLEWARE
app.use(
  cors({
    origin: 'http://localhost:8000', // Replace with your frontend origin
    credentials: true, // Allow cookies and other credentials
  }),
);

// app.options("*", cors());

//Serving static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public')));

//set security HTTP headers
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

//DEvelopment logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  max: 100, //100 req for same IP
  windowMs: 60 * 60 * 1000, // in 1 hour
  message: 'Too many request from this IP, please try again in a hour',
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
//when body larger than 10kb will not be accepted
app.use(express.json({ limit: '10kb' })); //middleware
app.use(cookieParser()); //parses the data from cookies

//Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XXS attacks
app.use(xss());

//Prevent Param Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

//Testing middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

//3)Routes
app.use('/', viewRouter); //mounting Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
//here are we are kind of adding a middleware to this route.
//so whenever there a route to this '/api/v1/reviews' this middleware will be called "api/v1/reviews" will act a root

app.all('*', (req, res, next) => {
  // const err = new Error(`can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;
  next(new AppError(`can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
//when we specify the 4 args the express will get to know that it's an error handling middleware
module.exports = app;
