var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
// import
var indexRouter2 = require('./routes/index2');

var usersRouter = require('./routes/users');
const mysql = require("mysql");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// use the route
app.use('/index2', indexRouter2);

app.use('/users', usersRouter);


app.get('/login', function (req, res) {

    console.log("hello");
    res.send("all ok")

});

app.post('/login', function (req, res) {

    // catch the username that was sent to us from the jQuery POST on the index.ejs page
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;

    var errorMessage = '';

    // Sanitisation and validation
    var validator = require('validator');
    var emailValid = validator.isEmail(email); // true or false

    if (emailValid == false){
        errorMessage += 'Email not valid \n';
        console.log(errorMessage);
    }

    // If there is an error
    if (errorMessage.length > 0) {
        res.send(errorMessage);
    } else {
        // DB insert statement
        // Remember to check what database you are connecting to and if the
        // values are correct.
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'assignment_two'
        });

        connection.connect();

        // This is the actual SQL query part
        connection.query("INSERT INTO `assignment_two`.`login` (`username`, `password`, `email`) VALUES ('" + username + "', '" + password + "', '" + email + "');", function (error, results, fields) {
            if (error) throw error;
        });

        connection.end();

        res.send("All ok");
    }

    // Print it out to the NodeJS console just to see if we got the variable.
    console.log("User name = " + username);
    console.log("Password = " + password);
    console.log("Email = " + email);


});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;