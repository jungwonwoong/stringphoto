var NR_PINS=320;
var LAST_NR_PINS=320;
var NumberOfStroke = 2000;
var lineFade = 50;
var minDist = 15;
var lineWidth = 0.1;
var lineAlpha = 80;
var lineVarration = 0;
var pinSize = 5;
var SIZE = 700;
var LAST_SIZE = 700;
var newColorImg;
var imgCopy;
var pins = [];
var lines = [];
var steps = [];
var imgfileBase64='';
function calcCirclePins() {
    pins = [];
    var a = round(SIZE / 2.0);
    var b = round(SIZE / 2.0);
    var c = SIZE / 2;
    var d = TWO_PI / float(NR_PINS);
    for (var i = 0; i < int(NR_PINS); i++) {
        pins.push([round(a + c * cos(i * d)), round(b + c * sin(i * d))])
    }
   // console.log(pins);
}
function linePixels(current, next) {
    var points = [];
    var dx = abs(next[0x0] - current[0x0]);
    var dy = -abs(next[0x1] - current[0x1]);
    var sx = current[0x0] < next[0x0] ? 1 : -1;
    var sy = current[0x1] < next[0x1] ? 1 : -1;
    var e = dx + dy;
    var px = current[0x0];
    var py = current[0x1];
    while (px !== next[0x0] || py !== next[0x1]) {
        points.push([px, py]);
        e2 = 2 * e;
        if (e2 > dy) {
            e += dy;
            px += sx
        }
        ;if (e2 < dx) {
            e += dx;
            py += sy
        }
    }
    return points
}
function lineScore(image, points) {
    var score = 0;
    for (var i = 0; i < points.length; i++) {
        if (points[i][0x1] < image.height) {
            var c = 4 * (points[i][0x1] * image.width + points[i][0x0]);
            var diff = 255 - image.pixels[c];
            score += diff
        } else {
            var c = 4 * ((points[i][0x1] - 1) * image.width + points[i][0x0]);
            var diff = 255 - image.pixels[c];
            score += diff
        }
    }
    return score / points.length
}
function reduceLine(image, points, value) {
    for (var i = 0; i < points.length; i++) {
        var c = 4 * (points[i][0x1] * image.width + points[i][0x0]);
        var score = image.pixels[c];
        score += value;
        if (score > 255) {
            score = 255
        }
        ;image.pixels[c] = score;
        image.pixels[c + 1] = score;
        image.pixels[c + 2] = score;
        image.pixels[c + 3] = 255
    }
    image.updatePixels()
}
function pinPair(current, next) {
    strrr = '';
    if (current < next) {
        strrr = current + '-' + next
    } else {
        strrr = next + '-' + current
    }
    return strrr
}
function contains(used, pair) {
    for (var i = 0; i < used.length; i++) {
        if (used[i] === pair) {
            return true
        }
    }
    return false
}
function nextPin(current, used, image, dist) {
    var maxScore = 0;
    var next = -1;
    for (var i = 0; i < NR_PINS; i++) {
        //console.log("들어옴",i)
        var pair = pinPair(current, i);
        var diff = abs(current - i);
        if (diff < dist || diff > NR_PINS - dist) {
            continue
        }
        ;if (contains(used, pair)) {
            continue
        }
        var pair1 = lines[current * NR_PINS + i];
        var score = lineScore(image, pair1);
        if (score > maxScore) {
            maxScore = score;
            next = i
        }
    }
    return next
}
function clearStrings() {
    noStroke();
    fill(100);
    ellipseMode(CENTER);
    ellipse(canWidth/2, canHeight/2, SIZE, SIZE)
    //fill('rgba(100%,0%,100%,0.5)')
}
function drawPins() {
    for (var i = 0; i < pins.length; i++) {
        noStroke();
        fill("black");
        ellipseMode(CENTER);
        ellipse(canWidth/2-SIZE/2 + pins[i][0x0], canHeight/2-SIZE/2 + pins[i][0x1], pinSize, pinSize);
        rectMode(CORNER)
    }
}
function drawFrame() {
    noStroke();
    fill(35, 235, 235);
    ellipseMode(CENTER);
    ellipse(canWidth/2, 
    (stringPicY + SIZE / 2), 
    (SIZE + 12), 
    (SIZE + 12));
}
function drawStrings() {
    stroke('black');
    strokeWeight((lineWidth));
    noFill();
    randomSeed(10);
    var variation = lineVarration;
    for (var i = 0; i < steps.length - 1; i++) {
        ax = canWidth/2-SIZE/2 + pins[steps[i]][0x0];
        ay = canHeight/2-SIZE/2 + pins[steps[i]][0x1];
        bx = canWidth/2-SIZE/2 + pins[steps[i + 1]][0x0];
        by = canHeight/2-SIZE/2 + pins[steps[i + 1]][0x1];
        cx = round(random(-variation, variation) + (ax + bx) / 2);
        cy = round(random(-variation, variation) + (ay + by) / 2);
        bezier(ax, ay, cx, cy, cx, cy, bx, by)
    }
}
function drawSignStrings(current, next) {
    stroke(0, 0, 0, lineAlpha);
    strokeWeight((lineWidth));
    noFill();
    var variation = lineVarration;
    {
        ax = canWidth/2-SIZE/2 + pins[current][0x0];
        ay = canHeight/2-SIZE/2 + pins[current][0x1];
        bx = canWidth/2-SIZE/2 + pins[next][0x0];
        by = canHeight/2-SIZE/2 + pins[next][0x1];
        cx = round(random(-variation, variation) + (ax + bx) / 2);
        cy = round(random(-variation, variation) + (ay + by) / 2);
        bezier(ax, ay, cx, cy, cx, cy, bx, by)
    }
}
var isgenerating = false;
var bredraw = false;
var generateOrder = 0;
var current = 0;
var used = [];
var stepsInstructions;
var fColor='black';
var cColor='black';
var pinCoverUse = false;
var framethickness = 0;

function beginGenerate() {
    if (LAST_NR_PINS != NR_PINS || LAST_SIZE != SIZE) {
        calcCirclePins();
        lines = Array.apply(null, {
            length: (NR_PINS * NR_PINS)
        });
        for (var i = 0; i < NR_PINS; i++) {
            for (var j = i + 1; j < NR_PINS; j++) {
                tempPoints = linePixels(pins[i], pins[j]);
                lines[i * NR_PINS + j] = tempPoints;
                lines[j * NR_PINS + i] = tempPoints
            }
            
        }
    }
    LAST_NR_PINS = NR_PINS;
    LAST_SIZE = SIZE;
    steps = [];
    stepsInstructions = '';
    imgCopy = createImage(newColorImg.width, newColorImg.height);
    imgCopy.copy(newColorImg, 0, 0, newColorImg.width, newColorImg.height, 0, 0, newColorImg.width, newColorImg.height);
    current = 0;
    steps.push(current);
    used = [];
    generateOrder = 0;
    imgCopy.loadPixels()
}
function generatePattern() {
    if (LAST_NR_PINS != NR_PINS) {
        calcCirclePins();
        lines = Array.apply(null, {length: (NR_PINS * NR_PINS)});
        for (var i = 0; i < NR_PINS; i++) {
            for (var j = i + 1; j < NR_PINS; j++) {
                tempPoints = linePixels(pins[i], pins[j]);
                lines[i * NR_PINS + j] = tempPoints;
                lines[j * NR_PINS + i] = tempPoints
            }
        }
    }
    LAST_NR_PINS = NR_PINS;
    steps = [];
    stepsInstructions = '';
    imgCopy = createImage(newColorImg.width, newColorImg.height);
    imgCopy.copy(newColorImg, 0, 0, newColorImg.width, newColorImg.height, 0, 0, newColorImg.width, newColorImg.height);
    current = 0;
    steps.push(current);
    used = [];
    generateOrder = 0;
    imgCopy.loadPixels();
    while (generateOrder < NumberOfStroke) {
        next = nextPin(current, used, imgCopy, minDist);
        if (next < 0) {
            NumberOfStroke = used.length;
            break
        }
        drawSignStrings(current, next);
        pair = pinPair(current, next);
        tempPoints = lines[current * NR_PINS + next];
        reduceLine(imgCopy, tempPoints, lineFade);
        var a = next + '';
        if (generateOrder < NumberOfStroke - 1) {
            a += ',';
        }
        stepsInstructions += a;
        used.push(pair);
        steps.push(next);
        current = next;
        generateOrder++
        
    }
    bredraw = true;
    isgenerating = false
}
function balanceColor(resultImage, newColorImg) {
    var width = round(resultImage.width / 2.0);
    var height = round(resultImage.height / 2.0);
    var radius;
    if (resultImage.width < resultImage.height) {
        radius = round(resultImage.width / 2.0)
    } else {
        radius = round(resultImage.height / 2.0)
    }
    for (var i = 0; i < resultImage.width; i++) {
        for (var j = 0; j < resultImage.height; j++) {
            if (pow(width - i, 2) + pow(height - j, 2) <= pow(radius, 2)) {
                var a = 4 * (j * resultImage.width + i);
                newColorImg.pixels[a] = map(resultImage.pixels[a], 0, 255, picColorValue, 255 - picColorValue);
                newColorImg.pixels[a + 1] = map(resultImage.pixels[a], 0, 255, picColorValue, 255 - picColorValue);
                newColorImg.pixels[a + 2] = map(resultImage.pixels[a], 0, 255, picColorValue, 255 - picColorValue);
                newColorImg.pixels[a + 3] = 255
            } else {
                var a = 4 * (j * resultImage.width + i);
                newColorImg.pixels[a] = 255;
                newColorImg.pixels[a + 1] = 255;
                newColorImg.pixels[a + 2] = 255;
                newColorImg.pixels[a + 3] = 0
            }
        }
       
    }
    newColorImg.updatePixels();
}
function framedrawPins(pins) {
    push();
    if(pins == 240) framethickness = SIZE*0.1134/2;
    if(pins == 280) framethickness = SIZE*0.0866/2;
    if(pins == 320) framethickness = SIZE*0.1015/2;
    ellipseMode(CENTER);
    noFill();
    stroke('rgba(0,0,0,1)');
    strokeWeight(1);
    
    translate(canWidth/2 ,canHeight/2);
    ellipse(0, 0, SIZE, SIZE);
    for (var i = 0; i < pins; i++) {
        angleMode(RADIANS);
        ellipseMode(CENTER);
        rotate((TWO_PI / float(pins)));
        stroke('rgb(100,100,100)');
        strokeWeight(1);
        fill(0);
        ellipse(SIZE/2,0,2,2)
    }
    pop();
    rectMode(CORNER)
}
function rulerView() {
    stroke(255);
    strokeWeight(1);
    noFill();
    var gap = SIZE/((2.54*NR_PINS)/PI);
    rect(canWidth/2-SIZE/2-30,canHeight/2,gap*300+60,-150);
    var stick;
    for(var i=0;i<301;i++){
        
        if(i%10 == 0) {
            stick=15;
            textSize(15);
            textAlign(CENTER, CENTER);
            text(i/10, (canWidth/2-SIZE/2)+(gap*i),canHeight/2-25);
        }
        else if(i%10 == 5) stick=12;
        else stick=5;
        line((canWidth/2-SIZE/2)+(gap*i),canHeight/2,(canWidth/2-SIZE/2)+(gap*i),canHeight/2-stick)
    }
}

