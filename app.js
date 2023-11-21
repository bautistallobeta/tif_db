var createError = require('http-errors');
const express = require('express');
const app = express();
const connection = require("./dbConexion");
const indexRouter = require("./routes/indexRouter");
const expedientesRouter = require("./routes/expedientesRouter");
const juecesRouter = require("./routes/juecesRouter");
const contadoresRouter = require("./routes/contadoresRouter");
const informesRouter = require("./routes/informesRouter");
const accesoRouter = require("./routes/accesoRouter");
const camarasRouter = require('./routes/camarasRouter');
const caratulasRouter=require('./routes/caratulasRouter');
const juzgadosRouter = require('./routes/juzgadosRouter');
const centroJudicialRouter = require('./routes/centroJudicialRouter');
const usuariosRouter = require('./routes/usuariosRouter');
const generoRouter = require('./routes/generoRouter');
const estadoCivRouter = require('./routes/estadoCivRouter');
const instanciaRouter = require('./routes/instanciaRouter');
const nacionalidadRouter = require('./routes/nacionalidadRouter');
const tipoRouter = require('./routes/tipoRouter');
const secretariosRouter = require('./routes/secretariosRouter');


// Ruta principal
app.use('/', indexRouter);
app.use('/expedientes', expedientesRouter);
app.use('/jueces', juecesRouter);
app.use('/contadores', contadoresRouter);
app.use('/informes', informesRouter);
app.use('/acceso', accesoRouter);
app.use('/camaras', camarasRouter);
app.use('/juzgados', juzgadosRouter);
app.use('/caratulas', caratulasRouter);
app.use('/centro', centroJudicialRouter);
app.use('/usuarios', usuariosRouter);
app.use('/genero', generoRouter);
app.use('/estadoCiv', estadoCivRouter);
app.use('/instancia', instanciaRouter);
app.use('/nacionalidad', nacionalidadRouter);
app.use('/tipo', tipoRouter);
app.use('/secretarios', secretariosRouter);


app.set('view engine', 'ejs');

// Resto de rutas para CRUD aquí

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


// Configurar archivos estáticos
app.use(express.static('public'));
//var express = require('express');
//var path = require('path');
//var cookieParser = require('cookie-parser');
//var logger = require('morgan');
//
//var indexRouter = require('./routes/index');
//var usersRouter = require('./routes/users');
//
//var app = express();
//
//// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');
//
//app.use(logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//
//app.use('/', indexRouter);
//app.use('/users', usersRouter);
//
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
//
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//
//module.exports = app;
console.log('funciona');