/*
====================================================================================================================
 ASTEROIDS

 A JS implementation of Asteroids, the 1979 Atari game, with an 80's look & feel.
====================================================================================================================
 Author:          David Montavon
 GitHub repo:     https://github.com/davidmontavon/asteroids
 Created on:      05/03/2020
 Last update on:  05/16/2020
====================================================================================================================
*/
$(document).ready(function(){
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

// VARIABLES =======================================================================================================
  var BULLET_TYPE_NORMAL = 0;
  var BULLET_TYPE_FRAGMENTED = 1;

  var pinkColor = '#ee67f0';  
  var redColor = '#f33';
  var turquoiseColor = '#2df6ec';    
  var yellowColor = '#cac2a6';

  var asteroids = [];
  var asteroidVRotation = 0.02;
  var audioContext = new AudioContext();  
  var bonusPerTimeRange = [
    { threshold: 30000, bonus: 1000 },
    { threshold: 45000, bonus: 500 },
    { threshold: 60000, bonus: 250 },
    { threshold: 75000, bonus: 125 },
    { threshold: 90000, bonus: 70 },
  ];
  var bulletRadius = 2;  
  var bullets = [];
  var bulletType;
  var bulletTypes = [
    {
      name: "Normal",
      color: turquoiseColor,
      count: undefined
    },
    {
      name: "Fragmentation",
      color: yellowColor,
      count: 0
    },
  ];
  var bulletV = 30.0;
  var canChangeAmmo = false;  
  var canvas = document.querySelector("#game");
  var canvasFX = document.querySelector("#effects");   
  var ctx = canvas.getContext("2d");
  var ctxFX = canvasFX.getContext("2d");  
  var currentLevel = -1;  
  var dead = false;  
  var dieMessages = [
    "YOU LOST!!!",
    "Oh nooooo!",
    "You got hit!",
    "You can do it!",
    "Don't give up!",
    "I believe in you.",
    "I know you can do better.",
    "It's OK, you'll do better now.",
    "You'll do better.",
    "Be careful! That ship is expensive!",
    "Oops!",
    "Nice explosion, but you lost...",
    "Ahahahah!",
    ":(",
    "Booooooh!!!",
    "There is room for improvement.",
    "Reminder: the goal is to win.",
    "Stay focused!",
  ];
  var explosionSparks = [];  
  var firstAsteroidShot = false;  
  var gameEvents = [
    { probability: 1.0 / 1000.0,  event: linkAsteroidFateToSpaceshipFate },
    { probability: 1.0 / 500.0,   event: assignFragmentationBulletAmmoItemToAsteroid },
    { probability: 1.0 / 1500.0,   event: assignLifeItemToAsteroid },
  ];
  var gameHeight = $("#game").height();  
  var gameIsOver = false;  
  var gameIsPaused = false;
  var gameWidth = $("#game").width(); 
  var items = [];
  var justWonLevel = false;
  var keyLeftIsDown = false;
  var keyRightIsDown = false;    
  var keyUpIsDown = false;  
  var lastAsteroidMessages = [
    "And the last one...",
    "And last but not least...",
    "Almost there!",
    "One more to go...",
  ];
  var levels = [
    {
      message: "Welcome newbie! Your mission is to destroy the asteroids around you. Good luck!",
      asteroids: [ [50, 50, 50, 1, 1], [750, 50, 50, -1, 1], [300, 500, 50, 1, -1] ],
    },
    {
      message: "Congratulations! But there's more...",
      asteroids: [ [50, 50, 70, 1, 1], [750, 50, 70, -1, 1], [50, 500, 70, 1, -1], [750, 500, 70, -1, -1] ]
    },
    {
      message: "Since you seem to be good at that, here's more!",
      asteroids: [
        [50, 100, 40, 2, 2],
        [350, 50, 40, 0, 2],
        [750, 100, 40, -2, 2],
        [50, 450, 40, 2, -2],
        [350, 500, 40, 0, -2],
        [750, 450, 40, -2, -2],
      ]
    },
    {
      message: "We have some guests tonight!",
      asteroids: [
        [50, 50, 30, 1.5, 1.5],
        [250, 50, 30, 0.75, 1.5],
        [500, 50, 30, -0.75, 1.5],
        [750, 50, 30, -1.5, 1.5],
        [50, 250, 30, 1.5, 0],
        [750, 250, 30, -1.5, 0], 
        [50, 500, 30, 1.5, -1.5],
        [250, 500, 30, 0.75, -1.5],
        [500, 500, 30, -0.75, -1.5],
        [750, 500, 30, -1.5, -1.5],
      ]
    },
    {
      message: "Easy!",
      asteroids: [ [50, 50, 50, 1, 1, 4] ]
    },
    {
      message: "Piece of cake!",
      asteroids: [
        [50, 250, 30, 2, 2, 6],
        [750, 250, 30, -2, -2, 6],
      ]
    },
    {
      message: "YOLOOOOOOOOOO!!!",
      asteroids: [
        [50, 50, 150, 2, 2, 6]
      ]
    }
  ];  
  var levelWonMessages = [
    "YAY!", 
    "Good job!", 
    "Congratulations!", 
    ":D", 
  ];
  var life = maxLife;  
  var linkToSpaceshipMaxAge = 200;
  var maxLife = 5;  
  var maxV = 30.0;
  var maxVR = 10.0 * Math.PI / 180.0;
  var minAsteroidRadius = 10.0;  
  var nbSpaceshipEngineSparks = 3; 
  var nbSpaceshipSparks = 30;     
  var nbSparks = 15;
  var oscillator;   
  var pauseStart;
  var pauseDuration = 0;
  var rotation = 0.0;  
  var score = 0;  
  var scoreIncreaseForAsteroidHit = 10;
  var scoreIncreaseForLevelWon = 1000;
  var soundEffectsEnabled = true;  
  var spaceshipEngineSparks = [];  
  var spaceshipExplosionSparks = [];  
  var time = document.querySelector("#time");
  var topScoresMaxEntries = 10; 
  var typeWriterSpeed = 10; 
  var typing = false;
  var v = 0.0;   
  var vFactor = 2.0;
  var won = false;
  var x;
  var y;
  
  var asteroidColorsPerNbParts = [
    { nbParts: 2, color: pinkColor },
    { nbParts: 4, color: yellowColor },
    { nbParts: 6, color: redColor },
  ];


// FUNCTIONS =======================================================================================================
  function assignFragmentationBulletAmmoItemToAsteroid(){
    if (asteroids.length > 0){
      var item = { x: 0, y: 0, age: 100, draw: drawFragmentationBulletAmmoItem, pickup: pickUpFragmentationBulletAmmoItem };//////
      var rnd = Math.round(Math.random() * (asteroids.length - 1));
      if (asteroids[rnd].item == undefined){
        asteroids[rnd].item = item;
        displayInfo("An asteroid contains a secret item...", false);//////
        setTimeout(function(){ displayInfo("", false); }, 5000);//////    
      }
    }
  }

  function assignLifeItemToAsteroid(){
    if (asteroids.length > 0 && life < maxLife){
      var item = { x: 0, y: 0, age: 100, draw: drawLifeItem, pickup: pickUpLifeItem };//////
      var rnd = Math.round(Math.random() * (asteroids.length - 1));
      if (asteroids[rnd].item == undefined){
        asteroids[rnd].item = item;
        displayInfo("An asteroid contains a secret item...", false);//////
        setTimeout(function(){ displayInfo("", false); }, 5000);//////    
      }
    }   
  }

  function bulletIsInTheAsteroid(bullet, asteroid){
    if (bullet.x+bulletRadius < asteroid.x || bullet.x > asteroid.x + asteroid.w || bullet.y+bulletRadius < asteroid.y || bullet.y > asteroid.y + asteroid.h)
      return false;
    return true;
  } 

  function calculateBonusBasedOnTimeSpent(duration){
    var bonus = 0;
    for (var i = 0; i < bonusPerTimeRange.length; i++){
      if (duration <= bonusPerTimeRange[i].threshold){
        bonus = bonusPerTimeRange[i].bonus;
        break;
      }
    }
    if (bonus > 0){
      increaseScore(bonus);
      displayInfo(`Time bonus: +${bonus}`, true);
    }
  }

  function changeAmmo(){
    var index = bulletTypes.indexOf(bulletType);
    if (++index < bulletTypes.length){
      bulletType = bulletTypes[index];
    } else {
      bulletType = bulletTypes[0];
    }
    updateAmmoType();
    //////display message
  }

  function checkAmmo(){
    canChangeAmmo = false;
    for (var i = 1; i < bulletTypes.length; i++){//////
      if (bulletTypes[i].count > 0){
        canChangeAmmo = true;
        break;
      }
    }
    var changeAmmoCommand = $("#changeAmmoCommand");
    if (!canChangeAmmo && !changeAmmoCommand.hasClass("inactive"))
      changeAmmoCommand.addClass("inactive");
    else if (canChangeAmmo && changeAmmoCommand.hasClass("inactive"))
      changeAmmoCommand.removeClass("inactive");

    if (bulletType.count == 0){
      bulletType = bulletTypes[BULLET_TYPE_NORMAL];
    }

    updateAmmoType();//////
  }
  
  function checkScore(callback){
    var topScoresChanged = false;
    var newScoreEntry = function(){ return { name: prompt("Enter your name (only ten characters will be taken into account):"), score: score } };
    getTopScores(function(topScores){
      if (topScores.length > 0){
        var insertIndex;
        for (var i = topScores.length - 1; i >= 0; i--){
          if (score > topScores[i].score){
            insertIndex = i;
            topScoresChanged = true;
          }
        }
        if (topScoresChanged){
          topScores.splice(insertIndex, 0, newScoreEntry());
        }
        if (!topScoresChanged && topScores.length < topScoresMaxEntries && score > 0){
          topScores.push(newScoreEntry());
          topScoresChanged = true;  
        }
      } else {
        topScores.push(newScoreEntry());
        topScoresChanged = true;
      }
      if (topScoresChanged){
        if (topScores.length > topScoresMaxEntries){
          topScores.splice(10);
        }
        saveNewTopScores(topScores, callback);
      }
    });
  }
    
  function die(){
    if (soundEffectsEnabled)
      playSpaceshipExplodeSound();
    dead = true;
    life--;
    generateSpaceshipExplosion();    
    updateLife();
    if (life == 0){
      gameOver();
    } else {
      displayRandomInfo(dieMessages, false);
      setTimeout(function(){
        if (dead && !middleOfPlayFieldIsFree())
          displayInfo("Waiting for asteroids to move away from the middle...", true);
      }, 2000);
    }
  }   
  
  function displayInfo(message, append){
    if (!typing){
      typing = true;
      if (append)
        document.querySelector("#info").innerHTML += "<br><br>";
      else
        $("#info").html("");
      var i = 0;
      (function typeWriter() {
        if (i < message.length) {
          document.querySelector("#info").innerHTML += message.charAt(i++);
          setTimeout(typeWriter, typeWriterSpeed);
        } else {
          typing = false;
        }
      })();
    } else {
      //////
    }
  }

  function displayRandomInfo(messages, append){
    displayInfo(messages[Math.round(Math.random()*(messages.length-1))], append);
  }

  function displayTopScores(){
    var rank = 1;
    getTopScores(function(data){
      $("#topScores").html("");
      var scoresStr = "";
      data.map(scr => {
        scoresStr += `<tr><td>${rank}. ${scr.name}</td><td>${scr.score}</td></tr>`;
        rank++;
      });
      $("#topScores").html(scoresStr);
      $("#topScoresScreen").show();
    });
  }

  function drawAsteroid(asteroid){
    ctx.save();
    if (!asteroid.linkedToSpaceshipFate){
      ctx.strokeStyle = asteroid.color;
      ctx.shadowColor = asteroid.color;
    } else {
      ctx.strokeStyle = turquoiseColor;
      ctx.shadowColor = turquoiseColor;
    }
    ctx.shadowBlur = 10;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.translate(asteroid.x+asteroid.w/2.0, asteroid.y+asteroid.h/2.0);
    ctx.rotate(asteroid.a);
    asteroid.points.map(point => {
      ctx.lineTo(Math.round(point[0]), Math.round(point[1]));
    });
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }    

  function drawBullet(bullet){
    ctx.fillStyle = bullet.type.color;
    ctx.shadowColor = bullet.type.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(Math.round(bullet.x), Math.round(bullet.y), bulletRadius, 0, 6.283185);
    ctx.fill();
  }

  function drawExplosionSpark(explosionSpark){
    ctxFX.fillStyle = explosionSpark.color;
    ctxFX.beginPath();
    ctxFX.arc(Math.round(explosionSpark.x), Math.round(explosionSpark.y), 1.0, 0, 6.283185);
    ctxFX.fill();
  }

  function drawFragmentationBulletAmmoItem(item){
    ctx.fillStyle = bulletTypes[BULLET_TYPE_FRAGMENTED].color;
    ctx.shadowColor = bulletTypes[BULLET_TYPE_FRAGMENTED].color;
    ctx.shadowBlur = 10;
    var x = Math.round(item.x);
    var y = Math.round(item.y);
    ctx.beginPath();
    ctx.arc(x+5, y+5, bulletRadius, 0, 6.283185);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+20, y+5, bulletRadius, 0, 6.283185);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+12, y+13, bulletRadius, 0, 6.283185);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+5, y+20, bulletRadius, 0, 6.283185);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x+20, y+20, bulletRadius, 0, 6.283185);
    ctx.fill();
    ctx.strokeStyle = bulletTypes[BULLET_TYPE_FRAGMENTED].color;
    ctx.beginPath();
    ctx.arc(x+12, y+12, 18, 0, 6.283185);
    ctx.stroke();
  }

  function drawLifeItem(item){
    ctx.fillStyle = redColor;
    ctx.shadowColor = redColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    var x = Math.round(item.x);
    var y = Math.round(item.y);
    ctx.moveTo(x+18, y);
    ctx.lineTo(x, y+36);
    ctx.lineTo(x+18, y+22);
    ctx.lineTo(x+36, y+36);
    ctx.closePath();
    ctx.fill();
  }

  function drawSpaceship(){
    ctx.save();
    ctx.strokeStyle = turquoiseColor;
    ctx.lineWidth = 1.5;
    ctx.shadowColor = turquoiseColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.translate(Math.round(x)+30, Math.round(y)+30);
    ctx.rotate(rotation);
    ctx.moveTo(0, -30);
    ctx.lineTo(-30, 30);
    ctx.lineTo(0, 15);
    ctx.lineTo(30, 30);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }    

  function drawSpaceshipEngineSpark(engineSpark){
    ctxFX.fillStyle = turquoiseColor;
    ctxFX.beginPath();
    ctxFX.arc(Math.round(engineSpark.x), Math.round(engineSpark.y), 1.0, 0, 6.283185);
    ctxFX.fill();
  }     

  function drawSpaceshipExplosionSpark(explosionSpark){
    ctxFX.fillStyle = turquoiseColor;
    ctxFX.beginPath();
    ctxFX.arc(Math.round(explosionSpark.x), Math.round(explosionSpark.y), 1.0, 0, 6.283185);
    ctxFX.fill();
  }    
  
  function fire(multiply = false){
    if (soundEffectsEnabled)
      playShootSound();
    var bx = x + 30.0;
    var by = y + 30.0;
    if (bulletType.count != undefined){
      bulletType.count--;
      checkAmmo();//////
    }
    generateBullet(bx, by, rotation, multiply);//////
  }   
  
  function gameOver(){
    gameIsOver = true;
    asteroids = [];
    $("#gameOverScreen").show();
    checkScore(displayTopScores);
  }
  
  function generateAsteroid(ax, ay, radius, avx, avy, nbParts, avr){
    var nbEdges = Math.random() * 5 + 5;
    var randomMax = 30.0;
    var points = [];
    var minPX = 999;
    var minPY = 999;
    var maxPX = 0;
    var maxPY = 0;
    for (var i = 0; i < nbEdges; i++){
      var angle = i * Math.PI * 2 / nbEdges;
      var px = (radius + Math.random() * randomMax) * Math.sin(angle);
      var py = -(radius + Math.random() * randomMax) * Math.cos(angle);
      if (px < minPX)
        minPX = px;
      if (py < minPY)
        minPY = py;
      if (px > maxPX)
        maxPX = px;
      if (py > maxPY)
        maxPY = py;
      points.push([px, py]);
    }
    var color = asteroidColorsPerNbParts.find(cp => cp.nbParts == nbParts).color;
    var asteroid = {
      x: ax,
      y: ay,
      w: maxPX - minPX,
      h: maxPY - minPY,
      points: points,
      vx: avx,
      vy: avy,
      vr: avr,
      r: radius,
      a: 0.0,
      nbParts: nbParts,
      color: color,
      linkedToSpaceshipFate: false,
      linkToSpaceshipAge: 0,
      item: undefined,
    };
    asteroids.push(asteroid);          
  }                                        

  function generateBullet(x, y, angle, multiply){
    var bvx = bulletV * Math.sin(angle);
    var bvy = bulletV * -Math.cos(angle);
    bullets.push({
      x: x + bvx,
      y: y + bvy,
      vx: bvx,
      vy: bvy,
      age: 20,
      a: angle,
      type: bulletType,
      multiply: multiply,
    });
  }

  function generateExplosion(ex, ey, c){
    var evMax = 5.0;
    for (var i = 0; i < nbSparks; i++){                    
      var ev = Math.random() * (evMax - 1.0) + 1.0;
      var ea = Math.random() * Math.PI * 2.0;
      var evx = ev * Math.sin(ea);
      var evy = ev * -Math.cos(ea);
      explosionSparks.push({
        x: ex,
        y: ey,
        vx: evx,
        vy: evy,
        age: 20,
        color: c,
      });
    }
  }

  function generateItem(x, y, age, draw, pickup){
    items.push({
      x: x,
      y: y,
      age: age,
      draw: draw,
      pickup: pickup,
    });
  }

  function generateRandomEventsGivenProbabilities(){
    gameEvents.map(gameEvent => {
      var rnd = Math.round(Math.random() * 1.0 / gameEvent.probability);
      if (rnd == 1)
        gameEvent.event();
    });
  }

  function generateSpaceshipEngineFire(){
    var evMax = 5.0;
    for (var i = 0; i < nbSpaceshipEngineSparks; i++){                    
      var ev = Math.random() * (evMax - 1.0) + 1.0;
      var evx = -ev * Math.sin(rotation);
      var evy = -ev * -Math.cos(rotation);
      var angle = rotation + Math.PI;
      spaceshipEngineSparks.push({
        x: x + 30.0 + (Math.random() * 25.0 - 12.5) + 30.0 * Math.sin(angle),
        y: y + 30.0 + (Math.random() * 25.0 - 12.5) + 30.0 * -Math.cos(angle),
        vx: evx,
        vy: evy,
        age: 10
      });
    }
  }         

  function generateSpaceshipExplosion(){
    var evMax = 5.0;
    for (var i = 0; i < nbSpaceshipSparks; i++){                    
      var ev = Math.random() * (evMax - 1.0) + 1.0;
      var ea = Math.random() * 2 * Math.PI;
      var evx = ev * Math.sin(ea);
      var evy = ev * -Math.cos(ea);
      spaceshipExplosionSparks.push({
        x: x,
        y: y,
        vx: evx,
        vy: evy,
        age: 20
      });
    }
  }    

  function getTimeSpan(){
    return performance.now() - startTime - pauseDuration;
  }

  function getTopScores(callback){
    $.ajax({
      type: 'GET',
      url: 'ajax.php?action=getTopScores',
      data: {},
      dataType: 'json',
      success: function(data){
        callback(data);
      }
    });
  }

  function increaseScore(inc){
    score += inc;
    $("#score").html(score);
  }   

  function init(){
    $("#score").html(score);
    toggleSoundEffects();

    $("#game").attr("width", gameWidth);
    $("#game").attr("height", gameHeight);
    $("#effects").attr("width", gameWidth);
    $("#effects").attr("height", gameHeight);

    oscillator = audioContext.createOscillator();
    oscillator.type = 'square';
    oscillator.start(0);
  
    resetGame();
    setInterval(ticks, 50);
  }
  
  function killAsteroid(asteroid){
    var index = asteroids.indexOf(asteroid);
    if (index > -1) {
      asteroids.splice(index, 1);
    };
  }
  
  function linkAsteroidFateToSpaceshipFate(){
    if (asteroids.length > 0){
      var rnd = Math.round(Math.random() * (asteroids.length - 1));
      asteroids[rnd].linkedToSpaceshipFate = true;
      asteroids[rnd].linkToSpaceshipAge = linkToSpaceshipMaxAge;
      displayInfo("An asteroid became linked to you. Destroying it will destroy you.", false);
      setTimeout(function(){ displayInfo("", false); }, 5000);//////
    }
  }
  
  function loadLevel(l){
    justWonLevel = false;
    if (l < levels.length){
      items = [];
      asteroids = [];
      $("#level").html(l + 1);
      levels[l].asteroids.map(asteroid => generateAsteroid(
        asteroid[0],
        asteroid[1],
        asteroid[2],
        asteroid[3],
        asteroid[4],
        asteroid.length > 5 ? asteroid[5] : 2,
        asteroidVRotation
      ));
      resetSpaceship();
      resetTime();
      displayInfo(levels[l].message, false);
    } else if (!won) {
      win();
    } else {
      resetGame();
    }
  }

  function loadNextLevel(){
    loadLevel(++currentLevel);
  }     
  
  function middleOfPlayFieldIsFree(){
    var middleX = gameWidth / 2.0;
    var middleY = gameHeight / 2.0;
    var radius = 100.0;
    var ret = true;
    asteroids.map(asteroid => {
      if (!(middleX+radius < asteroid.x || middleX > asteroid.x + asteroid.w || middleY+radius < asteroid.y || middleY > asteroid.y + asteroid.h)){
        ret = false;
        return;
      }
    });
    return ret;
  }

  function multiplyBullet(bullet){
    for (var i = Math.PI / 8.0; i <= Math.PI * 2.0 + Math.PI / 8.0; i += Math.PI / 4.0){
      generateBullet(bullet.x, bullet.y, i, false);//////
    }
  }

  //////TODO: play a custom sound
  function pickUpFragmentationBulletAmmoItem(item){
    bulletTypes[BULLET_TYPE_FRAGMENTED].count += 5;
    checkAmmo();
    //////
    var index = items.indexOf(item);
    if (index > -1) {
        items.splice(index, 1);
    };
  }

  //////TODO: play a custom sound
  function pickUpLifeItem(item){
    life++;
    updateLife();
    //////
    var index = items.indexOf(item);
    displayInfo("1UP!", false);
    if (index > -1) {
        items.splice(index, 1);
    };
  }

  function playAsteroidExplodeSound() {
    for (var i = 0; i < 20; i++)
      oscillator.frequency.setValueAtTime(70 - i + (i % 2 == 0 ? 50 : 0), audioContext.currentTime+i/100.0);
    oscillator.connect(audioContext.destination);
    setTimeout(function(){
      oscillator.disconnect();
    }, 200);
  }

  function playItemPickUpSound(){
    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime + (1.0/10.0));
    oscillator.connect(audioContext.destination);
    setTimeout(function(){
      oscillator.disconnect();
    }, 200);
  }

  function playShootSound() {
    for (var i = 0; i < 10; i++)
      oscillator.frequency.setValueAtTime(200-i*10, audioContext.currentTime+i/100.0);
    oscillator.connect(audioContext.destination);
    setTimeout(function(){
      oscillator.disconnect();
    }, 100);
  } 
  
  function playSpaceshipExplodeSound() {
    for (var i = 0; i < 20; i++)
      oscillator.frequency.setValueAtTime(100 - i*2 + (i % 2 == 0 ? 50 : 0), audioContext.currentTime+i/100.0);
    oscillator.connect(audioContext.destination);
    setTimeout(function(){
      oscillator.disconnect();
    }, 200);
  } 

  function refreshAsteroids(){
    asteroids.map(asteroid => {
      asteroid.a += asteroid.vr;
      var halfRadius = asteroid.r / 2.0;
      if (asteroid.x + halfRadius > gameWidth)
        asteroid.x = -halfRadius;
      else if (asteroid.x + halfRadius < 0)
        asteroid.x = gameWidth - halfRadius;
      if (asteroid.y + halfRadius > gameHeight)
        asteroid.y = -halfRadius;
      else if (asteroid.y + halfRadius < 0)
        asteroid.y = gameHeight - halfRadius;
      asteroid.x += asteroid.vx;
      asteroid.y += asteroid.vy;
      if (asteroid.linkedToSpaceshipFate){
        asteroid.linkToSpaceshipAge--;
        asteroid.linkedToSpaceshipFate = (asteroid.linkToSpaceshipAge > 0);
      }
      drawAsteroid(asteroid);
      if (!dead && spaceshipIsInTheAsteroid(asteroid)){
        die();
      }
    });
  }

  function refreshBullets(){
    var i = 0;
    bullets.map(bullet => {
      asteroids.map(asteroid => {
        if (bulletIsInTheAsteroid(bullet, asteroid)){
          if (asteroid.item != undefined){
            generateItem(asteroid.x, asteroid.y, asteroid.item.age, asteroid.item.draw, asteroid.item.pickup);
          }
          if (asteroid.linkedToSpaceshipFate){
            die();
          } else {
            if (currentLevel == 0 && !firstAsteroidShot){
              firstAsteroidShot = true;
              displayInfo("Good job! You got it!");
            }
            increaseScore(scoreIncreaseForAsteroidHit);
          }         
          if (bullet.type == bulletTypes[BULLET_TYPE_FRAGMENTED] && bullet.multiply){
            multiplyBullet(bullet);
          } 
          bullet.age = 0;
          var astCX = asteroid.x + asteroid.w / 2.0;
          var astCY = asteroid.y + asteroid.h / 2.0;
          if (soundEffectsEnabled)
            playAsteroidExplodeSound();
          generateExplosion(astCX, astCY, asteroid.color);
          if (asteroid.r >= minAsteroidRadius)
            splitAsteroid(asteroid, bullet.a);
          else {
            killAsteroid(asteroid);
            if (asteroids.length == 1 && asteroids[0].r < minAsteroidRadius + 2){
              displayRandomInfo(lastAsteroidMessages, false);
            }
          }
        }
      });
      if (bullet.age <= 0 && i > -1){
        bullets.splice(i, 1);
      } else {
        bullet.age--;
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        drawBullet(bullet);
      }
      i++;
    });
  }

  function refreshExplosionSparks(){
    if (explosionSparks.length > 0){
      var i = 0;
      explosionSparks.map(explosionSpark => {
        if (explosionSpark.age < 0 && i > -1){
          explosionSparks.splice(i, 1);
        } else {
          explosionSpark.x += explosionSpark.vx;
          explosionSpark.y += explosionSpark.vy;
          drawExplosionSpark(explosionSpark);
        }
        explosionSpark.age--;
        i++;
      });
    }
  }  

  function refreshItems(){
    if (items.length > 0){
      var i = 0;
      items.map(item => {
        if (item.age < 0 && i > -1){
          items.splice(i, 1);
        } else {
          item.y -= 2.0 * Math.sin(item.age);
          if (item.age >= 30 || item.age < 30 && item.age % 2 == 0)
            item.draw(item);
        }
        item.age--;
        i++;
        if (!dead && spaceshipIsInTheItem(item)){
          if (soundEffectsEnabled)
            playItemPickUpSound();//////
          item.pickup(item);
        }
      });
    }
  }

  function refreshSpaceshipEngineSparks(){
    var i = 0;
    spaceshipEngineSparks.map(engineSpark => {
      if (engineSpark.age < 0 && i > -1){
        spaceshipEngineSparks.splice(i, 1);
      } else {
        engineSpark.x += engineSpark.vx;
        engineSpark.y += engineSpark.vy;
        drawSpaceshipEngineSpark(engineSpark);
      }
      engineSpark.age--;
      i++;
    });
  }   

  function refreshSpaceshipExplosionSparks(){
    var i = 0;
    spaceshipExplosionSparks.map(explosionSpark => {
      if (explosionSpark.age < 0 && i > -1){
        spaceshipExplosionSparks.splice(i, 1);
      } else {
        explosionSpark.x += explosionSpark.vx;
        explosionSpark.y += explosionSpark.vy;
        drawSpaceshipExplosionSpark(explosionSpark);
      }
      explosionSpark.age--;
      i++;
    });
  }    

  function resetGame(){
    justWonLevel = false;
    $("#gameOverScreen").hide();
    $("#topScoresScreen").hide();
    setScore(0);
    dead = false;
    won = false;
    gameIsOver = false;
    life = maxLife;
    firstAsteroidShot = false;
    updateLife();
    currentLevel = -1;
    loadNextLevel();
    updateAmmoType();
  }

  function resetSpaceship(){
    dead = false;
    x = gameWidth / 2.0;
    y = gameHeight / 2.0;
    v = 0.0;
    rotation = 0.0;
    keyUpIsDown = false;
    keyLeftIsDown = false;
    keyRightIsDown = false;
    bulletType = bulletTypes[BULLET_TYPE_NORMAL];
    updateAmmoType();
  }   
  
  function resetTime(){
    startTime = performance.now();
  }

  function setScore(scr){
    score = scr;
    $("#score").html(score);
  }

  function saveNewTopScores(topScores, callback){
    $.ajax({
      type: 'POST',
      url: 'ajax.php?action=saveTopScores',
      data: { topScores: JSON.stringify(topScores) },
      dataType: 'json',
      success: callback
    });      
  }
  
  function spaceshipIsInTheAsteroid(asteroid){
    if (x+60 < asteroid.x || x > asteroid.x + asteroid.w || y+60 < asteroid.y || y > asteroid.y + asteroid.h)
      return false;
    return true;
  }

  function spaceshipIsInTheItem(item){
    if (x+60 < item.x || x > item.x + 36 || y+60 < item.y || y > item.y + 36)
      return false;
    return true;
  }

  /*              
                    \/
                    /
             ____  /
            /    \*
           |      | 
            \____/

  */
  function splitAsteroid(asteroid, bulletAngle){
    var angle, avx, avy, distX, distY, c, div;

    div = 2.0 * Math.round(asteroid.nbParts / 2.0);

    c = 0;
    for (var i = 0; i < Math.round(asteroid.nbParts / 2); i++){
      angle = bulletAngle - Math.PI / 2.0 - (c * Math.PI / div);
      avx = Math.abs(vFactor * asteroid.vx) * Math.sin(angle);
      avy = Math.abs(vFactor * asteroid.vy) * -Math.cos(angle);
      distX = asteroid.w / 2.0 * Math.sin(angle);
      distY = asteroid.h / 2.0 * -Math.cos(angle);
      generateAsteroid(asteroid.x + distX, asteroid.y + distY, asteroid.r / 2.0, avx, avy, asteroid.nbParts, asteroid.vr * vFactor);
      if (c >= 0)
        c = -(++c);
      else
        c = -c;
    }

    c = 0;
    for (var i = 0; i < Math.round(asteroid.nbParts / 2); i++){
      angle = bulletAngle + Math.PI / 2.0 + (c * Math.PI / div);
      avx = Math.abs(vFactor * asteroid.vx) * Math.sin(angle);
      avy = Math.abs(vFactor * asteroid.vy) * -Math.cos(angle);
      distX = asteroid.w / 2.0 * Math.sin(angle);
      distY = asteroid.h / 2.0 * -Math.cos(angle);
      generateAsteroid(asteroid.x + distX, asteroid.y + distY, asteroid.r / 2.0, avx, avy, asteroid.nbParts, asteroid.vr * vFactor);
      if (c >= 0)
        c = -(++c);
      else
        c = -c;
    }

    var index = asteroids.indexOf(asteroid);
    if (index > -1) {
        asteroids.splice(index, 1);
    };
  }     

  function ticks(){
    if (gameIsPaused || justWonLevel)
      return;

    ctxFX.clearRect(0, 0, gameWidth, gameHeight);
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    if (!dead && !won){
      if (keyUpIsDown && v <= maxV){
        v++;          
        x += Math.sin(rotation) * v; 
        y += -Math.cos(rotation) * v;         
      } else if (v > 0){
        v--;     
        x += Math.sin(rotation) * v; 
        y += -Math.cos(rotation) * v;                 
      }

      if (v > 0.0)
        generateSpaceshipEngineFire();

      if (keyLeftIsDown)
        rotation -= maxVR;
      else if (keyRightIsDown)
        rotation += maxVR;

      if (x + 100 > gameWidth)
        x = -100;
      else if (x + 100 < 0)
        x = gameWidth - 100;

      if (y + 30 > gameHeight)
        y = -30;
      else if (y + 30 < 0)
        y = gameHeight - 30;

      generateRandomEventsGivenProbabilities();
      refreshSpaceshipEngineSparks();
      drawSpaceship();
    } else {
      refreshSpaceshipExplosionSparks();

      if (spaceshipExplosionSparks.length == 0 && !gameIsOver && middleOfPlayFieldIsFree()){
        $("#info").html("");
        resetSpaceship();
      }
    }

    updateTime();
    refreshBullets();
    refreshExplosionSparks();
    refreshAsteroids();
    refreshItems();

    if (!dead && !won && asteroids.length == 0){
      justWonLevel = true;
      var duration = getTimeSpan();
      setTimeout(function(){
        displayRandomInfo(levelWonMessages, false);
      }, 500);
      increaseScore(scoreIncreaseForLevelWon);
      setTimeout(function(){
        calculateBonusBasedOnTimeSpent(duration);
      }, 1000);
      setTimeout(loadNextLevel, 3000);
    }
  }  

  function togglePause(){
    if (!gameIsPaused){
      gameIsPaused = true;
      pauseStart = performance.now();
      $("#pauseScreen").show();
    } else {
      gameIsPaused = false;
      pauseDuration += performance.now() - pauseStart;
      $("#pauseScreen").hide();
    }
  }

  function toggleSoundEffects(){
    soundEffectsEnabled = $("#soundEffectEnabled").is(":checked");
  }

  function updateAmmoType(){
    if (bulletType.count == undefined)
      $("#ammoType").html(`${bulletType.name}`);
    else
      $("#ammoType").html(`${bulletType.name} - ${bulletType.count}`);
  }

  function updateLife(){
    var lifeStr = "";
    for (var i = 0; i < life; i++)
        lifeStr = `${lifeStr}&#11165;`;
    $("#life").html(lifeStr);
  }
  
  ////// TODO: adapt score accordingly
  function updateTime(){
    var timeSpan = getTimeSpan();
    var seconds = timeSpan / 1000.0;
    var minutes = Math.floor(seconds / 60.0);
    seconds = Math.floor(seconds % 60);
    time.innerHTML = `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  ////// TO CONTINUE
  function win(){
    won = true;
    checkScore(displayTopScores);
  }


// INITIALIZATION =================================================================================================
  init();

  /*var start = null;
  function step(timestamp) {
    ticks();
    window.requestAnimationFrame(step);
  }
  window.requestAnimationFrame(step);*/


// EVENTS =========================================================================================================
  $("body").keydown(function(evt){
    if (gameIsPaused)
      return;

    if (evt.which == 38)
      keyUpIsDown = true;
    else if (evt.which == 37)
      keyLeftIsDown = true;
    else if (evt.which == 39) 
      keyRightIsDown = true;
  });

  $("body").keyup(function(evt){
    if (evt.which == 80)
      togglePause();

    if (gameIsPaused)
      return;

    if (evt.which == 38)
      keyUpIsDown = false;
    else if (evt.which == 37)
      keyLeftIsDown = false;
    else if (evt.which == 39)
      keyRightIsDown = false;
    else if (evt.which == 32 && !dead){
      var multiply = (bulletType == bulletTypes[BULLET_TYPE_FRAGMENTED]);
      fire(multiply);
    } else if (evt.which == 67 && canChangeAmmo)
      changeAmmo();
  });

  $(".linkPlayAgain").click(resetGame);   

  $("#soundEffectEnabled").change(toggleSoundEffects);
});