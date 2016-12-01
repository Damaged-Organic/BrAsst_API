;(function(root, factory){

	if(typeof define === "function" && define.amd){
		define(["exports"], function(exports){ root.Brasst = factory(root, exports); });
	} else{
		root.Brasst = factory(root, {});
	}

})(this, function(root, Brasst){

	Brasst.version = "1.0.0";

	var api = "https://brasst.net.ua/api",
		cssID = "BrasstCSS";
		
	function trimSlashes(str){
		if(!str) return;
		return str.replace(/^\/|\/$/, "");
	}

	function Brasst(options){
		options = options || {};
		
		this.api = api + "/" + (trimSlashes(options.locale) || "");

		window.onload = this.initialize.apply(this, arguments);
	}
	Brasst.prototype = {
		initialize: function(){
			if(this.checkCookie("brasstWidget")) return;

			this.appendCSS();
			this.execute();
		},
		appendCSS: function(){
			if(!document.getElementById(cssID)){
				var head = document.getElementsByTagName("head")[0],
					link = document.createElement("link");

				link.id = cssID;
				link.rel = "stylesheet";
				link.type = "text/css";
				link.href = "https://brasst.net.ua/bundles/app/Meat/css/widget.css";
				link.media = "all";

				head.appendChild(link);
			}
		},
		close: function(){
			this.container.parentNode.removeChild(this.container);
		},
		setCookie: function(){
			var expires, date = new Date();

			date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();

			document.cookie = "brasstWidget" + "=" + "disabled" + expires + "; path=/";
			this.close();
		},
		checkCookie: function(name){
			if(document.cookie.length > 0){
				return document.cookie.match(/brasstWidget/) ? true : false;
			}
			return false;
		},
		setup: function(){
			var xhr = new XMLHttpRequest();

			if("withCredentials" in xhr){
				xhr.open("GET", this.api + "?type=html", true);
			}
			else if(typeof XDomainRequest != "undefined"){
				xhr = new XDomainRequest();
				xhr.open("GET", this.api + "?type=html");
			} else{
				throw new Error("CORS doesn't supported in your browser");
			}
			return xhr;
		},
		execute: function(){
			if(!this.api) return;
			var self = this,
				xhr = this.setup();

			if(xhr){
				xhr.onload = function(e){
					if(e.target.readyState !== 4) return;
					if(e.target.status >= 200 && e.target.status < 400){
						if(!e.target.responseText) throw new Error("There is no delivered data");
						self.render(e.target.responseText);
					}
				}
			}
			xhr.send();
		},
		ensureContainer: function(){
			this.container = document.createElement("div");
			this.container.id = "brasstWidget";
		},
		render: function(html){
			if(!html.trim()) return;
			if(!this.container) this.ensureContainer();

			this.container.innerHTML = html;

			document.body.insertBefore(this.container, document.body.childNodes[0]);
			this.bindEvents();
		},
		bindEvents: function(){
			if(!this.container) return;

			var self = this,
				cookieButton = document.getElementById("forgetBrasstWidget");
				closeButton = document.getElementById("closeBrasstWidget");

			closeButton.addEventListener("click", function(e){
				self.close();
			}, false);
			cookieButton.addEventListener("click", function(e){
				self.setCookie();
			}, false);
		}
	}
	return Brasst;
});