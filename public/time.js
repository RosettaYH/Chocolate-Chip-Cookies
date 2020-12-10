const secondsLabel = document.getElementById("seconds");
const minutesLabel = document.getElementById("minutes");
let totalSeconds = 0;
setInterval(setTime, 1000);

function setTime() {
  if (isPlaying && level !== 0) {
    totalSeconds += 1;
  }
  secondsLabel.textContent = convertString(totalSeconds % 60);
  minutesLabel.textContent = convertString(parseInt(totalSeconds / 60));
}

function convertString(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}
