/**
 * Circular Maze Generator by Alexander Vega Jiménez
 * WTFPL because I'm sure many others have done this
 * and much better. 
 * 
 * DISCLAIMER: This project was developed as a live 
 * challenge and is not intended to be a demonstration 
 * of good design practices.
 */

/** @type {HTMLCanvasElement} */
let canvas;

/** @type {CanvasRenderingContext2D} */
let ctx;

let center;

const TAU = 2*Math.PI;
let rings = 3;
let maze = [];


document.addEventListener("DOMContentLoaded", ()=>{
    linesColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-lines');

    pathsColor = getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-secondary');

    canvas = document.querySelector("#maze-canvas");
    ctx = canvas.getContext("2d");

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    document.querySelector("#maze-size").dispatchEvent(new Event('input'));

})

function randomInt(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function resizeCanvas() {
    canvas.height = Math.max(640, canvas.getBoundingClientRect().height);
    canvas.width = canvas.height;
    ringWidth = ((canvas.height) / (rings+1.1))/2;
    offset = ringWidth;
    center = {x: canvas.width/2, y: canvas.height/2};
    drawMaze();
}

function changeSize(input) {
    rings = Number(input.value);
    regenerate();
}

function regenerate() {
    clearTimeout(interactiveBacktrackingTimeout);
    ibPath = [{x: 0, y:0}];
    generateMaze();
    resizeCanvas();
    drawMaze();
}
///////////////////////////////////////////////////////////////////////////////
//                             ALGORITHM STUFF                               //
///////////////////////////////////////////////////////////////////////////////
function generateMaze() {
    maze = [];
    for(let i = 0; i < rings; i++) {
        const row = [];

        const len = 8*Math.pow(2, Math.floor(i/2));

        for(let j = 0; j < len; j++) {
            row.push(0b11111);
        }
        maze.push(row);
    }
    //backtracking();
    interactiveBacktracking();

}

function visitCell(from, to) {
    const fromEvenRow = from.x % 2 == 0;

    if( from.x > to.x) {
        maze[from.x][from.y] &= 0b11101;

        if ( fromEvenRow ) {
            maze[to.x][to.y] &= (from.y % 2 == 0) ? 0b01111 : 0b10111;
        } else {
            maze[to.x][to.y] &= 0b00111;
        }
    // from bottom
    } else if( from.x < to.x) {
        maze[to.x][to.y] &= 0b11101;

        if ( fromEvenRow ) {
            maze[from.x][from.y] &= 0b00111;
        } else {
            maze[from.x][from.y] &= (to.y % 2 == 0) ? 0b01111 : 0b10111;
        }

    // Same row
    } else if (from.y - to.y == -1) { // from right
        maze[from.x][from.y] &= 0b11011;
        maze[to.x][to.y] &= 0b11110; 
    } else if (from.y - to.y == 1) {  // from left
        maze[from.x][from.y] &= 0b11110;
        maze[to.x][to.y] &= 0b11011;
    } else if (from.y < to.y) {   // from 0 to left
        maze[from.x][from.y] &= 0b11110;
        maze[to.x][to.y] &= 0b11011;
    } else {                      // from row length-1 to right
        maze[from.x][from.y] &= 0b11011;
        maze[to.x][to.y] &= 0b11110; 
    }


}

function unvisitedNeighbors(pos) {
    const isEvenRow = pos.x % 2 == 0;
    const neighbors = [];

    let row = maze[pos.x];

    // right
    let y = (pos.y+1) % row.length;
    if(row[y] == 0b11111) {
        neighbors.push({x: pos.x, y: y});
    }

    // left
    y = pos.y == 0 ? row.length - 1 : pos.y - 1;
    if(row[y] == 0b11111) { neighbors.push({x: pos.x, y: y})}

    // bottom
    if(pos.x > 0) {
        row = maze[pos.x-1];
        y = !isEvenRow ? pos.y : Math.floor(pos.y/2);
        if(row[y] == 0b11111) { neighbors.push({x: pos.x-1, y: y})}
    }

    // top 
    if(pos.x < maze.length-1) {
        row = maze[pos.x+1];
        if (!isEvenRow) {
            const topLeftY = pos.y*2;
            const topRightY = topLeftY + 1;
            if ( row[topLeftY]  == 0b11111 ) { neighbors.push({x: pos.x+1, y: topLeftY})  }
            if ( row[topRightY] == 0b11111 ) { neighbors.push({x: pos.x+1, y: topRightY}) }
        } else {
            if ( row[pos.y] == 0b11111 ) { neighbors.push({x: pos.x+1, y: pos.y})     }
        }
    }

    return neighbors;
}

function backtracking() {
    const path = [{x: 0, y:0}];

    while(path.length > 0) {

        let pos = path[path.length-1];
        const unvisited = unvisitedNeighbors(pos);

        if(unvisited.length == 0) { 
            path.pop(); 
            continue;
        }

        const randomNeighbor = unvisited[randomInt(0, unvisited.length-1)];
        visitCell(pos, randomNeighbor);
        path.push(randomNeighbor);

       /* console.log("---");
        path.forEach(pos => console.log(`(${pos.x}, ${pos.y})`));
        console.log("---");*/
    }
}

///////////////////////////////////////////////////////////////////////////////
//                               RENDER STUFF                                //
///////////////////////////////////////////////////////////////////////////////
let ringWidth;
let offset;
let linesColor;

let interactiveBacktrackingTimeout;
let ibPath = [{x: 0, y:0}];

function interactiveBacktracking() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaze();
    drawPaths();

    if(ibPath.length == 0) {
        console.log("stop");
        
        // Open center.
        maze[0][randomInt(0,7)] &= 0b11101;
        
        // Open border
        const lastRow = maze[maze.length-1];
        lastRow[randomInt(0,lastRow.length-1)] &= 0b00111;
        drawMaze();
        drawPaths();
        return;
    }

    let pos = ibPath[ibPath.length-1];
    const unvisited = unvisitedNeighbors(pos);

    if(unvisited.length == 0) { 
        ibPath.pop();
        interactiveBacktrackingTimeout = setTimeout(interactiveBacktracking, 10);
        return;
    }

    const randomNeighbor = unvisited[randomInt(0, unvisited.length-1)];
    visitCell(pos, randomNeighbor);
    ibPath.push(randomNeighbor);
    
    interactiveBacktrackingTimeout = setTimeout(interactiveBacktracking, 20);
}

function drawWall(r, ang) {
    ctx.lineWidth = ringWidth / 10;
    ctx.strokeStyle = linesColor;

    ctx.translate(center.x, center.y);
    ctx.rotate(ang)
    ctx.beginPath();
    ctx.moveTo(r+offset+ctx.lineWidth/2.2,0);
    ctx.lineTo(r+offset-ringWidth-ctx.lineWidth/2.2,0);
    ctx.stroke();
    ctx.rotate(-ang);
    ctx.translate(-center.x, -center.y);
}

function drawPlot(r, ang) {
    ctx.lineWidth = ringWidth / 10;
    ctx.strokeStyle = linesColor;

    ctx.translate(center.x, center.y);
    ctx.rotate(ang)
    ctx.beginPath();
    ctx.arc(r+ringWidth/2, 0, ringWidth/6, 0, TAU);
    ctx.stroke();
    ctx.rotate(-ang);
    ctx.translate(-center.x, -center.y);
}

function drawRow(row, index) {
    const sectionAngle = TAU / row.length;
    const internalRadius = offset + ringWidth*index;
    const externalRadius = offset + ringWidth*(index+1);

    for(let i = 0; i < row.length; i++) {
        if((row[i] & 0b00001) != 0) {
            drawWall(internalRadius, i*sectionAngle);
        }
        if((row[i] & 0b00010) != 0) {
            drawCurvedWall(internalRadius, i*sectionAngle, sectionAngle);
        }
        if((row[i] & 0b10000) != 0) {
            drawCurvedWall(externalRadius, i*sectionAngle, sectionAngle/2);
        }
        if((row[i] & 0b01000) != 0) {
            drawCurvedWall(externalRadius, (i+0.5)*sectionAngle, sectionAngle/2);
        }
    }
}

function drawCurvedWall(r, ang, sizeInAng) {
    ctx.lineWidth = ringWidth / 10;
    ctx.strokeStyle = linesColor;
    ctx.beginPath();
    ctx.arc(center.x, center.y, r, ang, ang+sizeInAng);
    ctx.stroke();
}

function drawMaze() {
    
    ctx.fillStyle = linesColor;
    ctx.beginPath()
    ctx.arc(center.x, center.y, offset/8, 0, TAU);
    ctx.fill();

    for(let [index, row] of maze.entries()) {
        drawRow(row, index);
    }
    //drawCircle(0);
}

function drawSegment(pos) {
    ctx.lineWidth = ringWidth / 10;

    const row = maze[pos.x];
    const size = TAU / row.length
    const ang = size*pos.y;
    const r = offset + ringWidth*pos.x;
    const re = offset + ringWidth*(pos.x+1);


    ctx.beginPath();
    ctx.arc(center.x, center.y, r, ang, ang+size);
    ctx.arc(center.x, center.y, re, ang+size, ang, true)
    ctx.fill();
}

function drawPaths() {

    let opacity = 1;
    ctx.fillStyle = pathsColor;
    for(let i = ibPath.length-1; i >= 0; i--) {
        ctx.globalAlpha = opacity;
        drawSegment(ibPath[i]);
        opacity = Math.max(0.2, opacity - 0.05);
        ctx.globalAlpha = 1;
    }
}