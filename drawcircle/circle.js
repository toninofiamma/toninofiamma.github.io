const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")
const FPS = 60
const scoreBox = document.getElementById("score")
const recordBox = document.getElementById("record")

canvas.width = innerWidth
canvas.height = innerHeight

ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height)
ctx.strokeStyle = "white";
ctx.lineWidth = "10"
var points = []

const calcCenter = () => {
    let sommaX = 0
    let sommaY = 0
    for (const point of points) {
        sommaX += point.x
        sommaY += point.y
    }

    return {
        x: sommaX / points.length,
        y: sommaY / points.length
    }
}

const calcLengths = (center) => {
    let lengths = []
    for (const point of points) {
        lengths.push(Math.hypot(center.x - point.x, center.y - point.y))
    }
    return lengths
}

const calcRadius = (lengths) => {
    let somma = 0
    for (const len of lengths) {
        somma += len
    }
    return somma / lengths.length
}

const calcScore = (radius, lengths) => {
    let score = 0
    for (len of lengths) {
        score += Math.abs(radius - len)
    }
    return Math.pow(100, 1 - score / lengths.length / radius)
}

const setRecord = (record) => {
    recordBox.innerHTML = "Record: " + record
}

var record = localStorage.getItem("record")
if (record === null) {
    record = 0
    localStorage.setItem("record", 0)
}
setRecord(record)

addEventListener("touchstart", (event) => {
    ctx.strokeStyle = "white"
    ctx.lineWidth = "10"
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    points = [{x: event.touches[0].clientX, y: event.touches[0].clientY}]
})

addEventListener("touchmove", (event) => {
    // console.log(event.touches[0].clientX, event.touches[0].clientY)
    ctx.beginPath()
    // ctx.arc(event.touches[0].clientX, event.touches[0].clientY, 5, 0, Math.PI * 2)
    ctx.moveTo(points[points.length-1].x, points[points.length-1].y)
    points.push({x: event.touches[0].clientX, y: event.touches[0].clientY})
    ctx.lineTo(points[points.length-1].x, points[points.length-1].y)
    ctx.closePath();
    ctx.stroke()
})

addEventListener("touchend", () => {
    let center = calcCenter()
    let lengths = calcLengths(center)
    let radius = calcRadius(lengths)
    let score = (radius == 0) ? 0 : calcScore(radius, lengths)
    console.log(score)
    
    if (score > 0) {
        ctx.strokeStyle = "rgb(200, 200, 200, 0.2)"
        ctx.lineWidth = "5"
        ctx.fillStyle = "rgb(200, 200, 200, 0.2)"
    
        ctx.beginPath()
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
        ctx.closePath()
        ctx.stroke()
    }

    score = score.toFixed(1)

    scoreBox.innerHTML = score

    if (score > record) {
        record = score
        localStorage.setItem("record", record)
        setRecord(record)
    }
})
