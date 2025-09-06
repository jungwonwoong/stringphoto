var graboutloadImg;
var showImgTranX;
var showImgTranY;
var showImgScale;
var showMinScale;
var resultImage,newColorImg;
var picColorValue;
var cropSlider;
var numberOfPins = 320;
var numberOfPinsOld = 320;
var sliderTestValue=320;
var frameSelect;
var frameSize;
var framePins = [];
var SIZE = 700;
var SIZET = 700;
var captureFiniButton=false;
var fadeOut=false;
// Two-finger pinch handler for mobile to adjust scale
class TwoFingerPinch {
    constructor(targetElement, onScale) {
        this.el = targetElement;
        this.onScale = typeof onScale === 'function' ? onScale : () => {};
        this.active = false;
        this.lastDist = 0;
        if (this.el) {
            this._start = this._start.bind(this);
            this._move = this._move.bind(this);
            this._end = this._end.bind(this);
            this.el.addEventListener('touchstart', this._start, { passive: false });
            this.el.addEventListener('touchmove', this._move, { passive: false });
            this.el.addEventListener('touchend', this._end);
            this.el.addEventListener('touchcancel', this._end);
        }
    }
    _getDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy) || 0;
    }
    _start(e) {
        if (e.touches && e.touches.length >= 2) {
            e.preventDefault();
            this.lastDist = this._getDist(e.touches);
            this.active = true;
        }
    }
    _move(e) {
        if (this.active && e.touches && e.touches.length >= 2) {
            e.preventDefault();
            const dist = this._getDist(e.touches);
            if (this.lastDist > 0 && dist > 0) {
                const factor = dist / this.lastDist;
                this.onScale(factor);
                this.lastDist = dist;
            }
        }
    }
    _end() {
        this.active = false;
        this.lastDist = 0;
    }
}
class editPicturePage {
    constructor() {
        graboutloadImg = createImage(0, 0);
        showImgTranX = 0;
        showImgTranY = 0;
        showImgScale = 1.0;
        showMinScale = 1.0;
        this.moveTransX = 0;
        this.moveTransY = 0;
        this.moveScale = 1.0;
        this.startPosition=[];
        this.movePosition=[];
        this.numberOfPins=320;
        resultImage = createImage(0, 0);
        newColorImg = createImage(0, 0);
        picColorValue = 50;
        this.frameList=document.getElementById('frameList');
        this.strokeScreen = document.getElementById('strokeScreen');
        this.makeArt = document.getElementById('makeArt');
        this.frameList.addEventListener('click', e => {
            const clicked = e.target;
            Array.from(this.frameList.children).forEach(
                v => v.classList.remove('selected')
            )
            if(clicked) {
                clicked.classList.add('selected');
                this.numberOfPins=clicked.innerText;
            }
        })
        this.strokeScreen.addEventListener('click', e => {
            if(NumberOfStroke >= 0 && NumberOfStroke <= 2600) {
                if(e.target.id == 'strokeMinus') {
                    NumberOfStroke -=100;
                    this.strokeScreen.children[1].innerText = NumberOfStroke;
                }
                if(e.target.id == 'strokePlus') {
                    NumberOfStroke += 100;
                    this.strokeScreen.children[1].innerText = NumberOfStroke;
                }
            } 
            if(NumberOfStroke == 0) NumberOfStroke += 100;
            if(NumberOfStroke == 2600) NumberOfStroke -= 100;
        })

        this.makeArt.addEventListener('mouseup', e => {
            captureFiniButton=true;

            clear();
        })
        this.makeArt.addEventListener('mousedown', e => {
            captureFiniButton=true;
            if (graboutloadImg.width !== 0) {
                this.makeArt.childNodes[1].innerText = 'Ready';
            }
            clear();
        })
        // Enable two-finger pinch to adjust showImgScale on mobile
        const holder = document.getElementById('sketch-holder');
        this._pinch = new TwoFingerPinch(holder, (factor) => {
            showImgScale *= factor;
            const minS = Math.max(0.1, (typeof showMinScale === 'number' ? showMinScale * 0.5 : 0.1));
            const maxS = (typeof showMinScale === 'number' ? showMinScale * 5 : 10);
            if (showImgScale < minS) showImgScale = minS;
            if (showImgScale > maxS) showImgScale = maxS;
        });
    }
    cropImageCircle(resultImage) {
        var width = round(resultImage.width / 2.0);
        var height = round(resultImage.height / 2.0);
        var radius;
        if (resultImage.width < resultImage.height) {
            radius = round(resultImage.width / 2.0)
        } else {
            radius = round(resultImage.height / 2.0)
        }
        resultImage.loadPixels();
        for (var i = 0; i < resultImage.width; i++) {
            for (var j = 0; j < resultImage.height; j++) {
                if (pow(width - i, 2) + pow(height - j, 2) > pow(radius, 2)) {
                    var a = 4 * (j * resultImage.width + i);
                    resultImage.pixels[a] = 255;
                    resultImage.pixels[a + 1] = 255;
                    resultImage.pixels[a + 2] = 255;
                    resultImage.pixels[a + 3] = 255
                }
            }
        }
        resultImage.updatePixels()
    }
    draw() {
        captureFiniButton=false;
        NR_PINS = this.numberOfPins;

        background(255);
        if (graboutloadImg.width > 0) {
            imageMode(CENTER);
            image(graboutloadImg, 
                (canWidth/2 + showImgTranX + this.moveTransX), 
                (canHeight/2 + showImgTranY + this.moveTransY), 
                (graboutloadImg.width * showImgScale * this.moveScale), 
                (graboutloadImg.height * showImgScale * this.moveScale));
            imageMode(CORNER)
        }
        framedrawPins(NR_PINS);
    }
    touchStart(touchpoints) {
        if (touchpoints[0] > 0) {

            this.startPosition =  touchpoints;
            this.movePosition = touchpoints;
            this.isTouch = true;
        }
    }
    touchMove(touchpoints) {
        if (this.isTouch) {
            this.moveTransX = touchpoints[0] - this.startPosition[0]
            this.moveTransY = touchpoints[1] - this.startPosition[1]
        }
    }
    touchEnd() {
        var rTouch = false;
        console.log(graboutloadImg.width);
        if (captureFiniButton) {
            
            if (graboutloadImg.width !== 0) {
                resultImage = createImage(SIZE, SIZE);
                var sWidth = graboutloadImg.width * showImgScale * this.moveScale / 2.0 - (showImgTranX + this.moveTransX) - SIZE / 2.0;
                var sHeight = graboutloadImg.height * showImgScale * this.moveScale / 2.0 - (showImgTranY + this.moveTransY) - SIZE / 2.0;
                resultImage.copy(graboutloadImg, 
                    (int)(sWidth / (showImgScale * this.moveScale)), 
                    (int)(sHeight / (showImgScale * this.moveScale)), 
                    (int)(SIZE / (showImgScale * this.moveScale)), 
                    (int)(SIZE / (showImgScale * this.moveScale)), 
                    0, 
                    0, 
                    resultImage.width, 
                    resultImage.height);
                resultImage.filter(GRAY);
                resultImage.resize(SIZE, SIZE);
                this.cropImageCircle(resultImage);
                newColorImg = createImage(resultImage.width, resultImage.height);
                newColorImg.loadPixels();
                balanceColor(resultImage, newColorImg);
                rTouch = true;
                
            } else {
                alert('Picture not loaded, please load picture first!')
            }
         } 
        if (this.isTouch) {
            var sWidth = (graboutloadImg.width * showImgScale * this.moveScale) / 2.0 - (showImgTranX + this.moveTransX) - SIZE / 2.0;
            var sHeight = (graboutloadImg.height * showImgScale * this.moveScale) / 2.0 - (showImgTranY + this.moveTransY) - SIZE / 2.0;
            this.isTouch = false;
            showImgTranX += this.moveTransX;
            showImgTranY += this.moveTransY;
            this.moveTransX = 0.0;
            this.moveTransY = 0.0
        }
        return rTouch
    }
    mouseWheel(event, mousex, mousey) {
        if (mousex > 0) {
            var delta = event.delta;
            if (delta > 0 && showImgScale > 0) {
                showImgScale -= 0.05;
            } else {
                showImgScale += 0.05;
            }
        }
    }
}

var openFile = function(event) {
    var data = event.target;
    var reader = new FileReader();
    if(data.files[0] != undefined) {
        reader.readAsDataURL(data.files[0]);
        reader.onload = function(){
            var imgURL = reader.result;
            graboutloadImg = loadImage(imgURL);
            if (graboutloadImg !== null) {
                setTimeout(function() {
                    showImgTranX = 0;
                    showImgTranY = 0;
                    var ss = float(graboutloadImg.width) / float(graboutloadImg.height);
                    if (ss > 1) {
                        showImgScale = SIZE / float(graboutloadImg.height)
                    } else {
                        showImgScale = SIZE / float(graboutloadImg.width)
                    }
                    ;showMinScale = showImgScale
                }, 100)
            } else {
                document.getElementById('inputImage').style.backgroundColor = 'rgb(255, 255, 255)';
            }
        };
    }
};