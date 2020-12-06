const minutesLabel = document.getElementById("minutes");
const secondsLabel = document.getElementById("seconds");
let totalSeconds = 0;
setInterval(setTime, 1000);

function setTime() {
  if(isPlaying){
    totalSeconds+=1;
  }  
  secondsLabel.innerHTML = convertString(totalSeconds % 60);
  minutesLabel.innerHTML = convertString(parseInt(totalSeconds / 60));
}

function convertString(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}