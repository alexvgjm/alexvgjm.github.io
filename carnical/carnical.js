let canvas, ctx, carnico;
const sprites = {}

let carnicos = [];
const scales = [1, 1.25, 1.5];

document.addEventListener("DOMContentLoaded", ()=>{
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d");
    sprites.carnico = document.querySelector("#carnico-walk");

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    for(let i = 0; i < canvas.height/96; i++) carnicos.push(newCarnico());
    setInterval(update, 55);
})

function randomInt(min, max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function newCarnico(x) {
    if(x === undefined) {
        x = randomInt(-400, canvas.width);
    }

    return {
        pos: {
            x: x,
            y: randomInt(canvas.height * 0.2, canvas.height * 0.8),
        },
        frame: randomInt(0, 11),
        scale: scales[randomInt(0,2)]
    };
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    changeMeaties(document.querySelector("#meaties-quantity"));
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let borrado = false;

    for(let [index, carnico] of carnicos.entries()) {
        carnico.frame = (carnico.frame+1) % 12;
        if(carnico.frame > 2 && carnico.frame < 9) {
            carnico.pos.x += 2.5 * carnico.scale;    
            if(carnico.pos.x > canvas.width + 96) {
                carnicos.splice(index, 1, newCarnico(randomInt(-400, -96)));
                borrado = true;
            }
        }
        ctx.drawImage(sprites.carnico, carnico.frame*64, 0, 64, 64, 
            carnico.pos.x, carnico.pos.y, carnico.scale * 64, carnico.scale * 64);
    }
    if (borrado) {
        carnicos.sort((c1, c2) => c1.pos.y + (c1.scale*64-64) - c2.pos.y - (c2.scale*64-64));
    }
}


function changeMeaties(input) {

    carnicos = [];
    for(let i = 0; i < input.value; i++) {
        carnicos.push(newCarnico());
    }
    carnicos.sort((c1, c2) => c1.pos.y + (c1.scale*64-64) - c2.pos.y - (c2.scale*64-64));
}






document.addEventListener("DOMContentLoaded", function (event) {
    const sliders = document.querySelectorAll('input[type="range"]');
    sliders.forEach(s => {
        const output = document.querySelector('output[for="' + s.id + '"]');
        output.textContent = s.value;
        s.addEventListener("input", evt => {
            output.textContent = evt.target.value;
        });

    });

    changeMeaties(document.querySelector("#meaties-quantity"));
    
});