var Asteroids = (function() {
  //MovingObject Class
  function MovingObject(pos, velocity) {
    this.position = pos;
    this.velocity = velocity;
  }

  MovingObject.prototype.update = function(width, height) {
    this.position['x'] += this.velocity['x'];
    this.position['y'] += this.velocity['y'];

    this.offscreen(width, height);

    return this.position;
  };

  MovingObject.prototype.offscreen = function(width, height){
    if ((this.position['x'] + this.radius) < 0 ||
    (this.position['x'] - this.radius) > width) {
      this.position['x'] = -(this.position['x'] - width)
    }
    if ((this.position['y'] + this.radius) < 0 ||
    (this.position['y'] - this.radius) > height) {
      this.position['y'] = -(this.position['y'] - height)
    }
  };

  MovingObject.prototype.collideWith = function(object){
    var distance = Math.sqrt(
      Math.pow(this.position["x"] - object.position["x"], 2) +
      Math.pow(this.position["y"] - object.position["y"], 2)
    )
    return distance < this.radius + object.radius;
  }


  //Asteroid Class
  function Surrogate() {}
  Surrogate.prototype = MovingObject.prototype;

  function Asteroid(pos, radius, velocity) {
    MovingObject.call(this, pos, velocity);
    this.radius = radius;
  };

  Asteroid.randomAsteroid = function (width, height, ship_pos) {
    var pos = {}, velocity = {}, radius,
        i = (Math.random() < .5) ? 1 : -1,
        j = (Math.random() < .5) ? 1 : -1;
    pos["x"] = Math.floor(Math.random() * width);
    pos["y"] = Math.floor(Math.random() * height);
    radius = Math.floor(10 + Math.random() * 30);
    velocity["x"] = Math.ceil(Math.random() * 3 * i);
    velocity["y"] = Math.ceil(Math.random() * 3 * j);
    return new Asteroid(pos, radius, velocity)
  }

  Asteroid.prototype = new Surrogate()

  Asteroid.prototype.draw = function(ctx) {
    ctx.fillStyle = "grey";
    ctx.beginPath();

    ctx.arc(
      this.position['x'],
      this.position['y'],
      this.radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.fill();
  }

  var img = new Image();
  // img.onload = function () {
 //    //drawImage(img, 0, 0);
 //  };
  img.src = 'bg.jpg';


  //Bullet Class
  function Bullet(pos, angle) {
    var speed = 30;
    this.angle = angle;
    var velocity = {"x": speed * Math.cos(this.angle - Math.PI/2),
                    "y": speed * Math.sin(this.angle - Math.PI/2)};
    MovingObject.call(this, pos, velocity);
    this.radius = 2;
  }

  Bullet.prototype = new Surrogate();

  Bullet.prototype.draw = function(ctx) {
    ctx.fillStyle = "white";
    ctx.beginPath();

    ctx.arc(
      this.position['x'],
      this.position['y'],
      this.radius,
      0,
      2 * Math.PI,
      false
    );

    ctx.fill();
  }

  Bullet.prototype.update = function() {
    this.position['x'] += this.velocity['x'];
    this.position['y'] += this.velocity['y'];

    return this.position;
  };

  Bullet.prototype.offscreen = function(width, height){
    return(
    (this.position['x'] + this.radius) < 0 ||
    (this.position['x'] - this.radius) > width ||
    (this.position['y'] + this.radius) < 0 ||
    (this.position['y'] - this.radius) > height);
  };

  //Ship Class
  function Ship(width, height) {
    var pos = {'x': width/2, 'y': height/2}
    MovingObject.call(this, pos, {'x': 0, 'y': 0});
    this.radius = 25;
    this.angle = 0;
    this.sprite = new Image();
    this.sprite.src = 'ship.png'
  }
  Ship.prototype = new Surrogate();

  Ship.prototype.draw = function(ctx) {
    ctx.save();
    ctx.translate(this.position["x"], this.position["y"]);
    ctx.rotate(this.angle);

    var p = this.position;
    ctx.drawImage(this.sprite, -25, -25, 50, 50);
    ctx.restore();
  }


  Ship.prototype.isHit = function(asteroids) {
    for (var i = 0; i < asteroids.length; i++){
      if (this.collideWith(asteroids[i])) {
        return true;
      }
    }
    return false;
  }

  Ship.prototype.update = function(width, height, game) {
    var speed = Math.sqrt(
      Math.pow(this.velocity['x'],2) +
      Math.pow(this.velocity['y'],2));

    if (key.isPressed("left")) {
      this.angle -= (Math.PI / 30)
    }
    if (key.isPressed("right")) {
      this.angle += (Math.PI / 30)
    }
    if (key.isPressed("up") && speed < 20) {
      this.velocity["x"] += Math.cos(this.angle - Math.PI/2)/6;
      this.velocity["y"] += Math.sin(this.angle - Math.PI/2)/6;
    } else {
      this.velocity['x'] *= .98;
      this.velocity['y'] *= .98;
    }

    if (key.isPressed("space") && game.bullets.length < 10) {
      this.fireBullet(game);
      console.log(game.bullets);
    }

    this.position['x'] += this.velocity['x'];
    this.position['y'] += this.velocity['y'];

    this.offscreen(width, height)
    return this.position;
  }

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

    this.score = 0;
  }

  Game.prototype.draw = function(ctx) {
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(img, 0, 0);
    ctx.fillStyle = "white"
    ctx.font = "bold 16px sans-serif";


    _.union(this.asteroids, this.bullets).forEach(function(elem, i, array) {
      elem.draw(ctx);
    });

    this.ship.draw(ctx);
    ctx.fillText("Score: " + this.score, 10, 20 );
  }

  Game.prototype.update = function(ctx) {
    var that = this;

    var total = 15 + (Math.floor(Math.random() * 15))
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
          delete that.asteroids[j];
        }
      })

    })
    this.bullets = _.compact(this.bullets);
    this.asteroids = _.compact(this.asteroids);



    this.draw(ctx);

    if(this.ship.isHit(this.asteroids)) {
      clearInterval(global_handle);
      global_handle = 0;
      ctx.fillStyle = "white"
      ctx.font = "bold 72px sans-serif";
      ctx.fillText("Game Over.", this.width/2, this.height/2 );
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



