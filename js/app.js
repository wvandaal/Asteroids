window.onload = function () {
	"use strict";

	var width 	= window.innerWidth * 0.9, 
			height 	= window.innerHeight * 0.9,
			canvas 	= document.createElement('canvas'),
			body		= document.querySelector('body');

	canvas.setAttribute('width', width);
	canvas.setAttribute('height', height);
	body.appendChild(canvas);

  new Asteroids.Game(width, height).start(canvas);
};