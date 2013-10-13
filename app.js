$(function () {
	var width = ($(window).width() - 40), height = $(window).height() - 40
  var canvas = $("<canvas width='" + width +
                 "' height='" + height + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  new Asteroids.Game(width, height).start(canvas.get(0));
});