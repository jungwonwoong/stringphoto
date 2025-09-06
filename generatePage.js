var linecolors = [];
var sori=false;
var testCanvas;
var fileName='';
class generatePage {
    constructor() {
        this.state = 0;
        this.doneUIShown = false;
        this.savedTxtOnce = false;
        this.manualBtnRect = null;
        this.machineBtnRect = null;
        
        this.imgorstring=document.getElementById('imgorstring');
        this.balanceScreen = document.getElementById('balanceScreen');
        this.remakeArt = document.getElementById('remakeArt');
        this.balanceScreen.style.opacity="0";
        this.imgorstring.addEventListener('click', e => {
            const clicked = e.target;
            Array.from(this.imgorstring.children).forEach(
                v => v.classList.remove('selected')
            )
            if(clicked) {
                clicked.classList.add('selected');
                if(clicked.id=="cimg") {
                    sori=true;
                    this.balanceScreen.style.opacity="1";
                } else {
                    sori=false;
                    this.balanceScreen.style.opacity="0";
                }
            }
        })
        this.balanceScreen.addEventListener('click', e => {
            if(picColorValue >= 0 && picColorValue <= 100) {
                if(e.target.id == 'balanceMinus') {
                    picColorValue -= 10;
                    this.balanceScreen.children[1].innerText = picColorValue;
                }
                if(e.target.id == 'balancePlus') {
                    picColorValue += 10;
                    this.balanceScreen.children[1].innerText = picColorValue;
                }
            } 
            if(picColorValue == 0) picColorValue += 10;
            if(picColorValue == 100) picColorValue -= 10;
            newColorImg = createImage(resultImage.width, resultImage.height);
            newColorImg.loadPixels();
            balanceColor(resultImage, newColorImg);
        })
        this.remakeArt.addEventListener('mouseup', e => {
            sori=false;
            beginGenerate();
            isgenerating = true
            this.doneUIShown = false;
            this.savedTxtOnce = false;
            this.balanceScreen.style.opacity="0";
            Array.from(this.imgorstring.children).forEach(
                v => {
                    if(v.id == "cimg") {
                        v.classList.remove('selected')
                    } else {
                        v.classList.add('selected')

                    }
                }
            )
        })
        this.backToStarted = document.getElementById('backToStarted')
        this.backToStarted.addEventListener('click', e => {
            sori=false;
            isgenerating = false;
            this.doneUIShown = false;
            this.savedTxtOnce = false;
            this.balanceScreen.style.opacity="0";
            Array.from(this.imgorstring.children).forEach(
                v => {
                    v.classList.remove('selected');
                    if(v.innerText=="STRING") v.classList.add('selected');
                }
            )
            state=0;
            document.getElementById('makeArt').childNodes[1].innerText = 'Gen';
            document.getElementById('makeArt').style.backgroundColor = 'rgb(255, 255, 255)';
        })
        calcCirclePins();
        lines = Array.apply(null, {
            length: (NR_PINS * NR_PINS)
        });
        for (var i = 0; i < NR_PINS; i++) {
            for (var j = i + 1; j < NR_PINS; j++) {
                var points = linePixels(pins[i], pins[j]);
                lines[i * NR_PINS + j] = points;
                lines[j * NR_PINS + i] = points
            }
        }
        var that = this;
        var s1 = function( sketch ) {
            sketch.setup = function() {
                var a=document.getElementById('toolBar').getBoundingClientRect().width;
                let canvas1 = sketch.createCanvas(adaptWidth, adaptHeight).parent('sketch-holder').position(0, 0);
                canvas1.background("rgb(255, 255, 255)");
                canvas1.style.position = 'absolute';
                canvas1.style.zindex='0';
            }
            sketch.draw = function() {
              sketch.background("rgb(255, 255, 255)");
              sketch.imageMode(CENTER);
              if(sori) {
                sketch.image(newColorImg,canWidth/2, canHeight/2, newColorImg.width, newColorImg.height);
              } else {
                sketch.clear();
              }
              // draw progress bar overlay only during generation
              if (typeof isgenerating !== 'undefined' && isgenerating) {
                var progress = (typeof NumberOfStroke !== 'undefined' && NumberOfStroke > 0)
                  ? generateOrder / NumberOfStroke
                  : 0;
                var barY = canHeight * 0.15;
                var barH = canHeight * 0.05;
                sketch.noStroke();
                
                sketch.fill(135, 206, 235, 128); // skyblue with ~0.5 alpha
                if(devMode == 0) {
                    sketch.rect(0, barY, canWidth * progress, barH);
                } else {
                    sketch.rect(0, 0, canWidth * progress, barH);
                }
              }
              
              // draw done buttons after generation completes
              if (that.doneUIShown) {
                var btnW = canWidth * 0.25;
                var btnH = canHeight * 0.05;
                var gap = canWidth * 0.03;
                var totalW = btnW * 2 + gap;
                var startX = (canWidth - totalW) / 2;
                var barY = canHeight * 0.15;
                var y = (devMode == 0) ? barY : 0;
                sketch.noStroke();
                sketch.fill(135, 206, 235, 128);
                // left button
                sketch.rect(startX, y, btnW, btnH);
                // right button
                sketch.rect(startX + btnW + gap, y, btnW, btnH);

                // cache button rects for click detection
                that.manualBtnRect = { x: startX, y: y, w: btnW, h: btnH };
                that.machineBtnRect = { x: startX + btnW + gap, y: y, w: btnW, h: btnH };

                // labels
                sketch.fill(0);
                sketch.textAlign(sketch.CENTER, sketch.CENTER);
                sketch.textSize(Math.max(12, btnH * 0.5));
                sketch.text('MANUAL', startX + btnW / 2, y + btnH / 2);
                sketch.text('MACHINE', startX + btnW + gap + btnW / 2, y + btnH / 2);
              }
                
            }
            sketch.mousePressed = function() {
              if (!that.doneUIShown) return;
              var mx = sketch.mouseX;
              var my = sketch.mouseY;
              function inRect(r){ return r && mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h; }
              if (inRect(that.manualBtnRect) || inRect(that.machineBtnRect)) {
                if (!that.savedTxtOnce) {
                  var combined = NR_PINS + ',' + stepsInstructions;
                  try { localStorage.setItem('data', combined); } catch(e) {}
                  // save txt via p5 instance API
                  try { sketch.saveStrings([combined], `${Date.now()}.txt`); } catch(e) {}
                  that.savedTxtOnce = true;
                }
                if (inRect(that.manualBtnRect)) {
                  // go to manual viewer which auto-loads from localStorage
                  window.location.href = 'indexmanual.html';
                } else {
                    window.location.href = 'indexbattle.html';
                }
              }
            }
        }
        new p5(s1);
    }
    draw() {
        // this.balanceCover.style.top = `${document.getElementById('colorBalance').getBoundingClientRect().top}px`;
        // if(!sori) this.balanceCover.style.height=`${document.getElementById('colorBalance').offsetHeight}px`;
        // else this.balanceCover.style.height = '0px';
        cursor(ARROW);
        if (bredraw) {
            framedrawPins(NR_PINS);
            bredraw = false
        }
        if (isgenerating ) {
            if (generateOrder == 0) {
                
                clearStrings();
                background(255);
                framedrawPins(NR_PINS);
                noStroke();
                fill(255);
                ellipse(canWidth/2, canHeight/2, SIZE, SIZE);
                document.getElementById('makeArt').childNodes[1].innerText = 'Start!!'
            }
            while (generateOrder < NumberOfStroke) {
                 var next = nextPin(current, used, imgCopy, minDist);   
                if (next < 0) {
                    NumberOfStroke = used.length;
                    break
                }
                drawSignStrings(current, next);
                var pair = pinPair(current, next);
                var tempPoints = lines[current * NR_PINS + next];
                reduceLine(imgCopy, tempPoints, lineFade);
                var a = next + '';
                if (generateOrder < NumberOfStroke - 1) {
                    a += ',';
                }
                stepsInstructions += a;
                used.push(pair);
                steps.push(next);
                current = next;
                generateOrder++;
                if (generateOrder % 10 == 0) {
                    break
                }
            }
            if (generateOrder == NumberOfStroke) {
                isgenerating = false;
                document.getElementById('makeArt').childNodes[1].innerText = 'Done'
                if (!this.doneUIShown) {
                    this.doneUIShown = true;
                }
                //fileName = `${Date.now()}`;
                //var imgfile = get(canWidth/2-SIZE/2-50, canHeight/2-SIZE/2-50, SIZE+100, SIZE+100);
                // imgfile.loadPixels();
                // imgfileBase64=imgfile.canvas.toDataURL();

            }
        }
    }
}
// function saveImage() {
//     //imgfile = get(canWidth/2-SIZE/2-50, canHeight/2-SIZE/2-50, SIZE+100, SIZE+100);
    
//     //console.log(imgfile.canvas.toDataURL())
//     save(imgfile, `${fileName}.png`)
// }
// function saveTxt() {
//     let data = split(stepsInstructions, ' ');
//     saveStrings(data, `${fileName}.txt`)
// }
function sendToHttp(stepsInstructions) {
    httpPost('http://localhost:3000', 'Json', stepsInstructions, function(result) {
    }, function(error) {
    })
}
