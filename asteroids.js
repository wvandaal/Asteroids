
// var allows Asteroids to be called by jQuery in page
var Asteroids = (function() {

  ////////////////////////
  // MovingObject Class //
  ////////////////////////
  function MovingObject(pos, velocity) {
    this.position = pos;
    this.velocity = velocity;
  }

  //Updates MovingObject's position based on its velocity and given the
  //canvas dimensions
  MovingObject.prototype.update = function(width, height) {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.offscreen(width, height);

    return this.position;
  };

  //Translates MovingObject's position when it moves offscreen
  MovingObject.prototype.offscreen = function(width, height){
    var x_pos = this.position.x, y_pos = this.position.y, radius = this.radius;

    if ((x_pos + radius) < 0 || (x_pos - radius) > width) 
      this.position.x = -(x_pos - width);

    if ((y_pos + radius) < 0 || (y_pos - radius) > height)
      this.position.y = -(y_pos - height);
  };

  //Returns true if MovingObject collides with another of the class
  MovingObject.prototype.collideWith = function(object){
    var distance = Math.sqrt(
      Math.pow(this.position.x - object.position.x, 2) +
      Math.pow(this.position.y - object.position.y, 2)
    );
    return distance < this.radius + object.radius;
  };


  ////////////////////
  // Asteroid Class //
  ////////////////////
  function Surrogate() {}
  Surrogate.prototype = MovingObject.prototype;

  function Asteroid(pos, radius, velocity) {
    MovingObject.call(this, pos, velocity);
    this.radius = radius;

    //Optional image sprite for Asteroid class (see Asteroid.draw() to implement)
    this.sprite = new Image();
    this.sprite.src = 'asteroid.png'
  }

  //Generates a randomly placed asteroid with a random velocity
  Asteroid.randomAsteroid = function (width, height, ship_pos) {
    var radius = Math.floor(1 + Math.random() * 5) * 10,
        i = (Math.random() < .5) ? 1 : -1,
        j = (Math.random() < .5) ? 1 : -1,
        pos = {"x": Math.floor(Math.random() * width),
               "y": Math.floor(Math.random() * height)},
        velocity = {"x": Math.ceil(Math.random() * 3 * i),
                    "y": Math.ceil(Math.random() * 3 * j)};
    return new Asteroid(pos, radius, velocity);
  };

  Asteroid.prototype = new Surrogate()

  //Draws the asteroid given the canvas object
  Asteroid.prototype.draw = function(ctx) {
    ctx.fillStyle = "white";
    //Uncomment to add image
    //ctx.drawImage(this.sprite, this.position.x, this.position.y, this.radius, this.radius);

    //Comment out rest to remove canvas element asteroids
    ctx.beginPath();
    ctx.lineWidth = 5;
    ctx.arc(
      this.position.x, this.position.y,
      this.radius, 0, 2 * Math.PI, false);
    ctx.strokeStyle = '#ff0000'  ;
    ctx.stroke();
    ctx.fill();
  };

  var img = new Image();
  img.src = 'planet.png';

  //////////////////
  // Bullet Class //
  //////////////////
  function Bullet(pos, angle) {
    var speed = 30;
    var velocity = {"x": speed * Math.cos(angle - Math.PI/2),
                    "y": speed * Math.sin(angle - Math.PI/2)};
    MovingObject.call(this, pos, velocity);
    this.radius = 4;
    this.angle = angle;
  }

  Bullet.prototype = new Surrogate();

  Bullet.prototype.draw = function(ctx) {
    ctx.fillStyle = "red";
    ctx.beginPath();

    ctx.arc(
      this.position.x, this.position.y,
      this.radius, 0, 2 * Math.PI, false);
    ctx.fill();
  };

  //Updates Bullet's position but forgoes the translation of position when
  //Bullet goes offscreen
  Bullet.prototype.update = function() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    return this.position;
  };

  //Returns true if Bullet is offscreen
  Bullet.prototype.offscreen = function(width, height){
    var x_pos = this.position.x, y_pos = this.position.y, radius = this.radius;
    return((x_pos + radius) < 0 || (x_pos - radius) > width ||
          (y_pos + radius) < 0 || (y_pos - radius) > height);
  };


  ////////////////
  // Ship Class //
  ////////////////
  function Ship(width, height) {
    var pos = {'x': width/2, 'y': height/2}
    MovingObject.call(this, pos, {'x': 0, 'y': 0});
    this.radius = 30;
    this.angle = 0;
    this.sprite = new Image();
    this.sprite.src = 'ship.png';
    this.maxBullets = Math.floor(Math.abs(width - height)/50);
  }
  Ship.prototype = new Surrogate();

  //Draws the spaceship sprite and rotates the canvas to allow for steering
  Ship.prototype.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.position["x"], this.position["y"]);
    ctx.rotate(this.angle);

    var xDim = this.radius * 2, yDim = this.radius * 2;
    ctx.drawImage(this.sprite, xDim/-2, yDim/-2, xDim, yDim);
    ctx.restore();
  };

  //
  Ship.prototype.isHit = function(asteroids) {
    for (var i = 0; i < asteroids.length; i++){
      if (this.collideWith(asteroids[i]))
        return true;
    }
    return false;
  };

  Ship.prototype.update = function(width, height, game) {
    var speed = Math.sqrt(
      Math.pow(this.velocity['x'],2) +
      Math.pow(this.velocity['y'],2));

    if (key.isPressed("left"))
      this.angle -= (Math.PI / 30);
    if (key.isPressed("right"))
      this.angle += (Math.PI / 30);
    if (key.isPressed("down")) {
      this.velocity.x -= Math.cos(this.angle - Math.PI/2)/6;
      this.velocity.y -= Math.sin(this.angle - Math.PI/2)/6;
    }

    if (key.isPressed("up") && speed < 20) {
      this.velocity.x += Math.cos(this.angle - Math.PI/2)/4;
      this.velocity.y += Math.sin(this.angle - Math.PI/2)/4;
    } else {
      this.velocity.x *= .98;
      this.velocity.y *= .98;
    }

    if (key.isPressed("space") && game.bullets.length < this.maxBullets) {
      this.fireBullet(game);
      console.log(game.bullets);
    }

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    this.offscreen(width, height)
    return this.position;
  };

  Ship.prototype.fireBullet = function(game){
    var dup_position = {"x": this.position["x"], "y": this.position["y"]}
    game.bullets.push(new Bullet(dup_position, this.angle))
  };

  //Game Classs
  function Game(width, height) {
    this.width = width;
    this.height = height;
    this.asteroids = [];
    this.ship = new Ship(width, height);
    this.bullets = [];
    this.minAsteroids = 5;

    this.score = 0;
  }

  Game.prototype.draw = function(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(img, 0, 0, this.width, this.height);
    
    ctx.font = "bold 20px sans-serif";


    _.union(this.asteroids, this.bullets).forEach(function(elem, i, array) {
      elem.draw(ctx);
    });

    this.ship.draw(ctx);
    ctx.fillStyle = "black"
    ctx.fillText("Score: " + this.score, 10, 20 );
  }

  Game.prototype.update = function(ctx) {
    var that = this;

    if ((that.score + 1) % 50 == 0 )
      that.minAsteroids += 2

    var total = that.minAsteroids + (Math.floor(Math.random() * 10))
    while (this.asteroids.length < total){
      var a = Asteroid.randomAsteroid(this.width, this.height)
      if (!a.collideWith(this.ship)) {
        this.asteroids.push(a)
      }
    }

    this.ship.update(this.width, this.height, this)

    this.bullets.forEach(function(elem, i) {
      if (elem.offscreen(that.width, that.height)) {
        delete that.bullets[i];
      }
    });
    this.bullets = _.compact(this.bullets);

    _.union(this.asteroids, this.bullets).forEach(function(elem, i, array) {
      elem.update(that.width, that.height);
    })

    this.bullets.forEach(function(bullet, i){
      that.asteroids.forEach(function(asteroid, j){
        if (bullet.collideWith(asteroid)) {
          that.score += 1;
          delete that.bullets[i];
          if (asteroid.radius > 10) {
            asteroid.radius -= 10;
          } else {
            delete that.asteroids[j];
          }
        }
      })

    })
    this.bullets = _.compact(this.bullets);
    this.asteroids = _.compact(this.asteroids);
    this.draw(ctx);


    //Game Pov
    if(this.ship.isHit(this.asteroids)) {
      clearInterval(global_handle);
      global_handle = 0;
      ctx.fillStyle = "red"
      ctx.font = ("bold " + Math.floor(Math.abs(this.width)/10) + "px monospace");
      ctx.fillText("Game Over.", this.width/4, this.height/2 );
    }
  }

  Game.prototype.start = function (canvasEl) {
    var ctx = canvasEl.getContext("2d");

    var that = this;
    global_handle = window.setInterval(function () {
      that.update(ctx);
    }, 30);
  };

  return {
    Asteroid: Asteroid,
    Game: Game
  };
})();



