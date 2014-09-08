define([],function(){
	var PaginationManager = function(){};
		PaginationManager.prototype.size = 10;
		PaginationManager.prototype.from = 0;
		PaginationManager.prototype.to = 0;
		PaginationManager.prototype.total = 0;
		PaginationManager.prototype.blocked = false;
		PaginationManager.prototype.end = false;
		PaginationManager.prototype.url = '/';
		PaginationManager.prototype.params = undefined;
		PaginationManager.prototype.callback = function(){};
		PaginationManager.prototype.get = function(){
			return {
				size: this.size,
				from : this.from,
				to: this.to,
				total: this.total,
				blocked: this.blocked,
				end: this.end,
				url: this.url,
				params: this.params
			};
		};
		PaginationManager.prototype.set = function(obj){
			this.size = 	obj.size;
			this.from = 	obj.from;
			this.to= 		obj.to;
			this.total= 	obj.total;
			this.blocked= 	false;
			this.end= 		false;
			this.url= 		obj.url;
			this.params= 	obj.params;
		};
		PaginationManager.prototype.reset = function(){
			this.size = 	10;
			this.from = 	0;
			this.to= 		0;
			this.total= 	0;
			this.blocked= 	false;
			this.end= 		false;
			this.url= 		'/';
			this.params= 	undefined;
		};
		PaginationManager.prototype.next = function(){
			if( !this.blocked && !this.end ){
				var xhr = new XMLHttpRequest();
				this.blocked = true;
				if(this.params){
					xhr.open('get',this.url + '?' + this.params);
				}else{
					xhr.open('get',this.url);
				}
				xhr.setRequestHeader('Range','items:'+this.to+'-'+(this.to+this.size) );
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.responseType = 'document';
				xhr.addEventListener('load',function(event){
					var range = event.target.getResponseHeader('content-range').split(/([0-9]*)-([0-9]*)\/([0-9]*)/);
					this.from = parseInt(range[1]);
					this.to = parseInt(range[2]);
					this.total = parseInt(range[3]);
					this.callback.call(this,event.target.response.body.childNodes);
					if( this.total == this.to ){ this.end = true }
					this.blocked = false;
				}.bind(this),false);
				xhr.addEventListener('error',function(){},false);
				xhr.addEventListener('abort',function(){},false);
				xhr.send();
			}
		};
		PaginationManager.prototype.current = function(){
			if( !this.blocked && !this.end ){
				var xhr = new XMLHttpRequest();
				this.blocked = true;
				if(this.params){
					xhr.open('get',this.url + '?' + this.params);
				}else{
					xhr.open('get',this.url);
				}
				xhr.setRequestHeader('Range','items:'+(this.from)+'-'+(this.to) );
				xhr.responseType = 'document';
				xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
				xhr.addEventListener('load',function(event){
					var range = event.target.getResponseHeader('content-range').split(/([0-9]*)-([0-9]*)\/([0-9]*)/);
					this.from = parseInt(range[1]);
					this.to = parseInt(range[2]);
					this.total = parseInt(range[3]);
					this.callback.call(this,event.target.response.body.childNodes);
					if( this.total == this.to ){ this.end = true }
					this.blocked = false;
				}.bind(this),false);
				xhr.addEventListener('error',function(){},false);
				xhr.addEventListener('abort',function(){},false);
				xhr.send();
			}
		};
		PaginationManager.prototype.setRangeHeader = function(header){
			var values = header.split(/([0-9]*)-([0-9]*)\/([0-9]*)/);
			this.from = parseInt(values[1]);
			this.to = parseInt(values[2]);
			this.total = parseInt(values[3]);
			this.end = ( this.to == this.total );
		};

	return PaginationManager;
});