var express = require('express');
var router = express.Router();

var fs = require('fs');

router.post('/image',function(request, response){
	response.json(request.files.file);
	/*
	console.log(request);
	fs.readFile(request.files.displayImage.path, function (err, data) {
		// ...
		var newPath = __dirname + "/../public/images/uploadedFileName.jpg";
		fs.writeFile(newPath, data, function (err) {
			//res.redirect("back");
			request.json([err,request.files]);
		});
	});
	*/
});

module.exports = router;