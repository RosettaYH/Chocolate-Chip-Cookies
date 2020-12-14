const healthProgress = document.querySelector("#healthProgress");
const decoyProgress = document.querySelector("#decoyProgress");
const scaleFactor = 2.5;

let jarField = {};

let isPlaying = false;

function setup() {
  game.initialize();
  jarField = {
    start: jarImage.width / scaleFactor,
    end: jarImage.width * scaleFactor + jarImage.width / scaleFactor
  };
  socket = io.connect("https://cmsi-185-hw6.glitch.me/");
  socket.on("player", updatePlayer);
  socket.on("decoy", updateDecoy);
  socket.on("enemies", updateEnemies);
}

function draw() {
  socket.emit("enemies", game.getEnemies());
  game.update("");
}

function updatePlayer(data) {
  console.log("player" + data);
  game.update(data);
}

function updateDecoy(data) {
  game.mouseClicked(data);
}

function updateEnemies(data) {
  console.log(data);
  game.setEnemies(data);
}

function mouseMoved() {
  game.mouseMoved();
  game.didHit();
  socket.emit("player", { x: mouseX, y: mouseY });
}

function mouseClicked() {
  if (isPlaying) {
    game.mouseClicked("");
    socket.emit("decoy", { x: mouseX, y: mouseY });
  } else {
    const mouseInsideCanvas =
      mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
    if (mouseInsideCanvas) {
      game.restart();
    }
  }
}

function scaleGameImage(gameImage, scale, x, y) {
  image(
    gameImage,
    x - gameImage.width / scale,
    y - gameImage.width / scale,
    gameImage.width / (scale / 2),
    gameImage.width / (scale / 2)
  );
}

class Field {
  constructor(width, height, color) {
    Object.assign(this, { width, height, color });
  }
  clear() {
    background(this.color);
    image(
      jarImage,
      jarImage.width / scaleFactor,
      jarImage.height / 8,
      jarImage.width * scaleFactor,
      jarImage.height * 2
    );
    fill("rgba(231, 244, 250, 0.5)");
    rect(
      jarImage.width / scaleFactor,
      jarImage.width / scaleFactor,
      jarImage.width * scaleFactor,
      jarImage.width * scaleFactor,
      160
    );
  }
  clamp(x, y) {
    return {
      x: constrain(x, this.width, this.height),
      y: constrain(y, this.width, this.height)
    };
  }
}

class Agent {
  constructor(x, y, speed, target, diameter) {
    Object.assign(this, { x, y, speed, target, diameter });
  }
  move(field) {
    const [dx, dy] = [this.target.x - this.x, this.target.y - this.y];
    const distance = Math.hypot(dx, dy);
    if (distance > 1) {
      const step = this.speed / distance;
      Object.assign(this, field.clamp(this.x + step * dx, this.y + step * dy));
    }
  }
}

class Player extends Agent {
  draw() {
    scaleGameImage(plainCookieImage, 4, this.x, this.y);
  }
}

class Enemy extends Agent {
  draw() {
    scaleGameImage(chocolateChipImage, 4, this.x, this.y);
  }
}

class Decoy {
  constructor(x, y, diameter) {
    Object.assign(this, { x, y, diameter });

    this.exists = false;
    this.initialFrameCount = undefined;
    this.needsCoolDown = false;
    this.screenTime = 300;
    this.coolDown = this.screenTime + 300;
    this.coolDownInitialFrameCount = 0;
  }
  draw() {
    scaleGameImage(darkChocolateCookieImage, 4, this.x, this.y);
  }
  handleExistingDecoy() {
    if (this.exists && frameCount < this.initialFrameCount + this.screenTime) {
      this.draw();

      this.needsCoolDown = true;
    } else if (
      this.exists &&
      frameCount > this.initialFrameCount + this.screenTime
    ) {
      this.exists = false;
      this.coolDownInitialFrameCount = frameCount;
      for (let agent of [...game.enemies]) {
        agent.target = game.player;
      }
    } else if (!this.exists && this.needsCoolDown) {
      const decoyWidth = (frameCount - this.coolDownInitialFrameCount) / 3;
      decoyProgress.style.width = decoyWidth + "%";
      decoyProgress.textContent = "";
    } else if (!this.exists && !this.needsCoolDown) {
      decoyProgress.textContent = "Click to Drop a Decoy";
      decoyProgress.style.width = "100%";
    }
  }
  handleCoolDown() {
    if (
      this.needsCoolDown &&
      frameCount > this.initialFrameCount + this.coolDown
    ) {
      this.needsCoolDown = false;
    }
  }
}

class Boost {
  constructor(x, y, diameter) {
    Object.assign(this, { x, y, diameter });
  }
  draw() {
    scaleGameImage(sugarImage, 12, this.x, this.y);
  }
}

const game = {
  initialize() {
    const canvas = createCanvas(900, 800);
    canvas.parent("sketch");
    noStroke();
    
    this.field = new Field(jarField.start, jarField.end, [135, 200, 230]);
    this.mouse = { x: jarField.end / 2, y: jarField.end / 2 };
    
    this.players = [];
    this.player = new Player(
      jarField.end / 2,
      jarField.end / 2,
      5,
      this.mouse,
      80
    );
    this.players.push(this.player);
    if (mode === 2) {
      this.otherMouse = { x: 0, y: 0 };
      this.otherPlayer = new Player(
        jarField.end / 2,
        jarField.end / 2,
        5,
        this.otherMouse,
        80
      );
      this.players.push(this.otherPlayer);
    }
    
    this.enemiesNumber = 3 * level;
    this.enemies = [];
    for (let i = 0; i < this.enemiesNumber; i++) {
      this.enemies.push(
        new Enemy(
          random(jarField.start, jarField.end),
          random(jarField.start, jarField.end),
          random(1, 2),
          this.player,
          40
        )
      );
    }

    this.decoy = {};
    decoyProgress.style.width = "100%";
    decoyProgress.textContent = "Click to Drop a Decoy";

    this.boostExists = false;
    this.boost = {};
    this.boostHit = false;

    this.hit = false;
    this.hitScore = 100;
    this.healthPerHit = 10;
    this.maxHealth = 100;
    healthProgress.style.width = this.hitScore + "%";
    healthProgress.textContent = this.hitScore + "%";
    healthProgress.style.backgroundColor = color(40, 167, 69);

    totalSeconds = 0;
    isPlaying = true;
  },

  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY });
  },

  update(playerOtherData) {
    this.field.clear();

    if (level === 0) {
      textFont("Nerko One");
      fill(89, 63, 40);
      textSize(110);
      text("↑Pick a Level↑", jarField.start, jarField.end / 2);
    } else if (mode === 0) {
      fill(191, 98, 15);
      text("↑Pick a Mode↑", jarField.start, jarField.end / 2);
    } else {
      if (isPlaying) {
        if (Object.keys(this.decoy).length > 0) {
          this.decoy.handleCoolDown();
          this.decoy.handleExistingDecoy();
        }
        for (let agent of [...this.players, ...this.enemies]) {
          agent.move(this.field);
          agent.draw();
        }
      }
    }
    if (playerOtherData !== "") {
      Object.assign(this.otherMouse, playerOtherData);
      console.log(this.otherMouse);
    }
    game.didBoost();
    game.checkEnemyCollision();
    game.checkDecoyCollision();
    game.gameOver();
  },
  
  didHit() {
    for (let enemy of this.enemies) {
      let numHit = 0;
      this.hit = collideCircleCircle(
        this.player.x,
        this.player.y,
        this.player.diameter,
        enemy.x,
        enemy.y,
        enemy.diameter
      );
      if (this.hit) {
        numHit += 1;
      }
      if (this.hit && numHit === 1 && this.hitScore > 0) {
        this.hitScore -= 1;
        if (this.hitScore <= 10) {
          healthProgress.style.backgroundColor = color(220, 53, 69);
        } else {
          healthProgress.style.backgroundColor = color(40, 167, 69);
        }
        healthProgress.style.width = this.hitScore + "%";
        healthProgress.textContent = this.hitScore + "%";
        numHit = 0;
      }
    }
  },

  didBoost() {
    let numHit = 0;
    if (frameCount % (300 * level) === 0 && isPlaying) {
      this.boost = new Boost(
        random(jarField.start, jarField.end),
        random(jarField.start, jarField.end),
        80
      );
      this.boostExists = true;
    }
    if (this.boostExists) {
      this.boostHit = collideCircleCircle(
        this.player.x,
        this.player.y,
        this.player.diameter,
        this.boost.x,
        this.boost.y,
        this.boost.diameter
      );
      if (this.boostHit) {
        numHit += 1;
      }
      this.boost.draw();
    }
    if (this.boostHit && numHit === 1) {
      if (this.hitScore < this.maxHealth) {
        this.hitScore += this.healthPerHit;
        if (this.hitScore > this.maxHealth) {
          this.hitScore = this.maxHealth;
        }
        if (this.hitScore <= 10) {
          healthProgress.style.backgroundColor = color(220, 53, 69);
        } else {
          healthProgress.style.backgroundColor = color(40, 167, 69);
        }
        healthProgress.style.width = this.hitScore + "%";
        healthProgress.textContent = this.hitScore + "%";
      }

      this.boostExists = false;
    }
  },
  
  checkEnemyCollision() {
    for (let enemy of this.enemies) {
      for (let nextEnemy of this.enemies) {
        if (
          collideCircleCircle(
            enemy.x,
            enemy.y,
            enemy.diameter,
            nextEnemy.x,
            nextEnemy.y,
            nextEnemy.diameter
          )
        ) {
          this.adjustEnemies(enemy, nextEnemy);
        }
      }
    }
  },

  adjustEnemies(enemy1, enemy2) {
    let adjustment = 0.5;
    if (enemy1.x > enemy2.x) {
      enemy1.x += adjustment;
      enemy2.x -= adjustment;
    } else if (enemy2.x > enemy1.x) {
      enemy1.x -= adjustment;
      enemy2.x += adjustment;
    } else if (enemy1.y > enemy2.y) {
      enemy1.y += adjustment;
      enemy2.y -= adjustment;
    } else {
      enemy1.y -= adjustment;
      enemy2.y += adjustment;
    }
  },
  
  setDecoy(decoyData) {
    if (
      mouseX >= jarField.start &&
      mouseX <= jarField.end &&
      mouseY >= jarField.start &&
      mouseY <= jarField.end
    ) {
      if (!this.decoy.needsCoolDown && !this.decoy.exists && level !== 0) {
        if (decoyData !== "") {
          console.log(decoyData);
          this.decoy = new Decoy(decoyData.x, decoyData.x, 50);
        } else {
          this.decoy = new Decoy(mouseX, mouseY, 50);
        }

        this.decoy.initialFrameCount = frameCount;
        this.decoy.needsCoolDown = true;
        this.decoy.exists = true;
        decoyProgress.style.width = "0%";
        for (let agent of [...this.enemies]) {
          agent.target = this.decoy;
        }
      }
    }
  },
  
  checkDecoyCollision() {
    if (this.decoy.exists) {
      for (let i = 0; i < this.enemies.length; i++) {
        if (
          collideCircleCircle(
            this.enemies[i].x,
            this.enemies[i].y,
            this.enemies[i].diameter,
            this.decoy.x,
            this.decoy.y,
            this.decoy.diameter
          )
        ) {
          this.hoverEnemy(this.enemies[i], this.enemies[i].speed);
        }
      }
    }
  },
  
  hoverEnemy(enemy, speed) {
    let adjustment = 1;
    enemy.x += adjustment;
    enemy.y += adjustment;
  },
 
  mouseClicked(decoyData) {
    game.setDecoy(decoyData);
  },
 
  gameOver() {
    if (this.hitScore <= 0) {
      image(
        chocolateChipCookieImage,
        this.player.x - chocolateChipCookieImage.width / 2,
        this.player.y - chocolateChipCookieImage.height / 2,
        chocolateChipCookieImage.width,
        chocolateChipCookieImage.height
      );
      rect(0, 0, width, height);
      textFont("Nerko One");
      fill(89, 63, 40);
      textSize(200);
      text("Game Over", width / 30, height / 2);
      fill(191, 98, 15);
      textSize(100);
      text(
        minutesLabel.textContent + ":" + secondsLabel.textContent,
        jarField.end / 2.2,
        jarField.end / 3.5
      );
      textSize(60);
      text("Click to Restart", jarField.end / 2.9, jarField.end / 1.5);
      isPlaying = false;
    }
  },
  
  restart() {
    game.initialize();
  },
 
  getEnemies() {
    return this.enemies;
  },
  
  setEnemies(data) {
    console.log(data);
  }
};
