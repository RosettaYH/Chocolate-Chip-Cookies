const healthProgress = document.querySelector("#healthProgress");
const decoyProgress = document.querySelector("#decoyProgress");

let jarField = {};

let isPlaying = false;

function setup() {
  game.initialize();
  jarField = {
    start: jarImage.width / 2.5,
    end: jarImage.width * 2.5 + jarImage.width / 2.5
  };
}

function draw() {
  game.update();
  game.didBoost();
  game.checkEnemyCollision();
  game.gameOver();
}

function mouseMoved() {
  game.mouseMoved();
  game.didHit();
}

function mouseClicked() {
  if (isPlaying) {
    game.mouseClicked();
  } else {
    game.restart();
  }
}

class Field {
  constructor(width, height, color) {
    Object.assign(this, { width, height, color });
  }
  clear() {
    // Move only inside jar
    background(this.color);
    image(
      jarImage,
      jarImage.width / 2.5,
      jarImage.height / 8,
      jarImage.width * 2.5,
      jarImage.height * 2
    );
    fill("rgba(231, 244, 250, 0.5)");
    rect(
      jarImage.width / 2.5,
      jarImage.width / 2.5,
      jarImage.width * 2.5,
      jarImage.width * 2.5,
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
  constructor(x, y, speed, target) {
    Object.assign(this, { x, y, speed, target });
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
    image(
      plainCookieImage,
      this.x - plainCookieImage.width / 4,
      this.y - plainCookieImage.height / 4,
      plainCookieImage.width / 2,
      plainCookieImage.height / 2
    );
  }
}

class Enemy extends Agent {
  draw() {
    image(
      chocolateImage,
      this.x - chocolateImage.width / 4,
      this.y - chocolateImage.height / 4,
      chocolateImage.width / 2,
      chocolateImage.height / 2
    );
    //ellipse(this.x, this.y, 40);
  }
}

class Decoy {
  constructor(x, y) {
    Object.assign(this, { x, y });
    this.exists = false;
    this.initialFrameCount = undefined;
    this.needsCoolDown = false;
    this.screenTime = 300;
    this.coolDown = this.screenTime + 300;
  }
  draw() {
    image(
      darkChocolateCookieImage,
      this.x - darkChocolateCookieImage.width / 4,
      this.y - darkChocolateCookieImage.height / 4,
      darkChocolateCookieImage.width / 2,
      darkChocolateCookieImage.height / 2
    );
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
      for (let agent of [...game.enemies]) {
        agent.target = game.player;
      }
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
  constructor(x, y) {
    Object.assign(this, { x, y });
  }
  draw() {
    //console.log("drew");
    image(
      sugarImage,
      this.x - sugarImage.width / 12,
      this.y - sugarImage.height / 12,
      sugarImage.width / 6,
      sugarImage.height / 6
    );
    //ellipse(this.x, this.y, 80);
  }
}

const game = {
  initialize() {
    const canvas = createCanvas(900, 800);
    canvas.parent("sketch");
    noStroke();
    this.field = new Field(jarField.start, jarField.end, [135, 200, 230]);
    healthProgress.style.backgroundColor = color(40, 167, 69);

    this.mouse = { x: 0, y: 0 };
    this.player = new Player(jarField.end / 2, jarField.end / 2, 5, this.mouse);
    this.enemiesNumber = 3 * level;
    this.enemies = [];
    for (let i = 0; i < this.enemiesNumber; i++) {
      this.enemies.push(
        new Enemy(
          random(jarField.start, jarField.end),
          random(jarField.start, jarField.end),
          random(1, 2),
          this.player
        )
      );
    }
    this.decoy = {};

    this.boostExists = false;
    this.boost = {};
    this.boostHit = false;

    this.hit = false;
    this.hitScore = 100;
    healthProgress.style.width = this.hitScore + "%";
    healthProgress.textContent = this.hitScore + "%";

    decoyProgress.style.width = "100%";
    decoyProgress.textContent = "Click to Drop a Decoy";
  },
  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY });
  },
  update() {
    this.field.clear();
    if (level === 0) {
      textFont("Nerko One");
      fill(89, 63, 40);
      textSize(110);
      text("↑Pick a Level↑", jarField.start, jarField.end / 2);
    } else {
      if (isPlaying) {
        if (Object.keys(this.decoy).length > 0) {
          this.decoy.handleCoolDown();
          this.decoy.handleExistingDecoy();
        }
        if (!this.decoy.exists && !this.decoy.needsCoolDown) {
          decoyProgress.style.width = "100%";
        }
        decoyProgress.style.width = `${this.progressBar}%`;
        for (let agent of [this.player, ...this.enemies]) {
          agent.move(this.field);
          agent.draw();
        }
      }
    }
  },
  didHit() {
    for (let enemy of this.enemies) {
      let numHit = 0;
      this.hit = collideCircleCircle(
        this.player.x,
        this.player.y,
        80,
        enemy.x,
        enemy.y,
        40
      );
      if (this.hit) {
        numHit += 1;
      }
      if (this.hit && numHit === 1) {
        // Only decrement health when hit the first time
        this.hitScore -= 10;
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
        random(jarField.start, jarField.end)
      );
      this.boostExists = true;
    }

    if (this.boostExists) {
      this.boostHit = collideCircleCircle(
        this.player.x,
        this.player.y,
        80,
        this.boost.x,
        this.boost.y,
        80
      );
      if (this.boostHit) {
        numHit += 1;
      }
      this.boost.draw();
    }

    if (this.boostHit && numHit === 1) {
      if (this.hitScore < 100) {
        this.hitScore += 10;
        healthProgress.style.width = this.hitScore + "%";
        healthProgress.textContent = this.hitScore + "%";
      }

      this.boostExists = false;
    }
  },
  
  checkEnemyCollision(){
    for(let i = 0; i < this.enemies.length; i++){
      for(let j = i + 1; j < this.enemies.length; j++){
        if(collideCircleCircle(this.enemies[i].x, this.enemies[i].y, 40, this.enemies[j].x, this.enemies[j].y, 40)){
          this.adjustEnemies(this.enemies[i], this.enemies[j])
        }
      }
    }
  },
  adjustEnemies(enemy1, enemy2){
    if(enemy1.x > enemy2.x){
      enemy1.x += 1
    } else{
      enemy2.x += 1
    }
    
    if(enemy1.y > enemy2.y){
      enemy1.y += 1
    } else{
      enemy2.y += 1
    }
  },
  mouseClicked() {
    if (
      mouseX >= jarField.start &&
      mouseX <= jarField.end &&
      mouseY >= jarField.start &&
      mouseY <= jarField.end
    ) {
      if (!this.decoy.needsCoolDown && !this.decoy.exists) {
        this.decoy = new Decoy(mouseX, mouseY);
        this.decoy.initialFrameCount = frameCount;
        this.decoy.needsCoolDown = true;
        this.decoy.exists = true;
        decoyProgress.style.width = "0%";
        for (let agent of [...this.enemies]) {
          agent.target = this.decoy;
        }
      }

      if (this.decoy.needsCoolDown) {
        console.log("wait");
      }
    }
  },
  gameOver() {
    if (this.hitScore <= 0) {
      //noLoop();
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
        jarField.end / 1.5
      );
      isPlaying = false;
    }
  },
  restart() {
    // Restart
    //loop();
    game.initialize();
    isPlaying = true;
  }
};
