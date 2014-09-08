var express = require('express');
var router = express.Router();
var config = require('../config');
var crypto = require('crypto');


/**
 * Form to generate validation code.
 *
 * Form that admin can use to generate access_code.
 */
router.get('/generate',function(request, response){
	if( request.isAuthenticated() ){
		if( request.user.admin ){
			response.render('admin/generate',{});
		}else{
			response.render('403',{});
		}
	}else{
		response.redirect('/pages/login');
	}
});

/**
 * Display code.
 *
 * After the admin has generated the access_code, this
 * page will show it.
 */
router.post('/generate',function(request, response){

	//LOGGED IN USER
	//	user is logged in
	if( request.isAuthenticated()  ){

		//ADMIN
		//	user is admin
		if( request.user.admin ){
			var shasum = crypto.createHash('sha1').update(
					request.body.constituency +
					request.body.party +
					config.development.salt
			).digest('hex');


			var partyArray = config.development.parties.filter(function(party){
				return party.hash ==  request.body.party;
			});
			var constituencyObject = {name:undefined};
			for(var a=0; a<config.development.constituency.length;a++){
				for(var b=0;b<config.development.constituency[a].areas.length;b++){
					if(config.development.constituency[a].areas[b].hash == request.body.constituency ){
						constituencyObject = config.development.constituency[a].areas[b];
					}
				}
			}

			response.render('admin/code-mail',{
				constituency: constituencyObject.name,
				party: partyArray[0].name,
				email: request.body.email,
				code: request.body.constituency + '|' + request.body.party + '|' + shasum,
				host: 'http://'+request.headers.host
			},function(error,html){

				//STORE MAIL
				//	record that the message has been sent.
				request.db.collection('mails').insert({
					constituency: constituencyObject.name,
					party: partyArray[0].name,
					email: request.body.email,
					code: request.body.constituency + '|' + request.body.party + '|' + shasum,
					date: new Date()

				},function(){});

				//SEND MAIL
				//	send an e-mail to the one who will use the code
				request.transport.sendMail({
					from: "Fred Foo ✔ <foo@blurdybloop.com>", // sender address
					to: request.body.email,
					subject: "Spurðu frambjóðanda : kóði", // Subject line
					text: html,
					html: html
				}, function(error, mail){
					if(error){
						console.log(error);
					}else{
						console.log("Message sent: " + mail.message);
					}
				});
			});

			response.render('admin/code',{
				constituency: constituencyObject.name,
				party: partyArray[0].name,
				email: request.body.email,
				code: request.body.constituency + '|' + request.body.party + '|' + shasum
			});

		//NORMAL USER
		//	this is a normal user
		}else{
			response.render('403');
		}
	//NOT LOGGED IN
	//	user is not logged in
	}else{
		response.redirect('/pages/login');
	}

});

/**
 * List all questions in the system.
 * This is for admin to manage questions (delete).
 */
router.get('/list',function(request, response){

	//LOGGED IN
	//	user is logged in
	if( request.isAuthenticated() ){

		//ADMIN
		//	user is admin
		if( request.user.admin ){

			//BUILD SEARCH FILTER
			//	examine request query and extract parameters
			//	from it to form the find criteria.
			var size = 10;
			var skip = parseInt(request.query.counter||0)*size;

			var range = request.get('range');
			range = (range)
				? range.split(/items:([0-9]*)-([0-9]*)/)
				: null ;

			if(range){
				skip = parseInt(range[1]);
				size = parseInt(range[2]) - parseInt(range[1]);
			}

			//QUERY
			//	query for all question's count
			request.db.collection('questions').count(function(error, count){
				//SEARCH
				//	search for questions in database
				request.db.collection('questions').find().sort({created:-1}).limit(size).skip(skip).toArray(function(error,data){
					response.status(206);
					response.set({
						'Status': 206,
						'Range-Unit': 'items',
						'Content-Range': (skip)+('-')+(skip+data.length)+('/'+count)
					});
					if(request.xhr){
						response.render('questions/partial-list',{
							questions:data,
							authenticated:request.isAuthenticated(),
							user: request.user || null,
							manage: true
						});
					}else{
						response.render('index',{
							title:'Election',
							questions:data,
							authenticated:request.isAuthenticated(),
							user: request.user || null,
							manage: true
						});
					}
				});
			});
		//NORMAL USER
		//	this is a normal user
		}else{
			response.render('403')
		}
	//NOT LOGGED IN
	//	user is not logged in
	}else{
		response.redirect('/pages/login');
	}

});

/**
 * List all users
 * Get a list og all users in the system in alphabet order,
 * paginated
 */
router.get('/users',function(request, response){

	//LOGGED IN
	//	is user logged in
	if( request.isAuthenticated() ){

		//ADMIN
		//	user is admin
		if( request.user.admin ){

			var criteria = {};
			var size = 10;
			var skip = parseInt(request.query.counter||0)*size;

			if(request.query && request.query.q){
				criteria.displayName = { $regex : request.query.q, $options: 'i'};
			}

			var range = request.get('range');
			range = (range)
				? range.split(/items:([0-9]*)-([0-9]*)/)
				: null ;

			if(range){
				skip = parseInt(range[1]);
				size = parseInt(range[2]) - parseInt(range[1]);
			}

			var collection = request.db.collection('users');

			//COUNT
			//	count all users
			collection.count(criteria,function(error,count){
				//FIND
				//	find all users
				collection.find(criteria).sort({displayName:1}).limit(size).skip(skip).toArray(function(error,users){
					response.status(206);
					response.set({
						'Status': 206,
						'Range-Unit': 'items',
						'Content-Range': (skip)+('-')+(skip+users.length)+('/'+count)
					});
					if( request.xhr ){
						response.render('./admin/users-list',{
							users: users
						});
					}else{
						response.render('./admin/users',{
							users: users
						})
					}
				});
			});
		//NORMAL USER
		//	this is a normal user
		}else{
			response.render('403');
		}

	//NOT LOGGED IN
	//	use ris not logged in
	}else{
		response.redirect('/pages/login');
	}
});

/**
 * Delete one user.
 *
 * @todo delete all questions and answers from this user.
 */
router.get('/users/delete/:id',function(request, response){
	//USER AND ADMIN
	//	user is logged in and is admin
	if( request.isAuthenticated() && request.user.admin ){
		var collection = request.db.collection('users');
		collection.remove({id:request.param('id')},function(error,data){
			if( request.xhr ){
				if(error){
					response.json({
						succss: true,
						count: data
					});
				}else{
					response.json({
						succss: true,
						count: data
					});
				}
			}else{
				response.redirect('/admin/users');
			}
		});
	//NOT LOGGED IN
	//	user is not logged in, or he/she is not admin
	}else{
		response.render('403');
	}
});

/**
 * Make user admin or not
 */
router.get('/users/admin/:id',function(request,response){
	//LOGGED IN
	//	user is logged in
	if( request.isAuthenticated() ){
		if( request.user.admin ){
			var collection = request.db.collection('users');
			collection.findOne({id:request.param('id')},function(error,user){
				if( user.admin ){
					user.admin = false;
					response.json({
						admin: false
					});
				}else{
					user.admin = true;
				}
				collection.save(user,function(error,doc){});
				response.json({
					admin: user.admin
				});
			});
		}else{}
	//NOT LOGGED IN
	//	user is not logged in
	}else{
		if( request.xhr ){

		}else{

		}
		response.json({});
	}


});

/**
 * Get a list of all emails that have been sent out
 * regarding access_tokens
 */
router.get('/emails',function(request, response){

	if( request.isAuthenticated() && request.user.admin ){
//BUILD SEARCH FILTER
		//	examine request query and extract parameters
		//	from it to form the find criteria.
		var criteria = {};
		var size = 10;
		var skip = parseInt(request.query.counter||0) * size;
		if(request.query && request.query.q){
			criteria.email = { $regex : request.query.q, $options: 'i'};
		}

		var range = request.get('range');
		range = (range)
			? range.split(/items:([0-9]*)-([0-9]*)/)
			: null ;

		if(range){
			skip = parseInt(range[1]);
			size = parseInt(range[2]) - parseInt(range[1]);
		}
		var collection = request.db.collection('mails');

		//COUNT
		//	count total number of items in list
		//	given the criteria.
		collection.count(criteria,function(error, count) {

			collection.find(criteria).sort({date:-1}).limit(size).skip(skip).toArray(function (error, data) {
				//HEADERS
				//	This document contains (maybe) more items
				//	we need to send headers along with data to tell
				//	the client where in the data-set we are.
				response.status(206);
				response.set({
					'Status': 206,
					'Range-Unit': 'items',
					'Content-Range': (skip)+('-')+(skip+data.length)+('/'+count)
				});
				if(request.xhr){
					response.render('./admin/email-list', {
						mails: data
					});
				}else{
					response.render('./admin/emails', {
						mails: data
					});
				}

			});
		});
	}else{
		response.render('403');
	}


});

module.exports = router;