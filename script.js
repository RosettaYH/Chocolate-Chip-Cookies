const mouseSpan = document.querySelector("#mouse");
const health = document.querySelector("#health");
let plainCookieImage;
let chocolateImage;

function preload(){
  plainCookieImage = loadImage("https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Fplain.png?v=1607118020766")
  chocolateImage = loadImage("https://cdn.glitch.com/12927324-6667-4250-8271-1ac90bc20e49%2Fchocolate.png?v=1607118506469")
}

function setup() {
  game.initialize();
}

function draw() {
  game.update();
}

function mouseMoved() {
  health.style.width = "70%";
  game.mouseMoved();
  //game.didHit();
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
    image(plainCookieImage, this.x-plainCookieImage.width/4, this.y-plainCookieImage.height/4, plainCookieImage.width/2, plainCookieImage.height/2)
    //ellipse(this.x, this.y, 80);
    mouseSpan.textContent = `(${mouseX},${mouseY})`;
  }
}

class Enemy extends Agent {
  draw() {
    fill("rgba(255, 50, 50, 0.5)");
    ellipse(this.x, this.y, 20);
  }
}

const game = {
  initialize() {
    const canvas = createCanvas(1000, 1000);
    canvas.parent("sketch");
    noStroke();
    this.field = new Field(width, height, [135, 200, 230]);
    this.mouse = { x: 0, y: 0 };
    this.player = new Player(20, 20, 2.5, this.mouse);
    this.enemiesNumber = 3;
    this.enemies = [];
    for (let i = 0; i < this.enemiesNumber; i++) {
      this.enemies.push(
        new Enemy(random(width), random(height), random(1, 2), this.player)
      );
    }
    this.hit = false;
  },
  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY });
  },
  update() {
    this.field.clear();
    for (let agent of [this.player, ...this.enemies]) {
      agent.move(this.field);
      agent.draw();
    }
  },
  didHit() {
    console.log(this.enemies)
    for (let e of this.enemies) {
      console.log(e.y)
      this.hit = collideCircleCircle(
        this.player.x,
        this.play.y,
        10,
        this.e.x,
        this.e.y,
        20
      );
    }
    console.log(this.hit);
  }
};
