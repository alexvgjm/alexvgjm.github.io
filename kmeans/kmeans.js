
let canvas, ctx

let dots = []

let iterations = 1000


const seeds = []
const colors = ['#0b84a5', '#f6c85f', '#a56fbb', '#9dd866', '#ff7777']
let groups = 5
let drawLines = true

let mins = {x: 99999, y: 99999}
let max =  {x: -1, y: -1}
let interactiveInterval = null


document.addEventListener("DOMContentLoaded", ()=>{
    canvas = document.querySelector("canvas")
    ctx = canvas.getContext("2d")

    asignListeners()
    document.querySelector("#randomSeeds").addEventListener('change', ()=>{
        groups = parseInt(document.querySelector("#randomSeeds").value)
    })
    document.querySelector('#randomSeeds').value = 3
    groups = 3
    loadExample()
    addSeed(200,100)
    addSeed(500,200)
    addSeed(250,250)

    setInterval(drawState, 50)
    startInteractive()
})



///////////////////////////////////////////////////////////////////////////////
//                                LISTENERS                                  //
///////////////////////////////////////////////////////////////////////////////
function asignListeners() {
    canvas.addEventListener("click", addDataOnClick)

    document.querySelector('.controls__control--example')
        .addEventListener('click', loadExample)

    document.querySelector('.controls__control--place-seeds')
        .addEventListener('click', placeSeedsRandomly)

    document.querySelector('.controls__control--clear-data')
        .addEventListener('click', clearData)

    document.querySelector('.controls__control--clear-seeds')
        .addEventListener('click', clearSeeds)
}
function loadExample() {
    clearData()
    for(let i = 0; i < 25; i++) {
        switch(groups) {
            case 5:
                addData(random(50, 200),  random(150, 250))
            case 4:
                addData(random(500, 750),  random(300, 400))
            case 3:
                addData(random(200, 550),  random(75, 200))
            case 2:
                addData(random(500, 650), random(100, 200))
            case 1: 
                addData(random(250, 450), random(250, 400))
            default: 
                console.log("the fuck...", groups);
        }
    }
}

function getClickCoords(evt) {
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / canvas.offsetWidth
    const x = (evt.clientX - rect.left) * scale
    const y = (evt.clientY - rect.top) * scale
    return {x, y}
}

function addDataOnClick(evt) {
    const clickPos = getClickCoords(evt)
    addData(clickPos.x, clickPos.y)
}

function addSeedOnClick(evt) {
    const clickPos = getClickCoords(evt)
    if(seeds.length < groups) {
        addSeed(clickPos.x, clickPos.y)
    }
}

function addSeed(x, y) {
    seeds.push({ 
        x: x,  y: y,
        n: seeds.length,
        nears: 0,
        color: colors[seeds.length % colors.length] 
    })
}

function addData(x, y) {
    if(dots.length == 0) { 
        max = {x: -1, y: -1}
        mins = {x: 99999, y:99999}
    }

    if(x < mins.x) { mins.x = x }
    if(y < mins.y) { mins.y = y }
    if(x > max.x) { max.x = x }
    if(y > max.y) { max.y = y }


    dots.push({ x: x,  y: y,  r: 5, color: "#aaa" })
}


function rangeControl(toAdd, inputId) {
    const input = document.getElementById(inputId)
    let val = parseInt(input.value)
    val += toAdd

    const min = input.getAttribute('min')
    const max = input.getAttribute('max')
    if(val < min) { val = min }
    if(val > max) { val = max }
    input.value = val

    const evt = new Event('change')
    input.dispatchEvent(evt)
}
///////////////////////////////////////////////////////////////////////////////




///////////////////////////////////////////////////////////////////////////////
//                               RENDERING                                   //
///////////////////////////////////////////////////////////////////////////////
function drawState() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // DRAW SEEDS
    ctx.lineWidth = 3
    seeds.forEach(x => drawX(x) )

    if (dots.length == 0) return

    // DRAW DOTS
    dots.forEach(d => drawDot(d))

    // DRAW LINES TO SEEDS
    ctx.lineWidth = 0.5
    if(drawLines && dots[0].nearest !== undefined) {
        dots.forEach(d => drawLineToNearest(d))
    }

}


function drawLineToNearest(c) {
    ctx.strokeStyle = c.color

    ctx.beginPath()
    ctx.moveTo(c.x, c.y)
    ctx.lineTo(c.nearest.x, c.nearest.y)
    ctx.stroke()
    ctx.closePath()
}

function drawDot(c) {
    ctx.fillStyle = c.color

    ctx.beginPath()
    ctx.arc(c.x, c.y, c.r, 0, 2*Math.PI)
    ctx.fill()
    ctx.closePath()
}

function drawX(x, color) {
    if(color) { ctx.strokeStyle = color }
    else if(x.color) { 
        ctx.strokeStyle = x.color
     }

    ctx.beginPath()
    ctx.moveTo(x.x-4, x.y-4)
    ctx.lineTo(x.x+(8), x.y+(8))
    ctx.moveTo(x.x+(8),  x.y-4)
    ctx.lineTo(x.x-4, x.y+(8))
    ctx.stroke()
    ctx.closePath()
}
///////////////////////////////////////////////////////////////////////////////






///////////////////////////////////////////////////////////////////////////////
//                            ALGORITHM RELATED                              //
///////////////////////////////////////////////////////////////////////////////

// Compute at 1 iteration every 50 milliseconds
function startInteractive() {
    stopInteractive()
    interactiveInterval = setInterval(()=>{
        if(seeds.length == 0) return
        step1()
        step2()
    }, 50)
}

function stopInteractive() {
    if(interactiveInterval != null) {
        clearInterval(interactiveInterval)
    }
}

// Compute at max speed until converge.
function startNotInteractive() {
    do {   step1() } 
    while(!step2())
}

function step1() {
    seeds.forEach(s => {
        s.nears = 0
    })
    dots.forEach((d) => {
        d.nearest = findNearestSeed(d.x, d.y)
        if(d.nearest) {
            d.color = d.nearest.color
        }
    })
}

function step2() {
    const previousPos = []
    seeds.forEach(s=> {
        previousPos.push({x:s.x, y:s.y})
    })

    const xMeans = new Array(groups)
    const yMeans = new Array(groups)
    const count = new Array(groups)
    count.fill(0,0)
    xMeans.fill(0,0)
    yMeans.fill(0,0)

    dots.forEach(d => {
        xMeans[d.nearest.n] += d.x
        yMeans[d.nearest.n] += d.y
        count[d.nearest.n]++
    })
    
    seeds.forEach((s,i) => {
        if(count[i] > 0) {
            /*
            const dx = xMeans[i] / count[i]
            const dy = yMeans[i] / count[i]

            const de = euclideanDistance(s.x,s.y,dx,dy)
            const dirx = (dx - s.x) / de
            const diry = (dy - s.y) / de

            s.x += dirx * de * 0.5
            s.y += diry * de * 0.5*/
            const dx = xMeans[i] / count[i]
            const dy = yMeans[i] / count[i]
            s.x = dx
            s.y = dy
        }
    })


    for(let i = 0; i < seeds.length; i++) {
        if(seeds[i].x != previousPos[i].x || seeds[i].y != previousPos[i].y) { 
            return false 
        }
    }

    return true
}

function findNearestSeed(x, y) {
    let nSeed, distance = 99999
    seeds.forEach(s => {
        const de = euclideanDistance(s.x, s.y, x, y)
        if (de < distance) {
            distance = de
            nSeed = s
        }
    })

    nSeed.nears++
    return nSeed
}

function euclideanDistance(x1,y1, x2,y2) {
    const dx = x1 - x2
    const dy = y1 - y2
    return Math.sqrt(dx*dx + dy*dy)
}

function random(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min
}

function placeSeedsRandomly() {
    clearSeeds()
    if(dots.length == 0) {
        mins = {x: 0, y: 0} 
        max = {x: canvas.width, y:canvas.height}
    }

    for(let i = 0; i < groups; i++) {
        seeds.push({ 
            x: random(mins.x, max.x), 
            y: random(mins.y, max.y),
            s: 4,
            n: i,
            color: colors[seeds.length % colors.length] 
        })
    }
}

function areAloneCentroids() {
    for(let i = 0; i < seeds.length; i++) {
        if(seeds[i].nears == 0) { return true }
    }
    return false
}

function clearSeeds() {
    seeds.length = 0
    dots.forEach(d=> {
        d.color = "#aaaaaa"
        delete d.nearest
    })
}

function clearData() {
    mins = {x: 99999, y: 99999}
    max =  {x: -1, y: -1}
    dots.length = 0
}
///////////////////////////////////////////////////////////////////////////////