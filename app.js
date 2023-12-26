const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const connectDatabase = require('./database/database');
const adminRouter = require('./routes/admin');
const chatRouter = require('./routes/chat');
const socketHandler = require('./sockets/socketHandler');
const cors = require('cors')
const app = express();

connectDatabase();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
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
