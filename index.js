// Setup Express
var express = require('express'),
    app     = express();

// Other Modules
var ejsLayouts   = require('express-ejs-layouts'),
    sanitizeHtml = require('sanitize-html'),
    session      = require('express-session'),
    bodyParser   = require('body-parser'),
    flash        = require('connect-flash'),
    db           = require("./models");

// Use Modules
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/assets/static'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(ejsLayouts);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(function(req, res, next) {
  if (req.session.account) {
    db.user.findById(req.session.account).then(function(account) {
      req.currentAccount = account;
      next();
    });
  } else {
    req.currentAccount = false;
    next();
  }
});
app.use(function(req,res,next){
  res.locals.currentAccount = req.currentAccount;
  res.locals.alerts = req.flash();
  next();
});

// Require Controllers
var indexPage  = require('./controllers/index');
var secretPage = require('./controllers/secret');
var authPage   = require('./controllers/auth')

// Socket.io Stuff
var server = require('http').createServer(app),
    io     = require('socket.io')(server),
    users  = {};

io.on('connection', function(socket) {
  console.log(socket.handshake.session);
  socket.on('disconnect', function(){
    var user = users[socket.id];
    delete users[socket.id];
    var obj = {
      user  : user,
      users : users
    }
    io.emit('user leave', obj);
    
  });

  socket.on('username', function(username){
    users[socket.id] = sanitizeHtml(username, {allowedTags: [], allowedAttributes: []});
    var obj = {
      user  : users[socket.id],
      users : users
    }

    db.account.findOne().then(function(account){
      account.createUser({
        name     : users[socket.id],
        socketId : socket.id
      }).spread(function(user){
        console.log(user);
      });
    });

    // db.user.findOrCreate({where: { name: users[socket.id], socketId: socket.id }}).spread(function(user, created) {
    //   console.log(user, created);
    // });

    io.emit('user join', obj);
  });

  socket.on('chat message', function(message){
    var obj = {
      user    : users[socket.id],
      message : sanitizeHtml(message, {allowedTags: [], allowedAttributes: []})
    }

    db.user.findOne({where:{ socketId : socket.id}}).then(function(user){
      user.createMessage({
        message : obj.message
      }).then(function(message){
        console.log(message.get());
      });
    })

   io.emit('chat stream', obj);
  });

  socket.on('user typing', function(){
    console.log('Someone is typing');
    io.emit('user typing');
  })

});

// Use Controllers
app.use('/', indexPage);
app.use('/auth', authPage);
app.use('/secret', secretPage);

server.listen(process.env.PORT || 3000);