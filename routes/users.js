var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var config = require('../config')

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

/**
 * Get a list of questions that a user can answer.
 * It goes without saying that the user has to be
 * logged in and he/she has to have a valid access_token.
 */
router.get('/answer',function( request, response ){
	//LOGGED IN
	//	user is logged in and has a valid access_token
	if( request.isAuthenticated() && (request.user.party && request.user.constituency) ){
		var range = request.get('range');
		range = (range)
			? range.split(/items:([0-9]*)-([0-9]*)/)
			: null ;
		var skip = 0;
		var size = 10;

		if(range){
			skip = parseInt(range[1]);
			//size = parseInt(range[2]) - parseInt(range[1]);
		}

		var criteria = {
			constituency:request.user.constituency,
			hidden:false
		};
		var collection = request.db.collection('questions');
		collection.count(criteria,function(error,count){
			collection.find(criteria).sort({created:-1}).limit(size).skip(skip).toArray(function(error,data){
				response.status(206);
				response.set({
					'Status': 206,
					'Range-Unit': 'items',
					'Content-Range': (skip)+('-')+(skip+data.length)+('/'+count)
				});
				if(request.xhr){
					response.render('./questions/partial-list',{
						questions:data,
						answer: true
					});
				}else{
					response.render('user/answer',{
						questions:data,
						answer: true
					});
				}
			});
		});

	//NOT LOGGED IN
	//	user is not logged in and has no business being here
	}else{
		response.status(403);
		response.render('./403');
	}
});

/**
 * Get form to submit access_code.
 */
router.get('/code',function(request, response){
	if( request.isAuthenticated() ){
		response.render('./user/code',{
			error: false
		});
	}else{
		response.send('not logged in');
	}
});

/**
 * User is submitting access_code.
 * If it's valid, the user profile will be updated
 * and the user redirected to the 'answer questions'
 * section.
 *
 */
router.post('/code',function(request, response){
	if( request.isAuthenticated() ){
		//SPLIT
		//	split the code into three chunks
		var codeArray = request.body.code.split('|');
		//THREE CHUNKS
		//	make sure that the chunks are exactly three
		if( codeArray.length != 3 ){
			response.render('./user/code',{
				error : true
			});
		}

		//VALIDATE CODE
		//	make sure that the code is valid.
		if( crypto.createHash('sha1').update(codeArray[0] + codeArray[1] + config.development.salt).digest('hex') != codeArray[2]){
			response.render('./user/code',{
				error : true
			});
		}

		//PARTY
		//	find party based on the hash
		var partyObject = undefined;
		for(var i=0;i<config.development.parties.length;i++){
			if( config.development.parties[i].hash == codeArray[1] ){
				partyObject = config.development.parties[i];
				break;
			}
		}

		//CONSTITUENCY
		//	find constituency based on hash
		var constituencyObject = undefined;
		for(var x=0;x<config.development.constituency.length;x++){
			for(var y=0;y<config.development.constituency[x].areas.length;y++){
				if( config.development.constituency[x].areas[y].hash == codeArray[0] ){
					constituencyObject = config.development.constituency[x].areas[y];
					break;
				}
			}
		}

		//VALIDATE CODE NO MAP
		//	the access_code doesn't map to anything.
		if( !partyObject || !constituencyObject ){
			response.render('./user/code',{
				error : true
			});
		}

		//UPDATE USER
		//
		var collection = request.db.collection('users');
		collection.findOne({id:request.user.id},function(error,document){
			document.constituency = constituencyObject.name;
			document.party = partyObject.name;
			document.partyObject = partyObject;
			collection.save(document,function(error,doc){
				response.redirect('/user/answer');
			});
		});

	}else{
		response.send('not logged in');
	}
});

/**
 * When access_token is generated, an email is sent to
 * potential user with an URL attached to it. This route
 * will serve this URL.
 */
router.get('/code/:code',function(request, response){
	if( request.isAuthenticated() ){
		//SPLIT
		//	split the code into three chunks
		var codeArray = request.param('code').split('|');
		//THREE CHUNKS
		//	make sure that the chunks are exactly three
		if( codeArray.length != 3 ){
			response.render('./user/code',{
				error : true
			});
		}

		//VALIDATE CODE
		//	make sure that the code is valid.
		if( crypto.createHash('sha1').update(codeArray[0] + codeArray[1] + config.development.salt).digest('hex') != codeArray[2]){
			response.render('./user/code',{
				error : true
			});
		}

		//PARTY
		//	find party based on the hash
		var partyObject = undefined;
		for(var i=0;i<config.development.parties.length;i++){
			if( config.development.parties[i].hash == codeArray[1] ){
				partyObject = config.development.parties[i];
				break;
			}
		}

		//CONSTITUENCY
		//	find constituency based on hash
		var constituencyObject = undefined;
		for(var x=0;x<config.development.constituency.length;x++){
			for(var y=0;y<config.development.constituency[x].areas.length;y++){
				if( config.development.constituency[x].areas[y].hash == codeArray[0] ){
					constituencyObject = config.development.constituency[x].areas[y];
					break;
				}
			}
		}

		//VALIDATE CODE NO MAP
		//	the access_code doesn't map to anything.
		if( !partyObject || !constituencyObject ){
			response.render('./user/code',{
				error : true
			});
		}

		//UPDATE USER
		//
		var collection = request.db.collection('users');
		collection.findOne({id:request.user.id},function(error,document){
			document.constituency = constituencyObject.name;
			document.party = partyObject.name;
			document.partyObject = partyObject;
			collection.save(document,function(error,doc){
				response.redirect('/pages/tutorial');
			});
		});

	}else{
		response.send('not logged in');
	}
});

module.exports = router;
