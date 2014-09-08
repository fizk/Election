var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

/**
 * Ask one question.
 * This is where the magic happens, this is where
 * all the questions come into the system from
 * users that are logged in via Facebook.
 */
router.post('/submit',function(request,response){
	//LOGGED IN
	//	if user is logged in
	if( request.isAuthenticated() ){

		if( !request.body.hasOwnProperty('constituency') || request.body.constituency == '' ){
			response.redirect('/');
			return;
		}

		request.db.collection('questions').insert({
			question:request.body.question.replace(/(<([^>]+)>)/ig,""),
			constituency: request.body.constituency,
			category: request.body.category,
			created: new Date(),
			tags:[],
			answers:[],
			user:request.user,
			voters: [],
			hidden: false
		},function(error,result){
			if( request.body.facebook ){
				var url = 'http://'+request.headers.host+'/question/' + result[0]._id.toHexString();
				request.facebook.api('me/feed', 'post', {
					//link: url, //TODO I always get an error
					message: request.body.question + ' ' + url
				}, function (res) {
					if(!res || res.error) {
						console.log(!res ? 'error occurred' : res.error);
						return;
					}
					//SAVE COMMENT ID
					//	save the comment ID
					//result[0].comment_id = res.id;
					//request.db.collection('questions').save(result[0],function(){});
					//console.log('Post Id: ' + res.id);
				});
			}
			response.redirect('/');
		});
	//NOT LOGGED IN
	//	user is not logged in.
	}else{
		response.redirect('/pages/login');
	}

});

/**
 * Get a page with a form to answer a question.
 */
router.get('/answer/:id',function(request,response){

	//LOGGED IN
	//	user is logged in
	if( request.isAuthenticated() ){
		var id = new mongo.ObjectID.createFromHexString(request.param('id'));


		request.db.collection('users').find({party:request.user.party,constituency:request.user.constituency}).toArray(function(error,data){
			var respondents = data;
			request.db.collection('questions').findOne({_id:id},function(e,document){

				//USER CAN ANSWER
				//	user can answer questions in this constituency
				if( request.user.constituency && ( request.user.constituency == document.constituency )){
					if( request.xhr ){
						response.render('questions/answer-form',{
							answer: document,
							respondents: respondents
						});
					}else{
						response.render('questions/answer',{
							answer: document,
							respondents: respondents
						});
					}
				//USER CAN'T ANSWER
				//	user can't answer this question
				}else{
					if( request.xhr ){
						response.render('questions/answer-form-denied-form',{
							answer: document,
							respondents: respondents
						});
					}else{
						response.render('questions/answer-form-denied',{
							answer: document,
							respondents: respondents
						});
					}
				}
			});
		});
	//NOT LOGGED IN
	//	user is not logged in
	}else{
		response.redirect('/pages/login');
	}

});

/**
 * Submit an answer to a question.
 */
router.post('/answer/:id',function(request,response){

	//LOGGED IN
	//	user is logged in
	if( request.isAuthenticated() ){

		var id = new mongo.ObjectID.createFromHexString(request.param('id'));
		var questionsGateway = request.db.collection('questions');
		var usersGateway = request.db.collection('users');

		//FIND
		//	find this one question
		questionsGateway.findOne({_id:id},function(e,document){
			//FIND RESPONDENT
			//	find profile for user who is responding to this question
			usersGateway.findOne({id:request.body.respondent},function(error,data){
				var youtubegexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
				//ADD
				//	add answer to the question's answers array
				document.answers.push({
					body: request.body.answer.replace(/(<([^>]+)>)/ig,""),
					created: new Date(),
					respondent: data,
					real_respondent: request.user,
					id : parseInt(Math.random()*100),
					voters: [],
					image: request.body.file.replace(/(<([^>]+)>)/ig,""),
					video:[],
					youtube: (request.body.youtube && request.body.youtube != '')?request.body.youtube.match(youtubegexp)[1]:null
				});

				/*
				 if( document.comment_id ){
				 request.facebook.api(document.comment_id+'/comments','post',{
				 message: request.body.answer
				 },function(){
				 console.log(arguments);
				 });
				 }
				 */

				//FIND QUESTION OWNER
				//	find the person who asked the question and if he/she wants
				//	send an email
				usersGateway.findOne({id:document.user.id},function(error,user){
					if(user.emails && user.emails.length>0){
						//EMAIL
						//	we have an email address and we are going to send out
						//	a response
						response.render('./questions/answer-email',{
							question:document,
							link: 'http://' + request.headers.host + '/question/' + document._id.toHexString(),
							images: 'http://' + request.headers.host + '/images/'
						},function(error,html){
							request.transport.sendMail({
								from: "mbl ✔ <mbl@mbl.is>", // sender address
								to: user.emails[0].value, // list of receivers
								subject: "Spurningu þinni hefur verið svarað", // Subject line
								html: html
							},function(error){
								console.log(arguments);
							});
						});
						
					}
				});

				//SAVE
				//	save the augmented document back to storage
				questionsGateway.save(document,function(){
					/*
					 process.exec('ls -al',function(error, stdout, stderr){
					 var hundur = undefined;
					 console.log(hundur);
					 });
					 */


					if( request.xhr ){
						response.render('./questions/partial-list',{
							questions:[document],
							answer: true,
							partial: true
						});
					}else{
						response.redirect('/user/answer');
					}

				});


			});

		});
	//NOT LOGGED IN
	//	user is not logged in
	}else{
		response.redirect('/pages/login');
	}

});

/**
 * Vote on a question's answer.
 */
router.get('/vote/:id/:index',function(request, response){
	//LOGGED IN
	//	user is logged in
	if( request.isAuthenticated()){
		var id = new mongo.ObjectID.createFromHexString(request.param('id'));
		var collection = request.db.collection('questions');
		collection.findOne({_id:id},function(error,document){
			var index = -1;
			var liked = false;
			for(var i=0;i<document.answers.length;i++){
				if( document.answers[i].id == request.param('index') ){
					index = i;
				}
			}
			if( index != -1 ){
				var x = document.answers[index].voters.indexOf(request.user.id);
				if(x == -1){
					document.answers[index].voters.push(request.user.id);
					liked = true;
				}else{
					document.answers[index].voters.splice(x,1);
					liked = false;
				}
				collection.save(document,function(){});
			}

			//setTimeout(function(){
				response.json({
					liked : liked,
					count : document.answers[index].voters.length
				});
			//},2000);

		});

	//NOT LOGGED IN
	//	user is not logged in
	}else{
		response.redirect('/auth/login');
	}

});

/**
 * Vote on one question up/down
 *
 * If user is not logged in, he is redirected to login form.
 * If user has voted on this question he/she votes down else up
 * Response is in JSON format
 */
router.get('/vote/:id',function(request, response){

	//LOGGED IN
	//	user is logged in
	if( request.isAuthenticated() ){
		var id = new mongo.ObjectID.createFromHexString(request.param('id'));
		if( request.xhr ){
			request.db.collection('questions').findOne({_id:id},function(e,document){

				var liked = false;
				var voteIndex = document.voters.indexOf(request.user.id);
				if( voteIndex == -1 ){
					document.voters.push(request.user.id);
					liked = true;
				}else{
					document.voters.splice(voteIndex,1);
					liked = false;
				}
				request.db.collection('questions').save(document,function(error,doc){
					response.json( {
						liked : liked,
						count : document.voters.length
					} );

				});

			});
		}else{
			response.send('Hey, not an ajax request?');
		}
	//NOT LOGGED IN
	//	user is not logged in
	}else{
		response.redirect('/auth/login');
	}

});

/**
 * Delete a whole questions and everything
 * that goes with it.
 */
router.get('/delete/:id',function(request, response){
	var id = new mongo.ObjectID.createFromHexString(request.param('id'));
	request.db.collection('questions').remove({_id:id},function(error,document){
		response.redirect('/admin/list');
	});
});


/**
 * Delete a whole questions and everything
 * that goes with it.
 */
router.get('/hide/:id',function(request, response){
	var id = new mongo.ObjectID.createFromHexString(request.param('id'));
	var collection = request.db.collection('questions');
	collection.findOne({_id:id},function(error,document){
		if( document.hidden ){
			document.hidden = false;
		}else{
			document.hidden = true;
		}
		collection.save(document,function(error,doc){

		});

		response.json({
			hidden:document.hidden
		});

	});
});

/**
 * Delete one answer from a question
 */
router.get('/delete/:id/:index',function(request, response){
	var id = new mongo.ObjectID.createFromHexString(request.param('id'));
	var collection = request.db.collection('questions');
	collection.findOne({_id:id},function(error,document){
		var index = -1;
		for(var i=0;i<document.answers.length;i++){
			if(document.answers[i].id == request.param('index')){
				index = i;
				break;
			}
		}
		if(index >= 0){
			document.answers.splice(index,1);
			collection.save(document,function(error,result){
				response.redirect('/admin/list');
				response.json({
					success:true
				});
			});
		}else{
			response.json({
				success:false
			});
		}

	});

});

/**
 * Get a single question.
 * This is mostly for social media to have something to link to
 */
router.get('/:id',function(request, response){
	var collection = request.db.collection('questions');
	var id = new mongo.ObjectID.createFromHexString(request.param('id'));
	collection.findOne({_id:id},function(error,document){
		if(document && !document.hidden ){
			response.render('questions/index',{
				question:document,
				host: 'http://'+request.headers.host,
				user:request.user || undefined,
				answer: false,
				manage: false
			});
		}else{
			response.status(404).render('error',{error:{status:404}});
		}

	});
});


module.exports = router;
