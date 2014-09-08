define(['../../vendor/masonry/dist/masonry.pkgd'],function( Masonry ){


    //LIST
    //  main questions/blehh list
    //  or a mock object if no list
    var questionList = document.querySelector('.question-list') || document.createElement('div');

	var masonary = new Masonry( questionList,{
		isAnimatedFromBottom: true,
		columnWidth: 'li'
	} );

	var util = {
		/**
		 * Returns an object that has a addEventListener() function.
		 * This is to mock then x.getElementById() or x.querySelector()
		 * can't find any elements, but we still want to apply event listener
		 * @return {object}
		 */
		mockElement: {
			addEventListener: function(type){}
		},

		/**
		 * Add all event handlers and listener to all interactive
		 * elements for a question structure
		 * @param {HTMLElement} element
		 * @returns {HTMLElement}
		 */
		applyArticleHandler: function( element ){
			//ANSWERS LIST:
			//	toggle answers
			(element.querySelector('.question-answer')||this.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				event.target.parentNode.parentNode.classList.toggle('active');
				if( event.target.parentNode.parentNode.classList.contains('glow') ){
					setTimeout(function(){
						event.target.parentNode.parentNode.classList.remove('glow');
					},2000);
				}else{
					event.target.parentNode.parentNode.classList.add('glow');
				}

				event.target.parentNode.parentNode.parentNode.classList.toggle('double');
				masonary.on('layoutComplete',function(){
					var containerPosition = (function(obj) {
						var position = { x:0, y:0 };
						if (obj.offsetParent) {
							do {
								position.x += obj.offsetLeft;
								position.y += obj.offsetTop;
							} while (obj = obj.offsetParent);
							return position;
						}
					})(masonary.element);

					(function(endY, duration) {
						endY = endY || 0;
						duration = duration || 200;

						var startY = document.body.scrollTop,
							startT  = +(new Date()),
							finishT = startT + duration;

						var interpolate = function (source, target, shift) {
							return (source + (target - source) * shift);
						};

						var easing = function (pos) {
							return (-Math.cos(pos * Math.PI) / 2) + .5;
						};

						var animate = function() {
							var now = +(new Date()),
								shift = (now > finishT) ? 1 : (now - startT) / duration;

							window.scrollTo(0, interpolate(startY, endY, easing(shift)));

							(now > finishT) || setTimeout(animate, 15);
						};

						animate();
					})(parseInt(element.style.top)+containerPosition.y,500);

					return true;
				});
				masonary.layout();
			},false);

			//SHARE:
			//	toggle social-media panel
			(element.querySelector('.question-share')||this.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				event.target.parentNode.parentNode.classList.toggle('share');
			},false);

			//VOTE QUESTION
			//	vote on question or answer
			Array.prototype.forEach.call(element.querySelectorAll('.question-vote'),function(item){
				item.addEventListener('click',function(event){
					event.preventDefault();
					item.classList.add('spin');
					var xhr = new XMLHttpRequest();
					xhr.open('get',event.target.href);
					xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
					xhr.addEventListener('load',function(event){
						item.classList.remove('spin');
						var obj = JSON.parse(event.target.responseText);
						if(obj.liked){
							item.innerText = (obj.count);
						}else{
							item.innerText = (obj.count);
						}
					},false);
					xhr.addEventListener('error',function(event){},false);
					xhr.send();
				},false);
			});

			//PREVIOUS
			//	get previous answer
			(element.querySelector('.question-answer-previous')||this.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				var list = element.querySelector('.question-answer-list');
				var position = parseInt(list.dataset.position);
				if( position == 0 ){

				}else{
					var p = parseInt(list.dataset.position||0)-1;
					list.dataset.position = p;
					element.querySelector('.counter').innerHTML = (p+1);
					list.style.marginLeft =  -(p*100) + '%';
				}
			},false);

			//NEXT
			//	get next answer
			(element.querySelector('.question-answer-next')||this.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				var list = element.querySelector('.question-answer-list');
				var position = parseInt(list.dataset.position);
				if( position == (parseInt( list.dataset.size||0  )-1) ){

				}else{
					var p = parseInt(list.dataset.position||0)+1;
					list.dataset.position = p;
					element.querySelector('.counter').innerHTML = (p+1);
					list.style.marginLeft =  -(p*100) + '%';
				}
			},false);

			//ANSWER:
			//	get answer form
			(element.querySelector('.question-manage')||this.mockElement).addEventListener('click',function(event){
				event.preventDefault();

				var container = element.getElementsByTagName('article')[0];
				var item = event.target;

				if( container.contains('glow') ){
					setTimeout(function(){
						container.classList.remove('glow');
					},2000);
				}else{
					container.classList.add('glow');
				}
				element.querySelector('section').style.height = '600px';
				element.classList.add('double');
				container.classList.remove('active');
				masonary.on('layoutComplete',function(){
					var containerPosition = (function(obj) {
						var position = { x:0, y:0 };
						if (obj.offsetParent) {
							do {
								position.x += obj.offsetLeft;
								position.y += obj.offsetTop;
							} while (obj = obj.offsetParent);
							return position;
						}
					})(masonary.element);
					(function(endY, duration) {
						endY = endY || 0;
						duration = duration || 200;

						var startY = document.body.scrollTop,
							startT  = +(new Date()),
							finishT = startT + duration;

						var interpolate = function (source, target, shift) {
							return (source + (target - source) * shift);
						};

						var easing = function (pos) {
							return (-Math.cos(pos * Math.PI) / 2) + .5;
						};

						var animate = function() {
							var now = +(new Date()),
								shift = (now > finishT) ? 1 : (now - startT) / duration;

							window.scrollTo(0, interpolate(startY, endY, easing(shift)));

							(now > finishT) || setTimeout(animate, 15);
						};

						animate();
					})(parseInt(element.style.top)+containerPosition.y,500);
					return true;
				});
				masonary.layout();


				item.classList.add('spin');
				event.preventDefault();
				var xhr = new XMLHttpRequest();
				xhr.open('get',item.href);
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.addEventListener('error',function(event){},false);
				xhr.addEventListener('load',function(event){
					item.classList.remove('spin');
					container.insertAdjacentHTML('beforeend',event.target.responseText);

					var form = container.querySelector('[role=form]');
					form.addEventListener('submit',function(event){
						event.target.querySelector('.icon-ok').classList.add('spin');
						event.preventDefault();
						var xhr = new XMLHttpRequest();
						xhr.open('post',form.action);
						xhr.responseType = 'document';
						xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
						xhr.addEventListener('load',function(event){
							var newElement = event.target.response.body.firstElementChild;
							element.replaceChild(newElement.firstElementChild,element.firstElementChild);
							util.applyArticleHandler(element);
							element.classList.remove('double');
							masonary.on('layoutComplete',function(){
								var containerPosition = (function(obj) {
									var position = { x:0, y:0 };
									if (obj.offsetParent) {
										do {
											position.x += obj.offsetLeft;
											position.y += obj.offsetTop;
										} while (obj = obj.offsetParent);
										return position;
									}
								})(masonary.element);

								window.scrollTo(0,parseInt(element.style.top)+containerPosition.y); //TODO animate
								return true;
							});
							masonary.layout();


						},false);
						xhr.send( new FormData(form) )
					},false);

					var cancel = container.querySelector('.cancel').addEventListener('click',function(event){
						event.preventDefault();
						form.parentNode.removeChild(form);
						element.querySelector('section').style.height = 'auto';
						element.classList.remove('double');
						setTimeout(function(){
							container.classList.remove('glow');
						},2000);
						masonary.on('layoutComplete',function(){
							var containerPosition = (function(obj) {
								var position = { x:0, y:0 };
								if (obj.offsetParent) {
									do {
										position.x += obj.offsetLeft;
										position.y += obj.offsetTop;
									} while (obj = obj.offsetParent);
									return position;
								}
							})(masonary.element);
							(function(endY, duration) {
								endY = endY || 0;
								duration = duration || 200;

								var startY = document.body.scrollTop,
									startT  = +(new Date()),
									finishT = startT + duration;

								var interpolate = function (source, target, shift) {
									return (source + (target - source) * shift);
								};

								var easing = function (pos) {
									return (-Math.cos(pos * Math.PI) / 2) + .5;
								};

								var animate = function() {
									var now = +(new Date()),
										shift = (now > finishT) ? 1 : (now - startT) / duration;

									window.scrollTo(0, interpolate(startY, endY, easing(shift)));

									(now > finishT) || setTimeout(animate, 15);
								};

								animate();
							})(parseInt(element.style.top)+containerPosition.y,500);
							return true;
						});
						masonary.layout();
					},false);

					var media = container.querySelector('input[name=file]');
					media.addEventListener('click',function(event){
						event.preventDefault();
						var url = media.dataset.url;
						var input = document.createElement('input');
						input.type = 'file';
						input.addEventListener('change',function(event){
							var files = event.target.files;
							var formData = new FormData();
							formData.append("file", files[0]);
							var xhr = new XMLHttpRequest();
							xhr.open('post',url);
							media.classList.remove('done');
							xhr.upload.addEventListener("progress", function(event){
								var status = (event.loaded / event.total * 100 );
								media.style.backgroundImage = 'linear-gradient(90deg, ' +
									'rgba(215,225,235,1) 0%, rgba(215,225,235,1) '+status+'%, ' +
									'rgba(255,255,255,1) 0%, rgba(255,255,255,1) 100%)';
							}, false);
							xhr.addEventListener('load',function(event){
								media.classList.add('done');
								var object = JSON.parse( event.target.responseText );
								media.style.backgroundImage = 'url(/images/'+object.name+')';
								media.style.backgroundSize = 'auto 60px';
								media.style.backgroundRepeat = 'no-repeat';
								media.value = object.name;
								input.parentNode.removeChild(input);
							},false);
							xhr.send(formData);
						},false);
						document.body.appendChild(input);
						input.click();
					},false);

				},false);
				xhr.send();

			},false);

			//SWIPE
			//	swipe answers
			(function(item){
				var currentPosition = undefined;
				var x = 0;
				var y = 0;
				item.addEventListener("touchstart", function(event){
					currentPosition = parseInt(item.style.marginLeft||0);
					x = event.touches[0].clientX;
					y = event.touches[0].clientY;
				}, false);
				item.addEventListener("touchend", function(event){
					var position = parseInt(item.dataset.position||0);
					var container = item.parentNode.parentNode;
					if( ( x - event.changedTouches[0].clientX ) > 30  ){ //NEXT
						if( position != (parseInt( item.dataset.size||0  )-1) ){
							var p = parseInt(item.dataset.position||0)+1;
							item.dataset.position = p;
							container.querySelector('.counter').innerHTML = (p+1);
							item.style.marginLeft =  -(p*100) + '%';
						}

					}else if( ( x - event.changedTouches[0].clientX ) < -30  ){ //PREVIOUS
						if( position != 0 ){
							var p = parseInt(item.dataset.position||0)-1;
							item.dataset.position = p;
							container.querySelector('.counter').innerHTML = (p+1);
							item.style.marginLeft =  -(p*100) + '%';
						}

					}
				}, false);
				item.addEventListener("touchcancel", function(event){

				}, false);
				item.addEventListener("touchleave", function(event){

				}, false);
				item.addEventListener("touchmove", function(event){


				}, false);

			})( element.querySelector('.question-answer-list')||this.mockElement );

			//DELETE QUESTION
			//	delete one question
			(element.querySelector('.question-delete')||util.mockElement ).addEventListener('click',function(event){
				event.preventDefault();
				event.target.classList.add('spin');
				var xhr = new XMLHttpRequest();
				xhr.open('get',event.target.href);
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.addEventListener('load',function(event){
					masonary.remove(element);
					masonary.layout();
					//element.parentNode.removeChild(element);
				},false);
				xhr.send();
			},false);

			//HIDE QUESTION
			//	delete one question
			(element.querySelector('.question-hide')||util.mockElement ).addEventListener('click',function(event){
				event.preventDefault();
				event.target.classList.add('spin');
				var xhr = new XMLHttpRequest();
				xhr.open('get',event.target.href);
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.addEventListener('load',function(event){
					this.classList.remove('spin');
					var obj = JSON.parse( event.target.responseText );
					if( obj.hidden ){
						element.getElementsByTagName('article')[0].classList.add('hidden-question');
					}else{
						element.getElementsByTagName('article')[0].classList.remove('hidden-question');
					}
				}.bind(event.target),false);
				xhr.send();
			},false);

            //DELETE ANSWER
            //  delete one answer from one question
            Array.prototype.forEach.call(element.querySelectorAll('.answer-delete'),function(item){

                item.addEventListener('click',function(event){
                    event.preventDefault();
                    event.target.classList.add('spin');
                    var xhr = new XMLHttpRequest();
                    xhr.open('get',event.target.href);
                    xhr.addEventListener('load',function(event){
                        this.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode);

                        var listContainer = element.querySelector('.question-answer-list');
                        var answersList = element.querySelectorAll('.question-answer-list > li');

                        listContainer.setAttribute('data-position','0');
                        listContainer.setAttribute('data-size',answersList.length);
                        listContainer.style.width = (answersList.length*100)+'%';
                        listContainer.style.marginLeft = 0;
                        Array.prototype.forEach.call(answersList,function(item,index,collection){
                            item.style.width = (100/collection.length)+'%';
                        });

                        element.querySelector('em.counter').innerText = 1;//answersList.length;
                        element.querySelector('em.total').innerText = answersList.length;
                        element.querySelector('.question-answer').innerText = answersList.length;

                    }.bind(event.target),false);
                    xhr.send();
                },false);
            });

			//DELETE USER
			//	delete user
			(element.querySelector('.user-delete')||util.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				event.target.classList.add('spin');
				var xhr = new XMLHttpRequest();
				xhr.open('get',event.target.href);
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.addEventListener('load',function(event){
					element.parentNode.removeChild(element);
					masonary.remove(element);
					masonary.layout();
				},false);
				xhr.send();
			},false);

			//ADMIN
			//	promote or demote user
			(element.querySelector('.user-admin')||util.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				event.target.classList.add('spin');
				var xhr = new XMLHttpRequest();
				xhr.open('get',event.target.href);
				xhr.addEventListener('load',function(event){
					var object = JSON.parse( event.target.responseText );
					this.classList.remove('spin');
					if( object.admin ){ //TODO
						this.innerText = 'afskrá sem admin';
					}else{
						this.innerText = 'gera að admin';
					}
				}.bind(event.target),false);
				xhr.send();
			},false);

			//FACEBOOK
			//	share on facebook
			(element.querySelector('.icon-facebook')||util.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				window.open(event.target.href,'Share','height=360,width=670');
			},false);

			//TWITTER
			//	share on twitter
			(element.querySelector('.icon-twitter')||util.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				window.open(event.target.href,'Share','height=360,width=670');
			},false);

			//GOOGLE+
			//	share on google plus
			(element.querySelector('.icon-gplus')||util.mockElement).addEventListener('click',function(event){
				event.preventDefault();
				window.open(event.target.href,'Share','height=360,width=670');
			},false);

			return element;
		},

		/**
		 * Loop through a list of LI elements that each contain
		 * an article/question element.
		 *
		 * This function will go on and add event handlers to control elements
		 * in the question markup.
		 *
		 * If the second parameter is set to {bool} false, then this function
		 * will not append the LI element to the list but still add the event
		 * listeners. This is 'cause we want to run this function on a document
		 * that already have the LI elements but they don't have handlers.
		 *
		 * @param  {NodeList} nodeList
		 * @param {bool} optional
		 */
		appendQuestions: function(nodeList){
			var append = arguments[1] || true;
			var i = 0;
			var current = nodeList.item(0);
			while( current ){
				if(current.nodeType == 1){
					current.style.float = 'left';
					if( append ){
						document.body.querySelector('.question-list').appendChild(
							util.applyArticleHandler( current )
						);
					}else{
						util.applyArticleHandler( current );
					}

					if( current.style.position != 'absolute' ){
						masonary.addItems(current);
					}
				}
				current = nodeList.item(++i);
			}

			masonary.layout();
		}
	};

	return util;

});