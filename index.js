const camera = document.querySelector("#camera");
const color = document.querySelector("#cameraColor");
const trueColor = document.querySelector("#true");
const playButton = document.querySelector("#playButton");
const score = document.querySelector("#score");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

var inGame = false;
var startFrame = 0;
var frame = 0;
var timer = 100;
var trueRGB = Array(3);
let rgb = Array(3);

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            camera.srcObject = stream;
        })
        .catch(() => {
            console.log("qualcosa è andato storto");
        })
}

setInterval(() => {
    
    if (inGame) {
        ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
        rgb = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        color.style["background-color"] = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;    
    }

    if (inGame && (frame - startFrame) % 6 == 0) {
        timer -= 1;
        playButton.textContent = timer % 10 ? timer / 10 : `${timer / 10}.0`;

        if (timer == 0) {
            inGame = false;
    
            let sommaDis = 0;
            for (let i=0; i<3; i++) {
                sommaDis += Math.abs(trueRGB[i] - rgb[i]);
            }
            let ipotScore = Math.floor((1 - sommaDis / 256) * 1000) / 10;
            const scoreVal = ipotScore > 0 ? ipotScore : 0;
            score.textContent = scoreVal;
            playButton.textContent = "Gioca!";
        }
    }

    frame++
}, 1000 / 60)


const randColor = () => Math.floor(Math.random() * 256);

function startGame() {
    if (inGame) return;

    inGame = true;
    trueRGB = [randColor(), randColor(), randColor()];
    trueColor.style["background-color"] = `rgb(${trueRGB[0]}, ${trueRGB[1]}, ${trueRGB[2]})`
    startFrame = frame;
    timer = 50;
}
