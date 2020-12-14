let mode = 0;

$(document).ready(loadModes())

function loadModes() {
  let singleButton = document.createElement("button");
  singleButton.setAttribute("type", "button");
  singleButton.classList.add("btn", "mx-1", "mb-3");
  singleButton.id = "m1";
  singleButton.setAttribute("onclick", "modeClicked(this.id)");

  singleButton.textContent = "Mode: single";

  let multiplayerButton = document.createElement("button");
  multiplayerButton.setAttribute("type", "button");
  multiplayerButton.classList.add("btn", "mx-1", "mb-3");
  multiplayerButton.id = "m2";
  multiplayerButton.setAttribute("onclick", "modeClicked(this.id)");
  multiplayerButton.textContent = "Mode: multiplayer";

  document.getElementById("modes").appendChild(singleButton);
  document.getElementById("modes").appendChild(multiplayerButton);
}

function modeClicked(modeId) {
  mode = parseInt(modeId.slice(-1));
  if (level !== 0) {
    game.initialize();
  }
}
