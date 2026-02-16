var rulerHeight = 23;
var rulerWidth = get_size(document.body)[0];

var canvas = document.getElementById("canvas_ruler");

canvas.setAttribute("width", rulerWidth);
canvas.setAttribute("height", rulerHeight);


let timeFormatDevider = 100;
function addScaleLineText(ctx, startX, text) {
    var x = startX + 2;
    var y = 12;
    ctx.fillStyle = "white";
    ctx.font = "0.8em Arial";
  
    if (text / timeFormatDevider > 59 && text / timeFormatDevider <= 3600) {
        ctx.font = "0.7em Arial";
    } else if (text / timeFormatDevider > 3600) {
        ctx.font = "0.5em Arial";
    }
  
    if (zoom_scale < 1) {
        let interval = Math.floor(1 / zoom_scale);
        if (Math.floor(text / timeFormatDevider) % interval !== 0) {
            return;
        }
    }
    ctx.fillText(timeFormat(text / timeFormatDevider), x, y);
}
function addUnitScaleLineX(ctx, startX, scaleFactor) {
    var unit = 10 * scaleFactor;
    let x = startX + 0.5;
    for (let i = 0; i <= 10; i++) {
        ctx.moveTo(x, 20);

        if (zoom_scale <= 0.5) {
            // Draw only at the start or end of each major unit
            if (i === 0 || i === 10) {
                ctx.lineTo(x, 0); // full height line
            }else if (i === 5) {
                ctx.lineTo(x, 10); // half height line
            }
        } else {
            // Regular behavior for zoom_scale > 0.5
            if (i === 0 || i === 10) {
                ctx.lineTo(x, 0); // full height line
            } else if (i === 5) {
                ctx.lineTo(x, 10); // half height line
            } else {
                ctx.lineTo(x, 15); // quarter height line
            }
        }

        x += unit;
    }
}

function addFullScaleLineX(options) {
    var {
        ctx,
        addUnitScaleLineX,
        startX,
        endX,
        scaleFactor,
        rulerUnit,
        startDialNumber
    } = options;
    var unit = rulerUnit * scaleFactor;
    var loopLength = Math.ceil(endX / unit);

    let x = startX;
    let dialNumber = startDialNumber;

    
    for (let i = 0; i <= loopLength; i++) {
      addUnitScaleLineX(ctx, x, scaleFactor, dialNumber);

        
        addScaleLineText(ctx, x, dialNumber);
        x += unit;
        dialNumber += rulerUnit;
    }
}

function calculateStartX(zeroScaleLinePosX = 0, scaleFactor = 1, rulerUnit = 100) {
    var scaledRulerUnit = rulerUnit * scaleFactor;
    var remainder = zeroScaleLinePosX % scaledRulerUnit;
    let startX = 0;
    if (remainder > 0) {
        startX = remainder - scaledRulerUnit;
    } else {
        startX = remainder;
    }
    return startX;
}

function calculateStartDialNumber(zeroScaleLinePosX = 0, scaleFactor = 1, rulerUnit = 100) {
    var scaledRulerUnit = rulerUnit * scaleFactor;
    var delta = Math.ceil(zeroScaleLinePosX / scaledRulerUnit) * rulerUnit;
    var startDialNumber = 0 - delta;
    return startDialNumber;
}

function paint_ruler() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#d1d1d1";
    ctx.beginPath();
    ctx.moveTo(0, rulerHeight - 0.5);
    ctx.lineTo(ctx.canvas.width, rulerHeight - 0.5);
  
    scaledFactor = scaleFactor * zoom_scale;

    addFullScaleLineX({
        ctx: ctx,
        addUnitScaleLineX: addUnitScaleLineX,
        startX: calculateStartX(zeroScaleLinePosX, scaledFactor),
        endX: rulerWidth,
        scaleFactor: scaledFactor,
        rulerUnit: 100,
        startDialNumber: calculateStartDialNumber(zeroScaleLinePosX, scaledFactor)
    });

    ctx.stroke();
}

function clear_ruler() {
	setDPI(canvas);
	
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function multiply(out, a, b) {
    let a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3];
    let b0 = b[0], b1 = b[1];

    out[0] = a0 * b0 + a2 * b1;
    out[1] = a1 * b0 + a3 * b1;
    return out;
}

function add(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
}

function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
}

var ctx = canvas.getContext("2d");
var scaleDelta = 0;
var offsetDelta = 66;

var zeroScaleLinePosX = 0;
let scaleFactor = 0.3333;
let curOriginPointX;
let curZeroScaleLinePosX = zeroScaleLinePosX;

paint_ruler();



let prevHieght;
let prevWidth;
let prevWidth_Rendered;

function setDPI(canvas, dpi) {
	// clear_ruler();
    // Set up CSS size.
    canvas.style.width = canvas.style.width || canvas.width + 'px';
    canvas.style.height = canvas.style.height || canvas.height + 'px';
	
	
    // Resize canvas and scale future draws.
    let scaleFactor = dpi ? dpi / 96 : window.devicePixelRatio || 1;
	prevHieght = rulerHeight;
	
	prevWidth =  get_size(document.body)[0];
	canvas.style.width = prevWidth + 'px';
	
	canvas.width = Math.ceil(prevWidth * scaleFactor);
	canvas.height = Math.ceil(prevHieght * scaleFactor);
		
	
	prevWidth_Rendered = prevWidth

    var ctx = canvas.getContext('2d');
    ctx.scale(scaleFactor, scaleFactor);
	paint_ruler();
}
