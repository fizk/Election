var express = require('express');
var router = express.Router();

/**
 * List all questions
 *
 * QUERY request to root will return all questions.
 * If -with-xml-http-request header is sent, only
 * html's li element are returned.
 *
 */
router.get('/', function(request, response) {
	//BUILD SEARCH FILTER
	//	examine request query and extract parameters
	//	from it to form the find criteria.
	var criteria = {
		hidden:false,
		$where:'this.answers.length>0'

	};
	var size = 10;
	var skip = parseInt(request.query.counter||0) * size;
	if(request.query.constituency){
		criteria.constituency = request.query.constituency
	}
	if(request.query.category){
		criteria.category = { $in:request.query.category }
	}
	if( !request.query.answers ){
		delete criteria.$where;
	}
	if(request.query.querystring && request.query.querystring != ''){
		criteria.question = { $regex: request.query.querystring, $options: 'imx' }
	}

	var range = request.get('range');
		range = (range)
			? range.split(/items:([0-9]*)-([0-9]*)/)
			: null ;

	if(range){
		skip = parseInt(range[1]);
		size = parseInt(range[2]) - parseInt(range[1]);
	}

	//COUNT
	//	count total number of items in list
	//	given the criteria.
	request.db.collection('questions').count(criteria,function(error, count){

		//SEARCH
		//	search for questions in database
		request.db.collection('questions').find(criteria).sort({created:-1}).limit(size).skip(skip).toArray(function(error,data){

			data = data || [];
			//DATA FILTERING
			//	for every question, extract answers
			//	that contain images.
			//	Also, order answers according to votes.
			data.forEach(function(item){
				item.primaries = item.answers.filter(function(answer){
					return answer.image != '';
				});
				item.primaries.sort(function(a,b){
					return a.voters < b.voters;
				});
				item.answers.sort(function(a,b){
					return a.voters < b.voters;
				});
			});

			//USER DATA
			//	if user is logged in, we can get if he/she
			//	has liked/upped/stared an answer
			//	TODO maybe I don't need this
			if( request.user ){
				data.forEach(function(item){
					item.answers.forEach(function(i){
						i.voters.indexOf
						return i.liked = ( i.voters.indexOf(request.user.id) != -1 )? true : false ;
					});
					return item.liked = ( item.voters.indexOf(request.user.id) != -1 )? true : false ;
				});
			}

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

			//XHR
			//	xmlhttprequest request, return list items
			if(request.xhr){
				response.render('./questions/partial-list',{
					questions:data,
					authenticated:request.isAuthenticated(),
					host: request.headers.host,
					user: request.user || null
				});

			//NORMAL
			//	normal http request, return full html document
			}else{
				response.render('index',{
					title:'Election',
					questions:data,
					authenticated:request.isAuthenticated(),
					host: request.headers.host,
					user: request.user || null
				});
			}
		});

	});

});



module.exports = router;