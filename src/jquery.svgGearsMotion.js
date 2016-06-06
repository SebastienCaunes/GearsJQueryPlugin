// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

	"use strict";

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variables rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "svgGearsMotion",
		defaults = {
			gearsIdPrefix: "gear", // id of gears gear1, gear2...
			gearsTeethNumbers: null, // Array with number of teeth, negative number for counter clockwise rotation default +8,-8,+8...
			speedBase: 0.3, // deg / ms
			speedDampenFactor: 0.05, // speed dampen factor, to get back to normal speed
			mouseInfluenceFactor: 0.005, // 0 (no influence) to 1 (complete) factor
		};

	// The actual plugin constructor
	function SVGGearsMotion(element, options) {
		this.element = element;

		// jQuery has an extend method which merges the contents of two or
		// more objects, storing the result in the first object. The first object
		// is generally empty as we don't want to alter the default options for
		// future instances of the plugin
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid SVGGearsMotion.prototype conflicts
	$.extend(SVGGearsMotion.prototype, {

		init: function () {
			// Find your root SVG element
			if (!(this.element instanceof SVGElement)) {
				this.logError("not a svg element");
				return;
			}

			// Create an SVGPoint for future math
			this.pt = this.element.createSVGPoint();

			// populate gears array with information about gears
			this.gears = [];
			if (this.settings.gearsTeethNumbers === null) {
				// no description seek items and generate +8,-8,+8... array for gearsTeethNumbers
				for (var i = 1; ; i++) {
					var myElem = document.getElementById(this.settings.gearsIdPrefix + i);
					if (myElem === null) {
						break;
					}
					this.addGear(myElem, ((i % 2) === 0) ? +8 : -8);
				}
			} else {
				// use gearsTeethNumbers array
				for (var i2 = 0; i2<this.settings.gearsTeethNumbers.length; i2++) {
					var itemId = this.settings.gearsIdPrefix + (i2 + 1);
					var myElem2 = document.getElementById(itemId);
					if (myElem2 === null) {
						this.logError("item " + itemId + " not found");
						break;
					}
					this.addGear(myElem2, this.settings.gearsTeethNumbers[i2]);
				}
			}

			var a=this;
			var d = new Date();
			var previousTime = d.getTime();
			var angle = 0;
			var speed = this.settings.speedBase;
			var previousTimeMouse =-1;
			var prevPosX =-1 , prevPosY = -1;
			var isOverGear = false;
			var prevGearId = -1;
			var currentGearId = -1;
			var step = function (timestamp) {
				var timeDelta = timestamp - previousTime;
				previousTime = timestamp;

				// speed progressively goes back to its base value (speedBase) we keep the rotation direction
				speed = (Math.abs(speed) * (1 - a.settings.speedDampenFactor) + (a.settings.speedBase * a.settings.speedDampenFactor)) * Math.sign(speed);

				angle += (timeDelta * speed);
				for (var i = 0; i < a.gears.length; i++) {
					var gear = a.gears[i];
					gear.item.style.transform = "rotate(" + ((angle / gear.nbDents) % 360) + "deg)";
				}
				requestAnimationFrame(step);
			};

			requestAnimationFrame(step);

			//// interaction avec souris
			this.element.addEventListener("mousemove", function (e) {
				var pt = a.cursorPoint(e);
				var x = pt.x;
				var y = pt.y;

				var d = new Date();
				var curTime = d.getTime();
				var timeDelta = curTime - previousTimeMouse;
				previousTimeMouse = curTime;

				// est-ce qu'on est sur un engrenage ?
				isOverGear = false;
				currentGearId = -1;
				var posX = 0, posY = 0;
				for (var i = 0; i < a.gears.length; i++) {
					var gear = a.gears[i];
					// calcul distance
					posX = x - gear.x;
					posY = y - gear.y;
					if (posX * posX + posY * posY < gear.radiusSquared) {
						currentGearId = i;
						isOverGear = true;
						break;
					}
				}
				if ((prevGearId === currentGearId) && (currentGearId > -1) && (timeDelta > 0)) {
					// la souris est sur l'engrenage depuis deux cycles (timeDelta et prevPosX ok)
					var anglePrev = Math.atan2(prevPosY, prevPosX);
					var angleCur = Math.atan2(posY, posX);

					var deltaAngle = (angleCur - anglePrev);
					if (deltaAngle > Math.PI) {
						anglePrev += Math.PI * 2;
					} else if (deltaAngle < -Math.PI) {
						anglePrev -= Math.PI * 2;
					}
					var influence = a.radToDeg((angleCur - anglePrev) / timeDelta) * a.gears[currentGearId].nbDents;
					speed = (speed * (1 - a.settings.mouseInfluenceFactor)) + (influence * a.settings.mouseInfluenceFactor);
				}

				// set value for next cycle
				prevGearId = currentGearId;
				prevPosX = posX;
				prevPosY = posY;
			});

		},
		addGear: function (element, nbTeeth) {
			element.style.transformOrigin = "50% 50%";
			var boundingBox = element.getBBox();
			var radius = boundingBox.width / 2;

			this.gears.push({
				item: element,
				nbDents: nbTeeth,
				radius: radius,
				radiusSquared: radius * radius,
				x: boundingBox.x + radius,
				y: boundingBox.y + radius,
			});
		},
		// Get point in global SVG space
		cursorPoint: function (evt) {
			this.pt.x = evt.clientX;
			this.pt.y = evt.clientY;
			return this.pt.matrixTransform(this.element.getScreenCTM().inverse());
		},
		// displays error message
		logError: function (message) {
			console.log("Gears plugin error : " + message);
		},
		// convert radians to degrees
		radToDeg: function (angleRad) {
			return (angleRad * 180) / Math.PI;
		},
		degToRad: function (angleDeg) {
			return (angleDeg * Math.PI) / 180;
		},
	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[pluginName] = function (options) {
		return this.each(function () {
			if (!$.data(this, "plugin_" + pluginName)) {
				$.data(this, "plugin_" + pluginName, new SVGGearsMotion(this, options));
			}
		});
	};


})(jQuery, window, document);
