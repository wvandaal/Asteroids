$(function () {
  var canvas = $("<canvas width='" + 1875 +
                 "' height='" +950 + "'></canvas>");
  $('body').append(canvas);

  // `canvas.get(0)` unwraps the jQuery'd DOM element;
  new Asteroids.Game(1875, 950).start(canvas.get(0));
});