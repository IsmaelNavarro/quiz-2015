var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require("method-override");
var session = require("express-session");

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser("quiz 2015"));
app.use(session());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    if(!req.path.match(/\/login|\/logout/)){
        req.session.redir = req.path;
    }

    //Hace las variabes visibles en las vistas
    res.locals.session = req.session;
    next();
});

//MW de auto-logout
app.use(function(req, res, next) {
    
    //Comprobamos que no hayan pasado más de dos minutos desde la última conexion y que exista un usuario logeado
    var fechaActual = new Date().getTime();
    if(req.session.user && req.session.conexion < fechaActual-120000){
        delete req.session.user;
        res.redirect("/");
    }
    else{
      //Guardamos la hora del sistema de la petición si el usuario esta conectado
        req.session.conexion = new Date().getTime();
        next();  
    }
    
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err, 
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, 
        errors: []
    });
});


module.exports = app;
