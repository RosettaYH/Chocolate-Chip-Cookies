const mouseSpan = document.querySelector("#mouse");

function setup() {
  background(700, 700);
  const canvas = createCanvas(600, 600);
  canvas.parent("sketch");
  noStroke();
}

function draw() {
  background(700, 700);
  fill("black");
  ellipse(mouseX, mouseY, 20);
  mouseSpan.textContent = `(${mouseX},${mouseY})`;
}
