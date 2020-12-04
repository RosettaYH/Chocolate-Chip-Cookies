const mouseSpan = document.querySelector("#mouse");
const health = document.querySelector("#health");

function setup() {
  game.initialize()
}

function draw() {
  game.update()
}

function mouseMoved() {
  health.style.width = "70%";
  game.mouseMoved()
}

class Field {
  constructor(width, height, color) {
    Object.assign(this, { width, height, color })
  }
  clear() {
    background(this.color)
  }
  clamp(x, y) {
    return { x: constrain(x, 0, this.width), y: constrain(y, 0, this.height) }
  }
}

class Agent {
  constructor(x, y, speed, target) {
    Object.assign(this, { x, y, speed, target })
  }
  move(field) {
    const [dx, dy] = [this.target.x - this.x, this.target.y - this.y]
    const distance = Math.hypot(dx, dy)
    if (distance > 1) {
      const step = this.speed / distance
      Object.assign(this, field.clamp(this.x + (step * dx), this.y + (step * dy)))
    }
  }
}

class Player extends Agent {
  draw() {
    fill('blue')
    ellipse(this.x, this.y, 10)
    mouseSpan.textContent = `(${mouseX},${mouseY})`;
  }
}

class Enemy extends Agent {
  draw() {
    fill('rgba(255, 50, 50, 0.5)')
    ellipse(this.x, this.y, 20, )
  }
}

const game = {
  initialize() {
    const canvas = createCanvas(1000, 1000);
    canvas.parent("sketch");
    noStroke();
    this.field = new Field(width, height, [135, 200, 230])
    this.mouse = { x: 0, y: 0 }
    this.player = new Player(20, 20, 2.5, this.mouse)
    this.enemies = [
      new Enemy(4, 5, 2, this.player),
      new Enemy(94, 95, 1.5, this.player),
      new Enemy(400, 503, 1.8, this.player),
    ]
  },
  mouseMoved() {
    Object.assign(this.mouse, { x: mouseX, y: mouseY })
  },
  update() {
    this.field.clear()
    for (let agent of [this.player, ...this.enemies]) {
      agent.move(this.field)
      agent.draw()
    }
  }
}