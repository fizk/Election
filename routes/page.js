/**
 * Created by einarvalur on 08/05/14.
 */

var express = require('express');
var router = express.Router();

router.get('/tutorial',function(request, response){
	response.render('./page/tutorial');

});

router.get('/login',function(request, response){
	response.render('./page/login');

});


module.exports = router;