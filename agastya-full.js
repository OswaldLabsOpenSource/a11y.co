(function(p) {

	var y = {

		l: [], // Loaded files
		bodyClass: [(document.documentElement || document.body.parentNode).className], // Body class
		c: -1, // Current element
		k: 0, // Is speech running?
		//fileURL: "https://a11y.co/", // Domain root
		fileURL: "http://192.168.1.5:5757/", // Domain root

		init: function() {
			// Load basic CSS
			y.load(y.fileURL + "basic.css");
			// Analytics
			y.analytics("first", "pageload");
			// Polyfills
			if (!document.querySelectorAll || !document.querySelector || !Array.prototype.forEach || typeof localStorage === "undefined") {
				y.load("https://cdn.polyfill.io/v2/polyfill.min.js?features=Array.prototype.forEach,localStorage,document.querySelector,JSON,Element.prototype.classList,Array.prototype.filter", y.init);
			}
			// Retrieve Session Storage
			if (typeof localStorage !== "undefined") {
				if (!localStorage.s) {
					localStorage.s = JSON.stringify({
						classes: "",
						styles: ""
					});
				} else {
					y.load(y.fileURL + "agastya.css");
					JSON.parse(localStorage.s).classes.split(" ").forEach(function(a) {
						y.bodyClass.push(a);
						if (a.indexOf("agastya--") > -1) {
							/* jshint ignore:start */
							y.open(function() {
								//document.getElementById(a.replace("agastya--", "")).setAttribute("checked", "checked");
								//console.log(document.getElementById(a.replace("agastya--", "")));
								//console.log(a);
								y.close();
							});
							/* jshint ignore:end */
						}
					});
					y.save();
				}
			}
		},

		open: function(x) {
			x = x ? x : null;
			if (!document.querySelector(".agastya")) {
				var a = document.createElement("div");
				a.className = "agastya";
				a.innerHTML = "<i class='ion ion-md-radio-button-on loading-icon'></i>";
				var request = new XMLHttpRequest();
				request.open("GET", y.fileURL + "widget.html", true);
				request.onreadystatechange = function() {
					if (this.readyState === 4) {
						if (this.status >= 200 && this.status < 400) {
							a.innerHTML = this.response;
							var o = document.querySelector(".agastya button");
							if (o) { o.focus(); }
							if (!document.querySelector("[data-read-aloud]")) {
								document.querySelector("#readaloud").style.display = "none";
							}
							document.querySelector(".websiteName").innerHTML = document.domain.replace("www.", "").split(".")[0];
							if (x !== null) { x(); } else { y.analytics("widget", "open"); }
						} else {
							y.close();
						}
					}
				};
				request.send();
				request = null;
				document.body.appendChild(a);
				var b = document.createElement("div");
				b.className = "agastya-background";
				document.body.appendChild(b);
				b.addEventListener("click", function() {
					y.close();
				});
			} else {
				var o = document.querySelector(".agastya button");
				if (o) { o.focus(); }
				if (x !== null) { x(); } else { y.analytics("widget", "open"); }
			}
			document.querySelector(".agastya").style.display = "block";
			document.querySelector(".agastya-background").style.display = "block";
		},

		close: function() {
			document.querySelector(".agastya").style.display = "none";
			document.querySelector(".agastya-background").style.display = "none";
		},

		page: function(page) {
			[].slice.call(document.querySelectorAll(".agastya .agastya-page")).forEach(function(a) {
				a.style.display = "none";
			});
			if (page === "home") {
				document.querySelector(".agastya .main").style.display = "block";
			} else {
				document.querySelector(".agastya ." + page).style.display = "block";
			}
		},

		/* jshint ignore:start */
		analytics: function(a, b) {
			y.devMode = 1;
			if (y.devMode == 1) {
				//console.log("Event: " + a + " | " + b);
			} else {
				y.load("https://www.google-analytics.com/analytics.js", function() {
					console.log(a + " " + b);
					if (a === "first") {
						googleanalytics("create", "UA-79176349-6", "auto");
						googleanalytics("send", "pageview");
					} else {
						googleanalytics("send", "event", a, b, document.domain);
					}
				});
			}
		},
		/* jshint ignore:end */

		// Load
		load: function(file, fun) {
			if (!fun) { fun = function() {}; }
			var f;
			if (file.indexOf("http") === -1) {
				var split = file.split(".");
				file = split[split.length - 1] + "/" + file;
			}
			if (file.indexOf("css") > -1) {
				f = document.createElement("link");
				f.rel = "stylesheet";
				f.href = file;
			} else {
				f = document.createElement("script");
				f.src = file;
			}
			f.onload = function() {
				fun();
			};
			if (y.l.indexOf(file) === -1) {
				(document.head || document.querySelector("head")).appendChild(f);
				y.l.push(file);
			} else {
				fun();
			}
		},

		// Session Storage Saving
		save: function() {
			var saved = JSON.parse(localStorage.s);
			var styleString = "";
			y.bodyClass.forEach(function(a) {
				styleString += (a + " ");
			});
			(document.documentElement || document.body.parentNode).className = styleString.replace(/^\s+|\s+$/gm, "");
			saved.classes = styleString.replace(y.bodyClass[0] + " ", "");
			localStorage.s = JSON.stringify(saved);
		},

		// Modes
		mode: function(mode) {
			y.load(y.fileURL + "agastya.css");
			if (y.bodyClass.indexOf(p + "--" + mode) === -1) {
				y.bodyClass.push(p + "--" + mode);
				y.analytics(mode, "start");
			} else {
				y.bodyClass.splice(y.bodyClass.indexOf(p + "--" + mode), 1);
				y.analytics(mode, "end");
			}
			y.save();
		},

		// Reset
		reset: function() {
			y.bodyClass.splice(1);
			y.save();
			y.analytics("reset", "reset");
		},

		speech: {
			init: function() {
				// Start
				y.k = 1;
				var desc = [];
				
				// Find relevant elements
				function allDescendants(node) {
					for (var i = 0; i < node.childNodes.length; i++) {
						var child = node.childNodes[i];
						allDescendants(child);
						if (node.childNodes.length === 1) {
							var me = child.parentNode;
							if (["A", "B", "BIG", "I", "SMALL", "TT", "ABBR", "ACRONYM", "CITE", "CODE", "DFN", "EM", "KBD", "STRONG", "SAMP", "TIME", "VAR", "BDO", "BR", "MAP", "OBJECT", "Q", "SPAN", "SUB", "SUP", "BUTTON", "INPUT", "LABEL", "SELECT", "TEXTAREA", "OPTION", "IMG"].indexOf(node.nodeName) !== -1) {
								me = child.parentNode.parentNode;
							}
							desc.push(me);
						}
					}
				}
				allDescendants(document.querySelector("[data-read-aloud]") || document.body);
				desc = desc.filter(function(elem, index, self) {
					return index === self.indexOf(elem);
				});

				// Add tags to elements
				[].slice.call(desc).forEach(function(a) {
					if (a.innerHTML.indexOf(". ") > -1) {
						a.innerHTML = a.innerHTML.replace(/[^\.!\?]+[\.!\?]+/g, "<are>$&</are>");
					} else {
						a.innerHTML = "<are>" + a.innerHTML + "</are>";
					}
				});
				y.s = document.querySelectorAll("are, ac");


				// Keyboard support
				window.addEventListener("keydown", function(e) {
					if (y.k === 1) {
						if (e.keyCode === 39) {
							y.speech.changeLine("next");
						} else if (e.keyCode === 37) {
							y.speech.changeLine("prev");
						}  else if (e.keyCode === 27) {
							y.speech.stop();
						} else if (e.keyCode === 32 && e.target === document.body) {
							y.speech.pause();
							e.preventDefault();
						}
					}
				});
				// Remove button focus
				if ("activeElement" in document) {
					document.activeElement.blur();
				}
				// Show bottom bar
				if (!document.querySelector(".agastya-ras")) {
					var b = document.createElement("div");
					b.className = "agastya-ras";
					b.innerHTML = "<div class=\"left\"><div class=\"status disabled\">Reading&hellip;</div></div><div class=\"center\"><button class=\"skip prev\" onclick=\"agastya.speech.changeLine('prev')\"><i class=\"ion ion-md-skip-backward\"></i></button><button class=\"pause\" onclick=\"agastya.speech.pause()\"><i class=\"ion ion-md-pause\"></i></button><button class=\"skip next\" onclick=\"agastya.speech.changeLine('next')\"><i class=\"ion ion-md-skip-forward\"></i></button></div><div class=\"right\"><button class=\"close\" onclick=\"agastya.speech.stop()\"><i class=\"ion ion-md-close-circle\"></i></button></div>";
					document.body.appendChild(b);
				}
				document.querySelector(".agastya-ras").style.display = "block";
			},
			pause: function() {
				/* jshint ignore:start */
				var p = document.querySelector("#m1abc9c");
				if (p.paused) {
					p.play();
					document.querySelector(".agastya-ras .status").innerHTML = "Reading&hellip;";
					y.analytics("speech", "resume");
					document.querySelector(".agastya-ras .pause i").classList.add("ion-md-pause");
					document.querySelector(".agastya-ras .pause i").classList.remove("ion-md-play");
				} else {
					p.pause();
					document.querySelector(".agastya-ras .status").innerHTML = "Paused";
					y.analytics("speech", "pause");
					document.querySelector(".agastya-ras .pause i").classList.remove("ion-md-pause");
					document.querySelector(".agastya-ras .pause i").classList.add("ion-md-play");
				}
				/* jshint ignore:end */
			},
			changeLine: function(n) {
				[].slice.call(y.s).forEach(function(a) {
					a.removeAttribute("data-active");
				});
				if (n === "next") { // Next Sentence
					if (y.c < (y.s.length - 1)) {
						y.c++;
					} else {
						y.speech.stop();
						return;
					}
				} else { // Previous Sentence
					if (y.c > 0) {
						y.c--;
					}
				}
				if (y.c === 0) {
					document.querySelector(".agastya-ras .skip.prev").classList.add("disabled");
				} else {
					document.querySelector(".agastya-ras .skip.prev").classList.remove("disabled");
				}
				if (y.c === (y.s.length - 1)) {
					document.querySelector(".agastya-ras .skip.next").classList.add("disabled");
				} else {
					document.querySelector(".agastya-ras .skip.next").classList.remove("disabled");
				}
				/* jshint ignore:start */
				function getPos(el) {
					for (var lx = 0, ly = 0;
						el !== null;
						lx += el.offsetLeft,
						ly += el.offsetTop,
						el = el.offsetParent
					);
					return { x: lx, y: ly };
				}
				window.scrollTo(window.scrollX, getPos(y.s[y.c]).y - window.innerHeight / 2);
				/* jshint ignore:end */
				y.s[y.c].setAttribute("data-active", "true");
				var p;
				if (!document.querySelector("#m1abc9c")) {
					p = document.createElement("audio");
					p.id = "m1abc9c";
					document.body.appendChild(p);
				} else {
					p = document.querySelector("#m1abc9c");
					document.querySelector(".agastya-ras .pause i").classList.add("ion-md-pause");
					document.querySelector(".agastya-ras .pause i").classList.remove("ion-md-play");
				}
				p.src = "https://www.google.com/speech-api/v1/synthesize?ie=UTF-8&text=" + y.s[y.c].innerText + "&lang=en-US";
				p.onended = function() {
					/* jshint ignore:start */
					y.speech.changeLine("next");
					/* jshint ignore:end */
				};
				try {
					p.play();
				} catch(err) {
					
				}
			},
			stop: function() {
				y.c = 0;
				document.querySelector(".agastya-ras").style.display = "none";
				[].slice.call(y.s).forEach(function(a) {
					a.removeAttribute("data-active");
				});
				y.analytics("speech", "stop");
			}
		},

		speak: function() {
			y.speech.init();
			y.speech.changeLine("next");
			y.analytics("speech", "start");
		},

		/* jshint ignore:start */
		translate: function(lang) {
			y.analytics("translate", "start");
			if (!document.querySelector("#google_translate_element")) {
				var transTop = document.createElement("div");
				transTop.classList.add("translate-div-top");
				transTop.innerHTML = 'OK<button class="close-btntranslate">&times;</button>';
				(document.body || document.querySelector("body")).appendChild(transTop);
				var transDiv = document.createElement("div");
				transDiv.id = "google_translate_element";
				transDiv.style.display = "none";
				(document.body || document.querySelector("body")).appendChild(transDiv);
				y.load("https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit", function() {
					var q = setInterval(function() {
						if (document.querySelector("#google_translate_element select option")) {
							var e = document.querySelector("#google_translate_element select");
							e.value = lang;
							y.analytics("translate", lang);
							if ("createEvent" in document) {
								var evt = document.createEvent("HTMLEvents");
								evt.initEvent("change", false, true);
								e.dispatchEvent(evt);
							} else {
								e.fireEvent("onchange");
							}
							clearInterval(q);
							var p = setInterval(function() {
								if (document.querySelector("html").className.indexOf("translated-ltr") > -1) {
									var g = setInterval(function() {
										if (document.querySelector("html").className.indexOf("translated-ltr") == -1) {
											y.analytics("translate", "end");
											clearInterval(g);
										}
									}, 100);
									clearInterval(p);
								} else {
									//console.log("TRANSLATING");
								}
							}, 100);
						}
					}, 100);
				});
			}
		}
		/* jshint ignore:end */

	};

	y.init();

	/* jshint ignore:start */
	eval(p + "=y;");
	/* jshint ignore:end */

})("agastya");

/* jshint ignore:start */
function googleTranslateElementInit() {
	new google.translate.TranslateElement({}, "google_translate_element");
}
window.GoogleAnalyticsObject = "googleanalytics";
/* jshint ignore:end */