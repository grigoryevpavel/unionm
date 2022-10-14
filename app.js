require('dotenv').config(); 
var fs = require('fs');
var path = require('path');
var fileStreamRotator = require('file-stream-rotator'); 

var cookieParser = require('cookie-parser');
var logger = require('morgan');

//ensure log directory exists for acccess log
var logDirectory = __dirname + '/logs';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

//use custom token for date
logger.token('date', function () {
  return new Date();
});

//create a rotating write stream 
var logStream = fileStreamRotator.getStream({
  filename: logDirectory + '/%DATE%-'+(process.env.LOG_FILE || 'log.txt'),
  frequency:process.env.LOG_INTERVAL || 'daily',
  verbose: false,
  size:process.env.LOG_SIZE || '10M',
  date_format: 'YYYYMMDD HH-mm',

});
var express = require('express'); 

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade'); 

// if log file defined then use logStream else print to console
app.use(logger(process.env.LOG_FORMAT || "dev", {
  stream: process.env.LOG_FILE ? logStream : process.stdout
}));

// if log file is defined then also show logs in console
// else it will use the previous process.stdout to print to console
if(process.env.LOG_FILE) {
  app.use(logger(process.env.LOG_FORMAT || "dev"));    
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// error handler
app.use( (err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = JSON.stringify( err);
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.listen(3000, () => {
  console.debug('App listening on :'+port);
});
