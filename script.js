const mouseSpan = document.querySelector("#mouse");
const health = document.querySelector("#health");
let plainCookieImage;
let chocolateImage;
let raisinImage;

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
}

function setup() {
  game.initialize();
}

function draw() {
  game.update();
}

function mouseMoved() {
  //health.style.width = "70%";
  game.mouseMoved();
  game.didHit();
}

function mouseClicked() {
  game.mouseClicked();
}
class Field {
  constructor(width, height, color) {
    Object.assign(this, { width, height, color });
  }
  clear() {
    background(this.color);
  }
  clamp(x, y) {
    return { x: constrain(x, 0, this.width), y: constrain(y, 0, this.height) };
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
    fill("blue");
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
    fill("rgba(255, 50, 50, 0.5)");
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
  //click to drop a decoy raisin, will implement feature to make raisin disappear after 5 seconds
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
    const canvas = createCanvas(900, 900);
    canvas.parent("sketch");
    noStroke();
    this.field = new Field(width, height, [135, 200, 230]);
    this.mouse = { x: 0, y: 0 };
    this.player = new Player(20, 20, 10, this.mouse);
    this.enemiesNumber = 3;
    this.enemies = [];
    for (let i = 0; i < this.enemiesNumber; i++) {
      this.enemies.push(
        new Enemy(random(width), random(height), random(1, 2), this.player)
      );
    }
    this.existingDecoy = false;
    this.raisin = {};

    this.hit = false;
    this.hitScore = 100;
    health.style.width = this.hitScore + "%";
    this.numHit = 0; 
  },
  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY });
  },
  update() {
    this.field.clear();

    if (this.existingDecoy) {
      this.raisin.draw();
    }

    for (let agent of [this.player, ...this.enemies]) {
      agent.move(this.field);
      agent.draw();
    }
  },
  didHit() {
    for (let enemy of this.enemies) {
      this.hit = collideCircleCircle(
        this.player.x,
        this.player.y,
        80,
        enemy.x,
        enemy.y,
        40
      );
      console.log(this.mouse.x)
      if (this.hit) {
        this.numHit += 1;
      }
      if (this.hit && this.numHit === 1) {
        // Only decrement health when hit the first time
        this.hitScore -= 10;
        health.style.width = this.hitScore + "%";
        this.numHit = 0
      }
    }
    console.log(this.hit);
  },
  mouseClicked() {
    this.existingDecoy = true;
    this.raisin = new Decoy(mouseX, mouseY);
    console.log(this.raisin);
  },
};
