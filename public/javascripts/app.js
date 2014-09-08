


require(['modules/pagination-manager','modules/form-serialize','modules/util'], function (Pagination, serialize, util) {




	//PAGINATION MANAGER
	//	create an instance of pagination-manager
	//	he Will be responsible for adding items to the list
	var paginationManager = new Pagination();
	paginationManager.url = window.location.href;
	paginationManager.callback = util.appendQuestions;

	//HEAD
	//	since we can't read the http-headers from the initial
	//	request, we have to make a http-head request to check
	//	if this page contains more data.
	var xhr = new XMLHttpRequest();
	xhr.open('head', window.location.href);
	xhr.addEventListener('load', function (event) {
		if (event.target.status == 206) {
			paginationManager.setRangeHeader(event.target.getResponseHeader('content-range'));
			paginationManager.blocked = false;
		} else {}
	}, false);
	xhr.send();

	//DEFAULT EVENT HANDLER
	//	set event listeners on list items that were
	//	part of the original http request
	util.appendQuestions(document.querySelectorAll('.question-list > li'), false);

	//SCROLL END
	//	listen for scroll events, and if the user hits the end
	//	of the page, if that is the case and the pagination-manager is
	//	not bocked, he will go on and fetch more data
	document.addEventListener('scroll', function (event) {
		if (window.pageYOffset + window.innerHeight >= document.body.scrollHeight - 50) {
			paginationManager.next();
		}
	});


	(document.querySelector('.user-answer') || util.mockElement).addEventListener('click', function (event) {
		event.preventDefault();
		var href = event.target.href;
		var xhr = new XMLHttpRequest();
		xhr.open('get', href);
		xhr.responseType = 'document';
		xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		xhr.addEventListener('load', function (event) {
			if (event.target.status == 403) {
				document.querySelector('main.container').insertAdjacentHTML('afterbegin', event.target.responseText);
			} else {
				document.body.querySelector('.question-list').innerHTML = '';
				paginationManager.setRangeHeader(event.target.getResponseHeader('content-range'));
				paginationManager.url = href;
				util.appendQuestions(event.target.response.body.childNodes);
			}
		}, false);
		xhr.addEventListener('error', function (event) {
		}, false);
		xhr.send();
	});

	//COUNT CHAR
	//	count the number of char the user
	//	has typed for a question
	(document.getElementById('question') || util.mockElement).addEventListener('keyup', function (event) {
		document.getElementById('question-counter').innerText = '-' + (140 - event.target.value.length);
	}, false);


	var searchQuestions = function(form){
		var query = serialize(form);
		document.body.querySelector('.question-list').innerHTML = '';
		paginationManager.reset();
		paginationManager.url = form.action;
		paginationManager.params = query;
		paginationManager.next();
	};

	( document.querySelector('#filter-form select[name=constituency]')||util.mockElement ).addEventListener('change',function(event){
		searchQuestions(event.target.form);
	},false);
	//( document.querySelector('#filter-form input[name=answers]')||util.mockElement ).addEventListener('change',function(event){
	//	searchQuestions(event.target.form);
	//},false);
	var regexsearchfunction = undefined;
	( document.querySelector('#filter-form input[name=querystring]')||util.mockElement ).addEventListener('keyup',function(event){
		clearTimeout(regexsearchfunction);
		regexsearchfunction = setTimeout(function(){
			searchQuestions(event.target.form);
		},500);
	},false);
	Array.prototype.forEach.call(document.querySelectorAll('#filter-form input[type=checkbox]'),function(item){
		item.addEventListener('change',function(event){
			searchQuestions(event.target.form);
		},false);
	});

	//FILER
	//	filter the questions
	(document.getElementById('filter-form') || util.mockElement).addEventListener('change', function (event) {
		/*
		var form = event.target.form;
		var query = serialize(form);
		document.body.querySelector('.question-list').innerHTML = '';
		paginationManager.reset();
		paginationManager.url = '/';
		paginationManager.params = query;
		paginationManager.next();
		*/
	}, false);



	//FILTER
	//	filter email address of outgoing
	//	access_token
	var filterDelay = undefined;
	(document.querySelector('#email-filter-form input[type=search]') || util.mockElement).addEventListener('keyup', function (event) {
		clearTimeout(filterDelay);
		filterDelay = setTimeout(function () {
			var form = event.target.form;
			var xhr = new XMLHttpRequest();
			xhr.open('get', form.action + '?q=' + event.target.value);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.responseType = 'document';
			xhr.addEventListener('load', function (event) {
				document.querySelector('.question-list').innerHTML = '';
				util.appendQuestions(event.target.response.body.childNodes);
			}, false);
			xhr.send();
		}, 300);
	}, false);


	window.addEventListener('popstate', function (event) {
		document.body.querySelector('.question-list').innerHTML = '';
		if (event.state) {
			paginationManager.set(event.state);
			paginationManager.current();
		} else {
			paginationManager.reset();
			paginationManager.next();
		}
	}, false);

	Array.prototype.forEach.call(document.querySelectorAll('input[name=file]'), function (item) {
		item.addEventListener('click', function (event) {
			var url = item.dataset.url;
			var input = document.createElement('input');
			input.type = 'file';
			input.addEventListener('change', function (event) {
				var files = event.target.files;
				var formData = new FormData();
				formData.append('file', files[0]);
				var xhr = new XMLHttpRequest();
				xhr.open('post', url);
				xhr.addEventListener('load', function (event) {
					var object = JSON.parse(event.target.responseText);
					item.style.backgroundImage = 'url(/images/' + object.name + ')';
					item.style.backgroundSize = 'auto 60px';
					item.style.backgroundRepeat = 'no-repeat';
					item.value = object.name;
					input.parentNode.removeChild(input);
				}, false);
				xhr.send(formData);
			}, false);
			document.body.appendChild(input);
			input.click();
		}, false);
	});

	var filterDelay = undefined;
	(document.querySelector('#user-filter-form input[type=search]') || util.mockElement).addEventListener('keyup', function (event) {
		clearTimeout(filterDelay);
		filterDelay = setTimeout(function () {
			var form = event.target.form;
			var xhr = new XMLHttpRequest();
			xhr.open('get', form.action + '?q=' + event.target.value);
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			xhr.responseType = 'document';
			xhr.addEventListener('load', function (event) {
				document.querySelector('.question-list').innerHTML = '';
				util.appendQuestions(event.target.response.body.childNodes);
			}, false);
			xhr.send();
		}, 300);
	}, false);

	Array.prototype.forEach.call(document.querySelectorAll('[role=tablist]'), function (item) {
		var tabNodeList = item.querySelectorAll('[role=tab]');
		Array.prototype.forEach.call(tabNodeList, function (tab, index, collection) {
			tab.addEventListener('click', function (event) {
				event.preventDefault();
				Array.prototype.forEach.call(collection, function (t) {
					t.setAttribute('aria-selected', false);
				});
				Array.prototype.forEach.call(document.querySelectorAll('[role=tabpanel]'), function (t) {
					t.setAttribute('aria-hidden', true);
				});
				this.setAttribute('aria-selected', true);
				var id = this.getAttribute('aria-controls');
				var panel = document.querySelector('[aria-labelledby=' + id + ']');
				panel.setAttribute('aria-hidden', false);
			}, false);
		});
	});
});
