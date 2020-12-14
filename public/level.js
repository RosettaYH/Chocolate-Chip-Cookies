let level = 0;
const levelNumber = 3;

$(document).ready(loadLevels())

function loadLevels() {
  for (let i = 0; i < levelNumber; i++) {
    let button = document.createElement("button");
    button.setAttribute("type", "button");
    button.classList.add("btn", "mx-1", "mb-3");
    button.id = "l" + (1 + i);
    button.textContent = "Level " + (1 + i);
    button.setAttribute("onclick", "levelClicked(this.id)");
    document.getElementById("levels").appendChild(button);
  }
}

function levelClicked(levelId) {
  level = parseInt(levelId.slice(-1));
  console.log(`level clicked: ${level}`)
  totalSeconds = 0;
  isPlaying = true;
}
