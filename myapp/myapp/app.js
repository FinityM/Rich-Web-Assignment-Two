var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var validator = require('validator');
var evalidator = require('email-validator');

var indexRouter = require('./routes/index');
// import
var indexRouter2 = require('./routes/index2');


var usersRouter = require('./routes/users');
const mysql = require("mysql");
const has = require("has-value");
const bcrypt = require("bcrypt");
const sqlstring = require("sqlstring");

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

    // Other email validator
    // var em = require('is-email');
    //
    // em.isEmail('is-email');
    //
    // var r1 = em.isEmail(email);
    //
    // console.log("email not valid" + r1);

    var errorMessage = '';

    // SQL sanitisation
    var sqlstring = require('sqlstring');

    var sqlusername = sqlstring.escape(username);
    var sqlemail = sqlstring.escape(email);
    var sqlpass = sqlstring.escape(password);

    console.log("es SQL attack username: " + sqlusername);
    console.log("es SQL attack email: " + sqlemail);
    console.log("es SQL attack pass: " + sqlpass);

    // Validate the email
    var result = evalidator.validate(email);

    // Validate the username
    const has = require('has-value');
    var hasValue = has(username);
    let n = username.search("^[a-zA-Z0-9_.-]*$");
    console.log(n);

    // Validate the password
    const bcrypt = require('bcrypt');
    const saltRounds = 15;

    if (result == false || result == null || result == '' || !result) {
        alert('Email is empty\n');
        errorMessage += 'Email not valid <br>';
    }

    if (hasValue == false) {
        alert('Username is empty\n');
        errorMessage += 'Username left empty <br>';
    }

    // Username sanitisation
    var xss = require("xss");
    var cleanedUsername = xss(username);
    console.log(cleanedUsername);

    // Print it out to the NodeJS console just to see if we got the variable.
    // console.log("User name = " + username);
    // console.log("Password = " + password);
    // console.log("Email = " + email);

    if (errorMessage.length == 0) {
        // Remember to check what database you are connecting to and if the
        // values are correct.
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'assignment_two'
        });

        // Hash and print the hashed password to the console
        bcrypt.hash(sqlpass, saltRounds, function (err, hash) {
            connection.connect();

            // This is the actual SQL query part
            connection.query("INSERT INTO `assignment_two`.`login` (`username`, `password`, `email`) VALUES ('" + sqlusername + "', '" + hash + "', '" + sqlemail + "');", function (error, results, fields) {
                if (error) {
                    res.send(error.code);
                } else res.send('received');
            });

            // Store hash in password
            console.log(hash);
            connection.end();

        });
    } else {
        res.send(errorMessage);
    }

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
