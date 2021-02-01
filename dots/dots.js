/**
 * By Alexander Vega Jiménez under GPLv3+
 * See https://www.gnu.org/licenses/gpl-3.0.html
 */


///////////////////////////////////////////////////////////////////////////////
//                               PARAMS                                      //
///////////////////////////////////////////////////////////////////////////////
// vars
let canvas, ctx;
let mx, my
let dots = [];
const dotsOrigins = [];
let behavioursNames = [];
let hueVariation = 45;
var numDots = 150;


///////////////////////////////////////////////////////////////////////////////
// #region                        UTILS                                      //
///////////////////////////////////////////////////////////////////////////////
function randomInt(from, to) {
    return Math.floor(Math.random() * (to - from + 1)) + from;
}
function randomRGBColor(from, to, alpha = 1) {
    return "rgba(" +
        (randomInt(from, to) + 50) + ", " +
        randomInt(from, to) + ", " +
        (randomInt(from, to) + 100) + ", " + alpha + ")";
}
function randomHSLAColor(fromHue, toHue, alpha = 1, fromSat = 100, toSat = 100, fromLum = 50, toLum = 50) {
    if (toHue < fromHue) { toHue += 360; }

    const h = randomInt(fromHue, toHue) % 360;
    const s = randomInt(fromSat, toSat);
    const l = randomInt(fromLum, toLum);

    return "hsla(" + h + ", " + s + "%, " + l + "%, " + alpha + ")";
}

function modifyHue(hslaColor, modifyFunction) {
    let h = Number(hslaColor.substring(5, hslaColor.indexOf(",", 5)));
    h = modifyFunction(h) % 360;
    return "hsla(" + h + hslaColor.substring(hslaColor.indexOf(","));
}

function setCSSVar(varName, value) {
    document.documentElement.style.setProperty(varName, value);
}

function hexToRgba(hex, alpha) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return "rgb(" + parseInt(result[1], 16) + ", "
        + parseInt(result[2], 16) + ", "
        + parseInt(result[3], 16) + "," + alpha + ")";
}

function rgbaToHsla(rgb){
    [r, g, b, a] = rgb.substring(4, rgb.length-1).replace(/ /g, '').split(',');
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return "hsla(" + (h * 360).toFixed(1) + ", " + (s*100).toFixed(1) + "%, " + (l*100).toFixed(1) + "%, " + a + ")";
}
let debug = false;
function modifyLuminosity (hslaColor, modifyFunction) {
    const lastPercentPos = hslaColor.lastIndexOf("%");
    const firstCommaPos = hslaColor.indexOf(",", 5);
    const secondCommaPos = hslaColor.indexOf(",", firstCommaPos+1);
    let l = Number(hslaColor.substring(secondCommaPos+1, lastPercentPos-1));
    l = modifyFunction(l);
    console.log(l);

    return  hslaColor.substring(0, secondCommaPos+2) + l.toFixed(1) + hslaColor.substring(lastPercentPos);
}

function pointToPointVector(x1, y1, x2, y2) {
    const dx = x1 - x2;
    const dy = y1 - y2;

    const euclideanDist = Math.sqrt(dx * dx + dy * dy);
    return {
        dir: { x: dx / euclideanDist, y: dy / euclideanDist },
        dist: euclideanDist
    }
}

/** shorthand of document.querySelector */
const qs = query => document.querySelector(query);

/** shorthand of document.querySelectorAll */
const qsAll = query => document.querySelectorAll(query);
// #endregion
// ...


///////////////////////////////////////////////////////////////////////////////
// #region                        MODEL                                      //
///////////////////////////////////////////////////////////////////////////////
class Entity {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.behaviours = [];
        this.indexedBehaviours = {};
    }
    clearBehaviours() {
        this.behaviours.splice(0, this.behaviours.length);
    }

    addBehaviour(behaviour, id, first = true) {
        if (id !== undefined) {
            this.removeBehaviour(id);
            this.indexedBehaviours[id] = behaviour;
        }
        
        if(first) {
            this.behaviours.unshift(behaviour);
        } else {
            this.behaviours.push(behaviour);
        }
        
    }

    /**
     * @param {object|string} behaviour object to remove or behaviour id.
     */
    removeBehaviour(behaviour) {
        if (typeof behaviour == 'string') {
            // IF ID GIVEN, REMOVE FROM INDEXED BEHAVIOURS DIRECTLY.
            // now behaviour references behaviour object instead ID.
            behaviour = this.indexedBehaviours[behaviour];
            delete this.indexedBehaviours[behaviour];
        } else {
            // IF behaviour OBJECT INSTEAD ID, FIND AND DELETE.
            for (const [id, behav] of Object.entries(this.indexedBehaviours)) {
                if (behav == behaviour) {
                    delete this.indexedBehaviours[id];
                    break;
                }
            }
        }

        // REMOVE FROM NOT INDEXED BEHAVIOUR LIST.
        for (let i = 0; i < this.behaviours.length; i++) {
            if (this.behaviours[i] == behaviour) {
                this.behaviours.splice(i, 1);
                break;
            }
        }

        return behaviour;
    }

    getBehaviour(id) {
        return this.indexedBehaviours[id];
    }

    update() {
        this.behaviours.forEach(behavior => {
            behavior.update();
        });
    }
}

class Dot extends Entity {
    constructor(x, y, r, color) {
        super(x, y);
        this.r = r;
        this.color = color;
        this.hueVariationSensibility = -0.5 + Math.random();
    }

    

    draw(canvas) {
        const x = relativeToAbsolute(this.x, canvas.width);
        const y = relativeToAbsolute(this.y, canvas.height);
        const r = relativeToAbsolute(this.r, canvas.width);
        const ctx = canvas.getContext("2d");

        //        TODO
        ctx.fillStyle = modifyHue(this.color, (h) => h + this.hueVariationSensibility * hueVariation);
        //ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2831853);
        ctx.fill();
        ctx.closePath();
    }
}
// #endregion 
//...


///////////////////////////////////////////////////////////////////////////////
// #region                       BEHAVIORS                                  //
///////////////////////////////////////////////////////////////////////////////
class Behaviour {
    constructor(owner) {
        this.owner = owner;
    }

    update() { throw Error("NOT IMPLEMENTED"); }
}


class IncreaseDecrease extends Behaviour {
    /**
     * Increase and decrease an attribute at some linear rate.
     * @param {object} owner Object to apply this behaviour
     * @param {number} min Min value
     * @param {number} max Max value
     * @param {string} attrName attribute to increase/decrease
     * @param {number} rate increment/decrement amount in each update.
     * @param {boolean=true} [growing] true if start growing
     */
    constructor(owner, min, max, attrName, rate, growing = true) {
        super(owner)
        this.grow = growing ? 1 : -1;
        this.min = parseInt(min);
        this.max = parseInt(max);
        this.rate = parseFloat(rate);
        this.attrName = attrName;
    }

    update() {
        this.owner[this.attrName] += this.grow * this.rate;

        // Calculate size
        if (this.owner[this.attrName] < this.min) {
            this.owner[this.attrName] = this.min;
            this.grow = 1;
        } else if (this.owner[this.attrName] > this.max) {
            this.owner[this.attrName] = this.max;
            this.grow = -1;
        }
    }
}

class MovementBehaviour extends Behaviour {
    /**
     * @param {object} owner Object to apply this behaviour. Should has x and y
     *                   properties representing its position.
     * @param {number} speed units per update.
     * @param {function} [speedMultiplier] A function with 2 params.
     *        Will receive the owner and this behaviour object and should 
     *        return a number to multiply the speed (i.e: 0.5 for half speed, 
     *        2 for doubling). This allows to dinamically modify speed based on 
     *        attributes of the owner or of this object.
     */
    constructor(owner, speed, speedMultiplier) {
        super(owner);
        this.speed = speed;
        if (speedMultiplier === undefined) {
            this.speedMultiplier = (owner, behaviour) => 1;
        } else {
            this.speedMultiplier = speedMultiplier;
        }
    }
}

class MoveTo extends MovementBehaviour {
    /**
     * Move the object to target destination. 
     * @param {object} owner Object to apply this behaviour. Should has x and y
     *                       properties representing its position.
     * @param {number} x horizontal coord of target position.
     * @param {number} y vertical coord of target position.
     * 
     * @param {number} speed units per update.
     * @param {function} [speedMultiplier] speed multiplier.
     * @see MovementBehaviour
     * 
     * @param {boolean=false} [sticky] Indicates if this behaviour will be
     *        removed from its owner when target pos is reached. If true, this 
     *        persist over time and whenever the object moves from the target
     *        position it will try to return to it.
     */
    constructor(owner, x, y, speed, speedMultiplier, sticky = false) {
        super(owner, speed, speedMultiplier);
        this.x = x;
        this.y = y;

        if (!sticky) {
            this.update = () => {
                const ptpd = pointToPointVector(this.x, this.y, this.owner.x, this.owner.y);

                if (ptpd.dist > 0.2) {
                    this.owner.x -= ptpd.dir.x * this.speed * this.speedMultiplier(this.owner, this);
                    this.owner.y -= ptpd.dir.y * this.speed * this.speedMultiplier(this.owner, this);
                } else {
                    this.owner.removeBehaviour(this);
                }
            }
        } else {
            this.update = () => {
                const ptpd = pointToPointVector(this.x, this.y, this.owner.x, this.owner.y);

                if (ptpd.dist > 2) {
                    this.owner.x += ptpd.dir.x * this.speed * this.speedMultiplier(this.owner, this);
                    this.owner.y += ptpd.dir.y * this.speed * this.speedMultiplier(this.owner, this);
                }
            }
        }
    }
}

class FleeFromMouse extends MovementBehaviour {
    /**
     * @param {object} owner Object to apply this behaviour
     * @param {number} detectionRadius min distance to mouse in order to apply.
     * @param {number} speed units per update.
     * @param {function} [speedMultiplier] speed multiplier.
     */
    constructor(owner, detectionRadius, speed, speedMultiplier) {
        super(owner, speed, speedMultiplier);
        this.dr = detectionRadius;
    }

    get detectionRadius() { return this.dr; }
    set detectionRadius(newVal) { this.dr = newVal; }

    update() {
        const dx = (mx - this.owner.x) * (canvas.width / canvas.height);
        const dy = my - this.owner.y;

        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.dr) {
            this.owner.x = this.owner.x - (dx * (this.dr - dist) / this.dr);
            this.owner.y = this.owner.y - (dy * (this.dr - dist) / this.dr);
        }
    }
}

class FollowMouse extends MovementBehaviour {

    /**
     * @param {object} owner Object to apply this behaviour
     * @param {number} detectionRadius min distance to mouse in order to apply.
     * @param {number} speed units per update.
     * @param {function} [speedMultiplier] speed multiplier.
     */
    constructor(owner, detectionRadius, speed, speedMultiplier) {
        super(owner, speed, speedMultiplier);
        this.dr = detectionRadius;
    }
    update() {
        const ptpd = pointToPointVector(mx, my, this.owner.x, this.owner.y);

        if (ptpd.dist > 0.2) {
            this.owner.x += ptpd.dir.x * this.speedMultiplier(this.owner, this);
            this.owner.y += ptpd.dir.y * this.speedMultiplier(this.owner, this);
        }
    }
}

class LimitTo extends Behaviour {
    constructor(owner, minX, minY, maxX, maxY) {
        super(owner);
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    update() {
        if (this.owner.x > this.maxX) {
            this.owner.x = this.maxX;
        } else if (this.owner.x < this.minX) {
            this.owner.x = this.minX;
        }

        if (this.owner.y > this.maxY) {
            this.owner.y = this.maxY;
        } else  if (this.owner.y < this.minY) {
            this.owner.y = this.minY;
        }
    }
}
// #endregion 
//...


///////////////////////////////////////////////////////////////////////////////
// #region                     INITIALIZATION                                //
///////////////////////////////////////////////////////////////////////////////
function createRandomDot() {
    return new Dot(
        randomInt(0, 999),
        randomInt(0, 999),
        randomInt(0, 50),
        "black"
    );
}



function init() {
    for (let i = 0; i < numDots; i++) {
        const dot = createRandomDot();

        dot.addBehaviour(
            new LimitTo(dot, 0, 0, 1000, 1000), "limitTo"
        )

        dots.push(dot);
        dotsOrigins.push({ x: dot.x, y: dot.y });
    }


    // Force to update state from current inputs values.
    qsAll("input").forEach(input => {
        input.dispatchEvent(new Event('change'));
        input.dispatchEvent(new Event('input'));
    });

    setInterval(mainUpdate, 30);
}

document.addEventListener("DOMContentLoaded", function (event) {
    canvas = qs("#main-canvas");
    ctx = canvas.getContext("2d");
    window.addEventListener('mousemove', mousemove);
    window.addEventListener('resize', resize);

    canvas.addEventListener('click', canvasMouseClick);


    const sliders = qsAll('input[type="range"]');
    sliders.forEach(s => {
        const output = qs('output[for="' + s.id + '"]');
        output.textContent = s.value;
        s.addEventListener("input", evt => {
            output.textContent = evt.target.value;
        });
    });

    const rangeIntervalSliders = qsAll(".range-interval input");
    console.log(rangeIntervalSliders);
    for (let i = 0; i < rangeIntervalSliders.length; i += 2) {
        const minSlider = rangeIntervalSliders[i];
        const maxSlider = rangeIntervalSliders[i + 1];
        minSlider.addEventListener('input', (evt) => {
            intervalSlidersHandler(minSlider, maxSlider, minSlider);
        });
        maxSlider.addEventListener('input', (evt) => {
            intervalSlidersHandler(minSlider, maxSlider, maxSlider);
        });
    }

    resize();
    init();
});

function mainUpdate() {
    dots.forEach(dot => { dot.update(); });
    redraw();
}




// #endregion
// ...


///////////////////////////////////////////////////////////////////////////////
// #region                   UI  & EVENT HANDLERS                            //
///////////////////////////////////////////////////////////////////////////////

function intervalSlidersHandler(minSlider, maxSlider, current) {
    const minVal = Number(minSlider.value);
    const maxVal = Number(maxSlider.value);
    const step = Number(minSlider.getAttribute("step"));
    console.log((minVal + step));

    if (maxSlider.value <= minVal) {
        console.log("SÏ");
        if (current == minSlider) {
            maxSlider.value = minVal + step;
            maxSlider.dispatchEvent(new Event('input'));
        } else {
            minSlider.value = maxVal - step;
            minSlider.dispatchEvent(new Event('input'));
        }
    }


    maxSlider.dispatchEvent(new Event('change'));
    minSlider.dispatchEvent(new Event('change'));
}

function closeHeader() {
    qs("main > header").classList.add("closed");
}

function openHeader() {
    qs("main > header").classList.remove("closed");
}

function changeHueVariation(input) {
    hueVariation = input.value;
}
function changeColor(input) {
    let color = rgbaToHsla(hexToRgba(input.value, 1));
    dots.forEach(d => d.color = color);

    setCSSVar("--color-range-sliders", input.value);
    setCSSVar("--color-range-sliders-disabled", input.value);

    console.log(color);
    const dark = modifyLuminosity(color, l => l * 0.15);
    setCSSVar("--color-box-background", dark.replace(/\d(\.\d+)?\)/g, "0.9)"));

    
    const light = modifyLuminosity(color, l => l > 70 ? 100 : l+30);
    setCSSVar("--color-range-sliders-text", light);
}

function changeDotsQuantity(input) {
    const qty = input.value;
    if(qty > dots.length) {
        const toAdd = qty - dots.length;
        for(let i = 0; i < toAdd; i++) {
            const dot = createRandomDot();

            dot.addBehaviour(
                new LimitTo(dot, 0, 0, 1000, 1000), "limitTo"
            )
    
            dots.push(dot);
            dotsOrigins.push({ x: dot.x, y: dot.y });
        }
        
        qsAll("#behaviours-panel input").forEach(input => {
            input.dispatchEvent(new Event('change'));
        });
        qs("input[type='color']").dispatchEvent(new Event('input'));
    } else {
        dots.length = qty;
        dotsOrigins.length = qty;
    }
}


function randomizeSizes() {
    const beatBehaviour = dots[0].getBehaviour("beat");
    const min = beatBehaviour.min;
    const max = beatBehaviour.max;

    dots.forEach(d => d.r = randomInt(min, max));
}

function togglePanel(id) {
    qs("#" + id).classList.toggle("closed");
}

function closePanels() {
    qsAll(".control-panel").forEach(cp => cp.classList.add("closed") );
}

function mousemove(event) {
    const rect = canvas.getBoundingClientRect();
    mx = event.clientX - rect.left; //x position within the element.
    my = event.clientY - rect.top;  //y position within the element.

    mx *= 1000 / canvas.width;
    my *= 1000 / canvas.height;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function canvasMouseClick(event) {
    closePanels();
}

function checkFleeFromMouse(cb) {
    if (cb.checked) {
        dots.forEach(d => d.addBehaviour(
            new FleeFromMouse(d, qs("#flee-from-mouse-dr").value, true),
            "fleeFromMouse"
        ));
    } else {
        dots.forEach(d => d.removeBehaviour("fleeFromMouse"));
    }
}

function checkBeat(cb) {
    if (cb.checked) {
        dots.forEach((d, i) => {
            d.addBehaviour(
                new IncreaseDecrease(d, qs("#beat-min-radius").value,
                    qs("#beat-max-radius").value, 'r',
                    qs("#beat-rate").value), "beat"
            );
        });
    } else {
        dots.forEach(d => d.removeBehaviour("beat"));
    }
}

function checkBackToOrigin(cb) {
    if (cb.checked) {
        dots.forEach((d, i) => {
            d.addBehaviour(
                new MoveTo(d, dotsOrigins[i].x, dotsOrigins[i].y, 
                    qs("#back-to-origin-speed").value, (dot, beh) => {
                    const ptpd = pointToPointVector(dot.x, dot.y, beh.x, beh.y);
                    return 1 + ptpd.dist / 5;
                }, true), "backToOrigin"
            )
        });
    } else {
        dots.forEach(d => d.removeBehaviour("backToOrigin"));
    }
}

function behaviourAttributeChange(behaviourId, attribute, input) {
    if (dots[0].getBehaviour(behaviourId) !== undefined) {
        dots.forEach(
            d => d.getBehaviour(behaviourId)[attribute] = parseFloat(input.value)
        );
    }
}
// #endregion
// ...


///////////////////////////////////////////////////////////////////////////////
// #region                    RENDERING LOOP                                 //
///////////////////////////////////////////////////////////////////////////////
function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => dot.draw(canvas));
}

function absoluteToRelative(unit, realMax) {
    return unit / realMax * 1000;
}

function relativeToAbsolute(unit, realMax) {
    return unit / 1000 * realMax;
}
// #endregion
// ...