const express = require('express');
const path = require('path');
const morgan = require('morgan');
const AppError = require('./utils/appErrors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorControllers')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARE
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// set security HTTP Headers
// app.use(helmet())
app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'worker-src': ['blob:'],
          'child-src': ['blob:', 'https://js.stripe.com/'],
          'img-src': ["'self'", 'data: image/webp'],
          'script-src': [
            "'self'",
            'https://api.mapbox.com',
            'https://cdnjs.cloudflare.com',
            'https://js.stripe.com/v3/',
            "'unsafe-inline'",
          ],
          'connect-src': [
            "'self'",
            'ws://localhost:*',
            'ws://127.0.0.1:*',
            'http://127.0.0.1:*',
            'http://localhost:*',
            'https://*.tiles.mapbox.com',
            'https://api.mapbox.com',
            'https://events.mapbox.com',
          ],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Limit requests from same API. Avoid Denial of service attack
const limiter = rateLimit({
    max: 100,                                        // max no. of requests
    windowMs: 60 * 60 * 1000,                         // 100 requests in 1 hour from same IP is allowed
    message: 'Too many requests from same IP. Please try after an hour.'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb'}));                      // data more than 10kb wont be accepted  //Parses data from body
app.use(express.urlencoded({extended: true, limit: '10kb'})); 
app.use(cookieParser());                                      //Parses data from cookie

// Data sanitization against NOSQL query injection
app.use(mongoSanitize());                              // clears the the mongo operators($gt) used, when attacker tries to login using empty email and just by giving password

// Data sanitization against XSS
app.use(xss());                                 // clears input coming from malicious HTML code with js from attacker to our web app

// Prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
}));

// Testing middleware
app.use((req, res, next) => {
    req.requestedAt = new Date().toISOString();
    console.log(req.headers);
    
    next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Cases when the route-handlers cant handle the unhandled or invalid routes
app.all('*', (req, res, next) => {
    next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

module.exports = app;