// our javascript code



/****************************************************
 *** Variables ***
 ****************************************************/

// important HTML blocks
let container = document.querySelector("#game");
let player = document.querySelector("#player");
let ground = document.querySelector("#ground");
let enemies = document.querySelector("#enemies");
let lasers = document.querySelector("#lasers");
let explosion = document.querySelector("#explosion");
let score = document.querySelector("#score");
let controls = document.querySelector("#controls");

// some parameters
// minimal margin to the bottom (in pixels)
let marginBottom = 100;
// plane jump speed (in seconds)
let jumpSpeed = 0.5;
// how much height is a jump (in pixels)
let jumpStep = 100;

// how long is a fall (in seconds)
let fallSpeed = 3;
// how much time after a jump do we fall (in milliseconds)
let timeToFallAfterJump = 400;

// delay between two enemies motion (in milliseconds)
let motionDelay = 7;
// motion distance at each step (in pixels)
let motionStep = 3;

// motion step for player left and right
let motionStepPlayer = 50;

// delay between lasers shots
let delay = 100;

// other variables
let spawn, motion, playerGravity, laserMotion, leftPosition;

let LastShoot = 0;

let musicIntro;
musicIntro = new Audio("music_intro.mp3");

let musicGame;
musicGame = new Audio("music_game.mp3");

let musicGameOver;
musicGameOver = new Audio("game_over.mp3");

let sfxBoom;
sfxBoom = new Audio("explosion.mp3");

let scorePlayer;

/****************************************************
 *** When game starts ***
 ****************************************************/

musicIntro.play();
musicIntro.volume = 0.6;
musicIntro.loop = true;

player.style.display = "none";
explosion.style.display = "none";
score.style.display = "none";
controls.style.display = "none";


function startGame(){
  
  // remove all enemies
  let elements = document.getElementsByClassName("eagle");
  if (elements.length != 0) {
    while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
    }
  }

  let elements_bigship = document.getElementsByClassName("bigship");
  if (elements_bigship.length != 0) {
    while(elements_bigship.length > 0){
      elements_bigship[0].parentNode.removeChild(elements_bigship[0]);
    }
  }
  

  // hide Game Over message
  document.querySelector("#game-over").style.display = "none";

  // show controls for 3.5 seconds
  controls.style.display = "block";
  let timeoutControls = setTimeout(hideControls, 3500);
  

  // make player appear & explosion disapear & score appear
  scorePlayer = 0;
  player.style.display = "block";
  explosion.style.display = "none";
  score.style.display = "flex";

  // enemy motion
  motion = setInterval(function() {
    document.querySelectorAll("#enemies > .eagle, #enemies > .bigship").forEach(function(div) {
      move(div);
    });
  }, motionDelay);

  // laser motion
  laserMotion = setInterval(function() {
    document.querySelectorAll("#lasers > .laser").forEach(function(divLaser) {
      moveLaser(divLaser);
    });
  }, motionDelay);

  // player gravity
  // make the player fall
  // change the player bottom margin
  // 'px' is the unit (=pixels)
  // thanks to the CSS 'transition' rule,
  // the fall is progressive
  player.style.bottom = marginBottom + "px";

  // invoke an enemy
  spawnEnemy();

  // activate jump and shoot mechanics
  document.addEventListener('keydown', (e) => {
    if (e.code === "Space") jump();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === "ArrowLeft") playerLeft();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === "ArrowRight") playerRight();
  });


  document.addEventListener('keydown', (e) => {
    if (e.code === "Enter") shoot();
  });

  //Hide the game start menu
  document.querySelector("#game-start").style.display = "none";

  //Show the player
  player.style.display = "block";
  player.style.left = "400px";
  player.style.bottom = "100px";

  //Stop intro music and play game music
  musicGameOver.pause();
  musicIntro.pause();
  musicGame.load();
  musicGame.play();
  musicGame.volume = 0.1;
  musicGame.loop = true;

}
/****************************************************
 *** Functions ***
 ****************************************************/

// hide controls
function hideControls() {
  controls.style.display = "none";
}

// make the player jump
function jump() {
  // if we are on the top, don't jump anymore
  if (player.offsetTop < 50) return;

  // set the jump duration
  // as we use the CSS animation
  player.style.transition = jumpSpeed + "s";
  // the CSS animation is described in the 'fallingPlayer' class
  player.classList.remove("fallingPlayer");

  // if we jump, we stop the gravity fall
  clearInterval(playerGravity);

  // and then update the player position
  let offsetBottom =
    container.offsetHeight - (player.offsetTop + player.offsetHeight);
  player.style.bottom = offsetBottom + jumpStep + "px";

  // after we have jumped, we fall again (gravity)
  setGravity();
}

// make the player move left
function playerLeft() {
  if (player.offsetLeft <= 50){
    return;
  }

  player.style.left = player.offsetLeft - motionStepPlayer + "px";

}

// make the player move right
function playerRight() {
  if ((window.innerWidth - player.getBoundingClientRect().right) <= 0){
    return;
  }

  player.style.left = player.offsetLeft + motionStepPlayer + "px";

}

// make the player fall after a jump
function setGravity() {
  playerGravity = setTimeout(function() {
    player.style.transition = fallSpeed + "s";
    player.style.bottom = marginBottom + "px";
  }, timeToFallAfterJump);
}

function getPosition(div) {
  let left = div.offsetLeft;
  let top = div.offsetTop;
  let right = div.offsetLeft + div.offsetWidth;
  let bottom = div.offsetTop + div.offsetHeight;

  // the '10' here is to allow some tolerance in the collision
  return [left + 10, right - 10, top + 10, bottom - 10];
}

// check if there is a collision between two blocks
function isCollision(bloc1, bloc2) {
  return !(
    bloc1[1] < bloc2[0] ||
    bloc1[0] > bloc2[1] ||
    bloc1[3] < bloc2[2] ||
    bloc1[2] > bloc2[3]
  );
}

// Get random number
function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; 
}

// spawn a new enemy HTML block
function spawnEnemy() {
  let newObstacle = document.createElement("div");
  let enemiesType = random(0,21);

  if (enemiesType == 20) {
    newObstacle.classList.add("bigship");
    newObstacle.style.bottom = random(100, 600) + "px";
    enemies.appendChild(newObstacle);
  } else {
  newObstacle.classList.add("eagle");
  newObstacle.style.bottom = random(100, 600) + "px";
  enemies.appendChild(newObstacle);
  }

  spawn = setTimeout(spawnEnemy, random(600,2000));
}

// move an enemy
// this function is called for each enemy step
// see the setInterval above
function move(div) {
  div.style.left = div.offsetLeft - motionStep + "px";

  if (div.offsetLeft <= 0){
    div.remove();
  }

  let posPlayer = getPosition(player);
  let posObs = getPosition(div);

  if (isCollision(posPlayer, posObs)){
    explosion.style.display = "block";
    let posExplosion = posPlayer[2] - 10;
    let posExplosionV = posPlayer[0] - 10;
    explosion.style.top = posExplosion + "px";
    explosion.style.left = posExplosionV + "px";
    sfxBoom.load();
    sfxBoom.play();
    sfxBoom.volume = 0.5;
    stopAll();
  }
}

function shoot() {
  if (LastShoot >= (Date.now() - delay)) {
    return;
  }
  LastShoot = Date.now();

  let newLaser = document.createElement("div");
  let posPlayer = getPosition(player);

  newLaser.classList.add("laser");
  newLaser.style.top = posPlayer[2] + 25 + "px";
  newLaser.style.left = posPlayer[0] + "px";
  lasers.appendChild(newLaser);
}

function moveLaser(divLaser) {
  divLaser.style.left = divLaser.offsetLeft + motionStep + "px";

  if ((window.innerWidth - divLaser.getBoundingClientRect().right) <= 0){
    divLaser.remove();
  }
 
  document.querySelectorAll("#enemies > .eagle, #enemies > .bigship").forEach(function(div) {
    let posLaser = getPosition(divLaser);
    let posObs = getPosition(div);
    
    if (isCollision(posLaser, posObs)){
      div.remove();
      scorePlayer ++;
      document.getElementById("score").innerHTML = scorePlayer;
    }
  });
}


// allow to stop the game
function stopAll() {
  // Stop music
  musicGame.pause();

  // game over sound
  musicGameOver.load();
  musicGameOver.play();
  musicGameOver.volume = 0.1;

  // hide the player, the controls and the score
  player.style.display = "none";
  score.style.display = "none";
  controls.style.display = "none";

  // stop the enemies & laser motion
  clearInterval(motion);
  clearInterval(laserMotion);

  // stop to spawn new enemies
  clearTimeout(spawn);

  // game Over message
  document.getElementById("game_score").innerHTML = "Score : <span class='score_number'>" + scorePlayer + "</span>";
  document.querySelector("#game-over").style.display = "flex";

  // remove lasers
  document.querySelectorAll("#lasers > .laser").forEach(function(divLaser) {
    divLaser.remove();
  });
  
}
