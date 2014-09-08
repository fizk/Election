/**
 *
 *
 */


var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var crypto = require('crypto');
var multer = require('multer');
var swig = require('swig');
var nodemailer = require("nodemailer");
var FB = require('fb');
//var extensions = require('swig-extensions');

var routes = require('./routes/index');
var users = require('./routes/users');
var question = require('./routes/question');
var media = require('./routes/media');
var admin = require('./routes/admin');
var pages = require('./routes/page');

var app = express();

var config = require('./config');



app.locals.global = {
	categories : config.development.categories,
	constituency : config.development.constituency.map(function(item,index,collection){
		item.areas.map(function(item){
			return item.hash = crypto.createHash('sha1').update(item.name).digest('hex');
		});
		return item;
	}),
	parties : config.development.parties.map(function(item,index,collection){
		item.hash = crypto.createHash('sha1').update(item.name).digest('hex');
		return item;
	})
};





passport.serializeUser(function(user, done){
	done(null, user.id);
});
passport.deserializeUser(function(obj, done){
	db.collection('users').findOne({id:obj},function(error,data){
		done(null, data);
	});
});

passport.use( new FacebookStrategy({
	clientID: config.development.fb.appID,
	clientSecret: config.development.fb.appSecret,
	callbackURL: config.development.fb.url + 'auth/callback'
},function(accessToken, refreshToken, profile, done){
	FB.setAccessToken(accessToken);
	db.collection('users').findOne({id:profile.id},function(error, data){
		if(!data){
			db.collection('users').save(profile,function(){});
		}
		profile.access_token = accessToken;
		done(null,profile);
	});
}) );



var marked = require('marked');
swig.setFilter('markdown',marked);
swig.setFilter('substring',function(input){
	return (input.substring(0,140) + '…');
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', swig.renderFile);


app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret:'this is my secret' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(multer({dest:'./public/images/'}));

//MONGO-DB
//	configure MongoDB client
var db = undefined;
MongoClient.connect(config.development.dbUrl, function(err, database) {
	if(err) throw err;
	db = database;
});
//ADD MONGO
//	add mongo client instance to all requests
app.use(function(req, res, next){
	req.db = db;
	res.locals.user = req.user; //make user global to all views
	req.transport =  nodemailer.createTransport("SMTP",config.development.mail);
	req.facebook = FB;
	next();
})

app.use('/', routes);
app.use('/question', question);
app.use('/user', users);
app.use('/media',media);
app.use('/admin',admin);
app.use('/pages',pages);
//app.use('/auth/login',passport.authenticate('facebook',{ scope:'email' }));
app.use('/auth/login',passport.authenticate('facebook',{ scope:'publish_actions' }));
app.use('/auth/logout',function(request, response){
	request.logOut();
	response.redirect('/');
});
app.use('/auth/callback',passport.authenticate('facebook',{ failureRedirect:'/',successRedirect:'/' }),function(req, res){
	res.redirect('/');
});



/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
