var linecolors = [];
var sori=false;
var testCanvas;
var fileName='';
class generatePage {
    constructor() {
        this.state = 0;
        
        this.imgorstring=document.getElementById('imgorstring');
        this.balanceScreen = document.getElementById('balanceScreen');
        this.remakeArt = document.getElementById('remakeArt');
        this.fcolorScreen = document.getElementById('fcolorScreen');
        this.balanceCover = document.getElementById('balanceCover');
        Array.from(this.fcolorScreen.children).forEach(
            v => v.style.backgroundColor=v.id
        )
        this.fcolorScreen.addEventListener('click', e => {
            var clicked = false;
            Array.from(this.fcolorScreen.children).forEach(
                v => {
                    if(v == e.target) {
                        clicked=true;
                        fColor=v.id;
                    }
                }
            )
            if(clicked) {
                bredraw = true;
            }
        })
        this.pcoverScreen=document.getElementById('pcoverScreen');
        Array.from(this.pcoverScreen.children).forEach(
            v => v.style.backgroundColor=v.id
        )
        this.pcoverScreen.addEventListener('click', (e) => {
            var clicked = false;
            Array.from(this.pcoverScreen.children).forEach(
                v => {
                    if(v == e.target) {
                        clicked=true;
                        if(v.id == "nocover") pinCoverUse=false;
                        else {pinCoverUse = true;cColor=v.id;}
                    }
                }
            )
            if(clicked) {
                bredraw = true;
            }
        })
        this.imgorstring.addEventListener('click', e => {
            const clicked = e.target;
            Array.from(this.imgorstring.children).forEach(
                v => v.classList.remove('selected')
            )
            if(clicked) {
                clicked.classList.add('selected');
                if(clicked.innerText=="IMAGE") {
                    sori=true;
                    this.balanceCover.style.height="0px";
                } else {
                    sori=false;
                    this.balanceCover.style.height=`${document.getElementById('colorBalance').getBoundingClientRect().height}px`;
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

            Array.from(this.imgorstring.children).forEach(
                v => {
                    if(v.innerText == "IMAGE") {
                        v.classList.remove('selected')
                    } else {
                        v.classList.add('selected')
                        this.balanceCover.style.height="65px";
                    }
                }
            )
        })
        this.backToStarted = document.getElementById('backToStarted')
        this.backToStarted.addEventListener('click', e => {
            Array.from(this.imgorstring.children).forEach(
                v => {
                    v.classList.remove('selected');
                    if(v.innerText=="STRING") v.classList.add('selected');
                }
            )
            sori=false;
            this.balanceCover.style.height=`${document.getElementById('colorBalance').offsetHeight}px`;
            state=0;
            document.getElementById('makeArt').childNodes[1].innerText = 'Generate';
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
        var s1 = function( sketch ) {
            sketch.setup = function() {
                var a=document.getElementById('toolBar').getBoundingClientRect().width;
                let canvas1 = sketch.createCanvas(adaptWidth, adaptHeight).parent('sketch-holder').position(a, 0);
                canvas1.background("rgba(100,100,100,0)");
            }
            sketch.draw = function() {
              sketch.background("rgba(100,100,100,0.0)");
              sketch.imageMode(CENTER);
              if(sori) {
                sketch.image(newColorImg,canWidth/2, canHeight/2, newColorImg.width, newColorImg.height);
              } else {
                sketch.clear();
              }
            }
          }
          new p5(s1);
    }
    draw() {
        this.balanceCover.style.top = `${document.getElementById('colorBalance').getBoundingClientRect().top}px`;
        if(!sori) this.balanceCover.style.height=`${document.getElementById('colorBalance').offsetHeight}px`;
        else this.balanceCover.style.height = '0px';
        cursor(ARROW);
        if (bredraw) {
            framedrawPins(NR_PINS);
            bredraw = false
        }
        if (isgenerating ) {
            if (generateOrder == 0) {
                
                clearStrings();
                background(100);
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
