const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const connectDatabase = require('./database/database');
const adminRouter = require('./routes/admin');
const chatRouter = require('./routes/chat');
const socketHandler = require('./sockets/socketHandler');
const { networkInterfaces } = require('os');
const cors = require('cors')
const app = express();


const nets = networkInterfaces();
const results = Object.create(null); // Or just '{}', an empty object
for (const name of Object.keys(nets)) {
  for (const net of nets[name]) {
    // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
    // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
    const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
    if (net.family === familyV4Value && !net.internal) {
      if (!results[name]) {
        results[name] = [];
      }
      results[name].push(net.address);
    }
  }
}


connectDatabase();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.set('requestIpOptions', { preferIPv4: true });

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

app.use('/', adminRouter);
app.use('/chat', chatRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'page-chat-home.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'chatpage.html'));
});

app.get('/call', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'call.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'map.html'));
});

app.get('/error', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'error.hbs'));
});

app.get('/ipAddress', (req, res) => {
  console.log(results);
  let ipAddress;
  if (results.eth0) {
    ipAddress = results.eth0[0]
  } else {
    ipAddress = results.Ethernet[0]
  }
  console.log(ipAddress, "gcgfdghr");
  res.json(ipAddress)
});

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(3000, () =>
  console.log(`Server started on port ${3000}`)
);
socketHandler.init(server);

module.exports = app;
