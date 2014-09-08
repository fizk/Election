;(function(){


	var ScrollerManager = function(){};
		ScrollerManager.prototype.size = 10;
		ScrollerManager.prototype.from = 0;
		ScrollerManager.prototype.to = 0;
		ScrollerManager.prototype.total = 0;
		ScrollerManager.prototype.blocked = false;
		ScrollerManager.prototype.end = false;
		ScrollerManager.prototype.url = '/';
		ScrollerManager.prototype.xhr = new XMLHttpRequest();
		ScrollerManager.prototype.callback = function(){};
		ScrollerManager.prototype.next = function(){
			if( !this.blocked && !this.end ){
				this.blocked = true;
				this.xhr.open('get','/');
				this.xhr.setRequestHeader('Range','items:'+this.to+'-'+(this.to+this.size) );
				this.xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				this.xhr.addEventListener('load',function(event){
					var range = event.target.getResponseHeader('content-range').split(/([0-9]*)-([0-9]*)\/([0-9]*)/);
					this.from = parseInt(range[1]);
					this.to = parseInt(range[2]);
					this.total = parseInt(range[3]);
					this.callback.call(this,event.target.responseText);
					if( this.total == this.to ){ this.end = true }
					this.blocked = false;
				}.bind(this),false);
				this.xhr.addEventListener('error',function(){},false);
				this.xhr.addEventListener('abort',function(){},false);
				this.xhr.send();
			}
	};


	var manager = new ScrollerManager();
		manager.callback = function(data){
			document.body.querySelector('.question-list').insertAdjacentHTML( 'beforeend', data );
		}
		manager.next();
	document.addEventListener('scroll',function(event){
		if(document.body.scrollHeight - (window.innerHeight+window.scrollY) < 0){
			manager.next();
		}
	});







	function serialize (form) {
		if (!form || form.nodeName !== "FORM") {
			return;
		}
		var i, j, q = [];
		for (i = form.elements.length - 1; i >= 0; i = i - 1) {
			if (form.elements[i].name === "") {
				continue;
			}
			switch (form.elements[i].nodeName) {
				case 'INPUT':
					switch (form.elements[i].type) {
						case 'text':
						case 'hidden':
						case 'password':
						case 'button':
						case 'reset':
						case 'submit':
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							break;
						case 'checkbox':
						case 'radio':
							if (form.elements[i].checked) {
								q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							}
							break;
					}
					break;
				case 'file':
					break;
				case 'TEXTAREA':
					q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
					break;
				case 'SELECT':
					switch (form.elements[i].type) {
						case 'select-one':
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							break;
						case 'select-multiple':
							for (j = form.elements[i].options.length - 1; j >= 0; j = j - 1) {
								if (form.elements[i].options[j].selected) {
									q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].options[j].value));
								}
							}
							break;
					}
					break;
				case 'BUTTON':
					switch (form.elements[i].type) {
						case 'reset':
						case 'submit':
						case 'button':
							q.push(form.elements[i].name + "=" + encodeURIComponent(form.elements[i].value));
							break;
					}
					break;
			}
		}
		return q.join("&");
	}

	/*
	window.addEventListener("popstate", function(e) {

	});
	*/

	//GLOBALS
	//	global variables for pagination
	var counter = 1;
	var end = false;

	var queryQuestionList = function( form, callback ){
		var counter = arguments[2] || 0;
		var xhr = new XMLHttpRequest();
		var url = form.action+'?'+serialize(form) + '&counter='+counter;
		xhr.open(form.method,url);
		xhr.setRequestHeader("X-Requested-With","XMLHttpRequest");
		xhr.addEventListener('load',function(event){
			var range = event.target.getResponseHeader('range');
			var split = range.split(/([0-9]*)-([0-9]*)\/([0-9]*)/);
			callback(event.target.responseText,{from:split[1],to:split[2],total:split[3]});
			/*
			history.pushState({
				url: url,
				counter: counter
			},'',url);
			)*/
		},false);
		xhr.send( new FormData(form) );
	};

	/**
	 * Toggler filter tab.
	 */
	document.addEventListener('DOMContentLoaded',function(){
		document.getElementById('filter-toggler').addEventListener('click',function(event){
			event.preventDefault();
			document.body.querySelector('#index-filter-container').classList.toggle('display');
		},false);

	},false);

	/**
	 * Pagination
	 */
	/*
	document.addEventListener('DOMContentLoaded',function(){
		var paused = false;
		document.addEventListener('scroll',function(event){

			if(!end && !paused){
				if(document.body.scrollHeight - (window.innerHeight+window.scrollY) < 0){
					paused = true;
					queryQuestionList( document.getElementById('filter-form'),function(data,range){
						if(range.to == range.total){
							end = true;
						}else{
							counter++;
						}
						document.body.querySelector('.question-list').insertAdjacentHTML( 'beforeend', data );
						paused = false;
					},counter );
				}
			}

		},false);

	},false);
	 */

	/**
	 * Upload file
	 */
	document.addEventListener('DOMContentLoaded',function(){
		var uploadField = document.body.querySelector('input[type=file]') || document.createElement('input');
		uploadField.addEventListener('change',function(event){
			var formData = new FormData();
				formData.append('media',event.target.files[0]);
			var xhr = new XMLHttpRequest();
				xhr.open('post','/media/image',true);
				xhr.addEventListener('load',function(event){

				},false);
				xhr.send(formData);
		},false);
	},false);

	/**
	 * Request new question list.
	 * Make request to server with parameters from the filter
	 * form.
	 */
	document.addEventListener('DOMContentLoaded',function(){
		document.getElementById('filter-form').addEventListener('change',function(event){
			counter = 1;
			end = false;
			var form = event.target.form;
			queryQuestionList(form,function(data){
				document.body.querySelector('.question-list').innerHTML = data;
			});
		},false);
	},false);


})();