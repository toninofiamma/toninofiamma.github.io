const camera = document.querySelector("#camera");
const canvas = document.querySelector("canvas");
const color = document.querySelector("#color");
const ctx = canvas.getContext("2d");

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then((stream) => {
            camera.srcObject = stream;
        })
        .catch(() => {
            console.log("qualcosa è andato storto");
        })
}
console.log("aggiornato");

(function loop() {
    requestAnimationFrame(loop)
    setTimeout(() => {
        ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);
        const rgb = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
        console.log(rgb[0]);
        color.style["background-color"] = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    }, 1000 / 60)
})();
