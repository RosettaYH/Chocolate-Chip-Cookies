const mouseSpan = document.querySelector("#mouse");
const health = document.querySelector("#health");
let plainCookieImage;
let chocolateImage;
let raisinImage;
let chocolateChipCookieImage;
let jarImage;

let isPlaying = true;

function preload() {
  plainCookieImage = loadImage(
    "https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Fplain.png?v=1607118020766"
  );
  chocolateImage = loadImage(
    "https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Fchocolate.png?v=1607118506469"
  );
  raisinImage = loadImage(
    "https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Frasin.png?v=1607118805816"
  );
  chocolateChipCookieImage = loadImage(
    "https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Fchocolatechip.png?v=1607118024346"
  );
  jarImage = loadImage("https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Fjar.png?v=1607225247868")
}

function setup() {
  game.initialize();
}

function draw() {
  game.update();
  game.gameOver();
}

function mouseMoved() {
  //health.style.width = "70%";
  game.mouseMoved();
  game.didHit();
}

function mouseClicked() {
  game.mouseClicked();
  if(!isPlaying){
    
  }
}
class Field {
  constructor(width, height, color) {
    Object.assign(this, { width, height, color });
  }
  clear() {
    // Move only inside jar
    background(this.color);
    image(jarImage, jarImage.width/2.5, jarImage.height/8, jarImage.width*2.5, jarImage.height*2)
    fill("rgba(231, 244, 250, 0.5)");
    rect(jarImage.width/2.5, jarImage.width/2.5, jarImage.width*2.5, jarImage.width*2.5, 160);
  }
  clamp(x, y) {
    return { x: constrain(x, jarImage.width/2.5, jarImage.width*2.5+jarImage.width/2.5), y: constrain(y, jarImage.width/2.5, jarImage.width*2.5+jarImage.width/2.5) };
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
    //ellipse(this.x, this.y, 80);
    mouseSpan.textContent = `(${mouseX},${mouseY})`;
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
  }
  draw() {
    image(
      raisinImage,
      this.x - raisinImage.width / 2,
      this.y - raisinImage.height / 2,
      raisinImage.width,
      raisinImage.height
    );
    
  }
}

const game = {
  initialize() {
    const canvas = createCanvas(900, 800);
    canvas.parent("sketch");
    noStroke();
    this.field = new Field(width, height, [135, 200, 230]);
    this.mouse = { x: 0, y: 0 };
    this.player = new Player(jarImage.width*1.25, jarImage.height, 5, this.mouse);
    this.enemiesNumber = 3;
    this.enemies = [];
    for (let i = 0; i < this.enemiesNumber; i++) {
      this.enemies.push(
        new Enemy(random(width), random(height), random(1, 2), this.player)
      );
    }
    this.decoyExists = false;
    this.raisin = {};
    this.initialFrameCount = 0;
    this.decoyNeedsCoolDown = false;
    
    this.hit = false;
    this.hitScore = 100;
    health.style.width = this.hitScore + "%";
    health.textContent = this.hitScore + "%"
    //this.numHit = 0;
  },
  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY });
  },
  update() {
    this.field.clear();

    if (this.decoyExists && frameCount < this.initialFrameCount + 300) {
      this.raisin.draw();
      for(let agent of [...this.enemies]){
        agent.target = this.raisin
      }
    } else {
      this.decoyNeedsCoolDown = false;
      for(let agent of [...this.enemies]){
        agent.target = this.player
      }
    }
    //console.log(`cool down: ${this.decoyNeedsCoolDown}`)

    for (let agent of [this.player, ...this.enemies]) {
      agent.move(this.field);
      agent.draw();
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
        if(this.hitScore <= 10){
          console.log("Hi")
          health.style.backgroundColor = color(220, 53, 69)
        }
        health.style.width = this.hitScore + "%";
        health.textContent = this.hitScore + "%"
        numHit = 0;
      }
    }
    console.log(this.hit);
  },
  mouseClicked() {
    this.decoyExists = true;
    if(!this.decoyNeedsCoolDown){
      this.raisin = new Decoy(mouseX, mouseY);
      this.initialFrameCount = frameCount;
      this.decoyNeedsCoolDown = true;
    }
    //console.log(this.initialFrameCount)
    console.log(this.raisin);
        
  },
  gameOver() {
    if (this.hitScore <= 0) {
      noLoop();
      isPlaying = false;
      image(
        chocolateChipCookieImage,
        this.player.x - chocolateChipCookieImage.width / 2,
        this.player.y - chocolateChipCookieImage.height / 2,
        chocolateChipCookieImage.width,
        chocolateChipCookieImage.height
      );
    textFont("Nerko One")
    fill(89, 63, 40)
    textSize(200);
    text('Game Over', width/30, height/2);
    }
  }
};
