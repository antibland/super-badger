(function(window) {
  "use strict";
  var canvas         = document.createElement("canvas"),
      button         = document.querySelector("button"),
      context        = canvas.getContext("2d"),
      CANVAS_WIDTH   = 512,
      CANVAS_HEIGHT  = 480,
      BADGER_WIDTH   = 60,
      BADGER_HEIGHT  = 43,
      EXEC_WIDTH     = 32,
      EXEC_HEIGHT    = 48,
      keysDown       = [],
      scopeContainer = {},
      coverImage,
      reset,
      update,
      render,
      main,
      then;

  // Game images map
  var gameImagesMap = {
        playfield: ".jpg",
        badger   : ".png",
        desk     : ".png",
        exec     : ".png"
      };

  // Game objects
  var badger      = {
        speed: 256
      },
      exec        = {},
      execsCaught = 0;

  function init() {
    then = Date.now();
    reset();
    main();
  }

  function createPattern(theImg) {
    var ptrn = context.createPattern(theImg, "repeat");
    context.fillStyle = ptrn;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  function loadImages() {
    function loadImage(imgName, imgPrefix) {
      scopeContainer[imgName + "Image"] = new Image();
      scopeContainer[imgName + "Image"].src = "assets/" + imgName + imgPrefix;
      scopeContainer[imgName + "Image"].onload = function() {
        scopeContainer[imgName + "Ready"] = true;
      }
    }

    for (var key in gameImagesMap) {
      if (gameImagesMap.hasOwnProperty(key)) {
        loadImage(key, gameImagesMap[key]);
      }
    }
  }

  function collision() {
    return badger.x <= (exec.x + EXEC_WIDTH)   &&
           exec.x <= (badger.x + BADGER_WIDTH) &&
           badger.y <= (exec.y + EXEC_HEIGHT)  &&
           exec.y <= (badger.y + BADGER_HEIGHT);
  }

  loadImages();

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  document.body.appendChild(canvas);

  // Cover background image
  coverImage = new Image();
  coverImage.src = "assets/cover.jpg";
  coverImage.onload = function() {
    createPattern(coverImage);
  };

  addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  }, false);

  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);

  button.addEventListener("click", init, false);

  // Reset the game when the player catches a exec
  reset = function () {
    badger.x = canvas.width / 2;
    badger.y = canvas.height / 2;

    // Throw the exec somewhere on the screen randomly
    exec.x = 32 + (Math.random() * (canvas.width - 64));
    exec.y = 32 + (Math.random() * (canvas.height - 64));
  };

  // Update game objects
  update = function (modifier) {
    if (38 in keysDown && badger.y > 0) { // UP
      badger.y -= badger.speed * modifier;
    }
    if (40 in keysDown && badger.y < CANVAS_HEIGHT - BADGER_HEIGHT) { // DOWN
      badger.y += badger.speed * modifier;
    }
    if (37 in keysDown && badger.x > 0) { // LEFT
      badger.x -= badger.speed * modifier;
    }
    if (39 in keysDown && badger.x < CANVAS_WIDTH - BADGER_WIDTH) { // RIGHT
      badger.x += badger.speed * modifier;
    }

    // Collision check
    if (collision()) {
      ++execsCaught;
      reset();
    }
  };

  // Draw everything
  render = function () {
    if (scopeContainer["playfieldReady"]) {
      createPattern(scopeContainer["playfieldImage"]);
    }

    if (scopeContainer["badgerReady"]) {
      context.drawImage(scopeContainer["badgerImage"], badger.x, badger.y);
    }

    if (scopeContainer["execReady"]) {
      context.drawImage(scopeContainer["execImage"], exec.x, exec.y);
    }

    // Score
    context.fillStyle = "rgb(250, 250, 250)";
    context.font = "48px Shadows Into Light";
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillText("" + execsCaught, 32, 16);
  };

  // The main game loop
  main = function () {
    var now   = Date.now(),
        delta = now - then;

    update(delta / 1000);
    render();

    then = now;

    // Request to do this again ASAP
    requestAnimationFrame(main);
  };

  // Cross-browser support for requestAnimationFrame
  window.requestAnimationFrame = window.requestAnimationFrame       ||
                                 window.webkitRequestAnimationFrame ||
                                 window.msRequestAnimationFrame     ||
                                 window.mozRequestAnimationFrame;
})(window);
