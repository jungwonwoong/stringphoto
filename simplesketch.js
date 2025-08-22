var adaptWidth;
var adaptHeight;
var state;
var capstate =0;
let patternName = "";
let count=0;
let img, slider;
let strokeCount = 0;
let selectMode = 0;
let scrollMode = 0;
var p1,p2,r=7;

function preload() {
    img = loadImage('pattern/frame.png');
    capimg = loadImage('pattern/capframe.png')
}
function setup() {
    this.sketchholder1 = document.getElementById('sketchholder');
    this.slider = document.getElementById('slider');
    this.prev = document.getElementById('prev');
    this.next = document.getElementById('next');
    adaptWidth = window.innerWidth;
    adaptHeight = window.innerHeight;
    this.main = document.getElementById('main');
    this.board = document.getElementById('board');
    let button = createButton('Gallery');
    let capture = createButton('Capture');
    let data = createButton('Data');
    button.position(0, 0);
    button.size(100,50);
    capture.position(110,0);
    capture.size(100,50);
    data.position(220,0);
    data.size(100,50);
    Object.keys(imgFileName).forEach(function(key) {
        var imgele = document.createElement('img');
        imgele.src = imgFileName[key];
        imgele.width = adaptWidth/3
        imgele.height = imgele.width;
        this.main.appendChild(imgele);
    });
    this.main.addEventListener("touchstart", (e) => {
        this.main.style.overflow='scroll';
    })
    this.main.addEventListener("touchend", (e) => {
        if(e.target.src !== undefined && selectMode == 1) {
            selectMode = 0;
        this.sketchholder1.style.zIndex=1;
        this.board.style.zIndex=2;
        this.slider.style.zIndex=2;
        this.main.style.zIndex = 0;
        this.main.style.opacity = '0.0';
        patternName=e.target.src.split("/").pop().split(".")[0];
        
        this.slider.setAttribute("max", dataName[patternName].length-1);
        this.slider.setAttribute("step", 2);
        if(patternName.indexOf('Geo') > 0) { 
            state=2;
        } else {
            state=1;
        }
        console.log(state);
        count=0;
        }
    },false);
    this.board.style.top = `${button.height+10}px`;
    this.board.style.width = `${adaptWidth}px`;
    this.board.addEventListener("touchstart", (e) => {
        if(e.target.id == 'back') {
            strokeCount--;count=0;
        }
    })
    this.sketchholder1.addEventListener("touchstart", (e) => {
        if(strokeCount < dataName[patternName].length-2) {
            if(state == 1) strokeCount++;
            else if(state == 2) strokeCount += 2;
        }
        count =0;
    })
    button.mousePressed((e)=> {
        
        this.sketchholder1.style.zIndex=0;
        this.board.style.zIndex=0;
        this.slider.style.zIndex=0;
        this.main.style.zIndex = 1;
        this.main.style.opacity = '1.0';
        this.main.style.overflow='scroll';
        state=0;
        clear();
        background(200);
        strokeCount=0;
        this.board.childNodes[1].innerText='';
        this.board.childNodes[3].innerText='';
        this.board.childNodes[5].innerText='';
        count =0;
        
    });
    capture.mousePressed((e)=> {
        capstate=1;
        count =0;
        
    })
    data.mousePressed((e) => {
        var a;
        var arra = new Array();
        var j=0;
        if(state==1) { 
            a=1;
            for (let i = 0; i < strokeCount ; i=i+4) {
                var str = (dataName[patternName][i]).toString()+
                '       '+(dataName[patternName][i+1]).toString()+
                '       '+(dataName[patternName][i+2]).toString()+
                '       '+(dataName[patternName][i+3]).toString();
                arra[j]=str;
                j++;
            }
        } else if(state==2) {
            a=2;
            for (let i = 0; i < strokeCount ; i=i+6) {
                var str = (dataName[patternName][i]).toString()+'-'+(dataName[patternName][i+1]).toString()+
                '       '+(dataName[patternName][i+2]).toString()+'-'+(dataName[patternName][i+3]).toString()+
                '       '+(dataName[patternName][i+4]).toString()+'-'+(dataName[patternName][i+5]).toString();
                arra[j]=str;
                j++;
            }
        }

            saveStrings(arra, patternName,'txt',true)
    })
    this.slider.style.top = this.board.getBoundingClientRect().height + button.height+'px';
    this.slider.style.width = adaptWidth + 'px';
    this.slider.addEventListener('input', (e) => {
       
        strokeCount=Number(this.slider.value);
        console.log(typeof(this.slider.value),typeof(strokeCount));
        count=0;
        //if(state == 2) strokeCount *= 1;
    })
    this.prev.addEventListener('click', (e) => {
        if(strokeCount > 0) {
            if(state == 1) strokeCount--;
            else if(state == 2) strokeCount -= 2;
            count=0;
        }
    })
    this.next.addEventListener('click', (e) => {
        if(strokeCount < dataName[patternName].length-2) {
            if(state == 1) strokeCount++;
            else if(state == 2) strokeCount += 2;
            count=0;
            //console.log(this.slider.value);
        }
    })
    createCanvas(adaptWidth, adaptHeight).parent('sketchholder').position(0, 0);
    background(200);
    state = 0;
}
function draw() {
    if(state == 1){
        this.slider.value = strokeCount;
        if(count == 0) {
            lineDraw();
        }
    } else if(state == 2) {
        this.slider.value = strokeCount;
        if(count == 0) {
            clear();
            background(200);
            imageMode(CENTER);
            if(capstate == 0) image(img,adaptWidth/2,this.slider.getBoundingClientRect().bottom + adaptWidth/2,adaptWidth,adaptWidth);
            else if(capstate ==1) image(capimg,adaptWidth/2,this.slider.getBoundingClientRect().bottom + adaptWidth/2,adaptWidth,adaptWidth);

            count++;
            stroke('black');
            strokeWeight(1);
            var d = 2 * Math.PI / 120;
            var a = adaptWidth/2*0.84;
            var posX = adaptWidth/2, posY = this.slider.getBoundingClientRect().bottom + adaptWidth/2;
            var offset =r;
            if(dataName[patternName][0] > dataName[patternName][1]) strokeCount++;
            for (let i = 0; i < strokeCount+2 ; i+=2) {
                if(i>0) p0 = createVector(((a + a * Math.cos(dataName[patternName][i] * d)) - a)+posX,
                ((a + a * Math.sin(dataName[patternName][i] * d)) - a)+posY)
                p1 = createVector(((a + a * Math.cos(dataName[patternName][i] * d)) - a)+posX,
                ((a + a * Math.sin(dataName[patternName][i] * d)) - a)+posY)
                p2 = createVector(((a + a * Math.cos(dataName[patternName][i+1] * d)) - a)+posX,
                ((a + a * Math.sin(dataName[patternName][i+1] * d)) - a)+posY)
               if(i == strokeCount){
                    if(capstate == 0){
                        push()
                        stroke('red');
                        strokeWeight(4);
                        var angle = atan2(p1.y - p2.y, p1.x - p2.x);
                        translate(p2.x, p2.y);
                        rotate(angle-HALF_PI);
                        fill('red')
                        triangle(-offset*0.9, 4*offset, offset*0.9, 4*offset, 0, offset);
                        pop();
                        stroke(0);
                        strokeWeight(0)
                        fill('rgba(100%, 0%, 100%, 0.4)');
                        textSize(100)
                        textAlign(CENTER,CENTER); 
                        var txt = dataName[patternName][i] + '-' + dataName[patternName][i+1];
                        text(txt,posX, posY+a+80)
                        stroke('red');
                        strokeWeight(4);
                    }
                    if(strokeCount > 2) {
                        this.board.childNodes[1].innerHTML = `<span style="font-size:large;">Prev</span><span>${dataName[patternName][i-2]} - ${dataName[patternName][i-1]}</span>`;
                    } else {
                        this.board.childNodes[1].innerHTML = '<span style="font-size:large;">Start</span><span>0</span>';
                    }
                    this.board.childNodes[3].innerHTML = `<span style="font-size:large;">${strokeCount/2}/${dataName[patternName].length/2-1}</span><span style="font-size:xx-large;"> 
                    ${dataName[patternName][i]} - ${dataName[patternName][i+1]}</span>`;
                    if(strokeCount < dataName[patternName].length-2) {
                        this.board.childNodes[5].innerHTML =`<span style="font-size:large;">Next</span><span>${dataName[patternName][i+2]} - ${dataName[patternName][i+3]}</span>`;
                    } else {
                        this.board.childNodes[5].innerHTML = '<span style="font-size:large;">Finish</span><span>0</span>';
                    }
                }            
                line(p1.x, p1.y, p2.x, p2.y);
            }
            if(capstate == 1) {
                saveCanvas(patternName+'.jpg');
                capstate = 0;
            }
        }
    }
}
function touchStarted() {
    selectMode = 1;
    scrollMode = 0;
    this.main.style.overflow='scroll';
   
  }
  function touchMoved() {
      selectMode = 0;
      scrollMode = 1;
  }
  function touchEnded() {
    selectMode = 0;
    scrollMode = 0;
}
function lineDraw() {
           clear();
            background(200);
            imageMode(CENTER);
            if(capstate == 0) image(img,adaptWidth/2,this.slider.getBoundingClientRect().bottom + adaptWidth/2,adaptWidth,adaptWidth);
            else if(capstate ==1) image(capimg,adaptWidth/2,this.slider.getBoundingClientRect().bottom + adaptWidth/2,adaptWidth,adaptWidth);
            count++;
            stroke('black');
            strokeWeight(1);
            var d = 2 * Math.PI / 120;
            var a = adaptWidth/2*0.84;
            var posX = adaptWidth/2, posY = this.slider.getBoundingClientRect().bottom + adaptWidth/2;
            var offset =r;
            for (let i = 0; i < strokeCount ; i++) {
                p1 = createVector(((a + a * Math.cos(dataName[patternName][i] * d)) - a)+posX,
                ((a + a * Math.sin(dataName[patternName][i] * d)) - a)+posY)
                p2 = createVector(((a + a * Math.cos(dataName[patternName][i+1] * d)) - a)+posX,
                ((a + a * Math.sin(dataName[patternName][i+1] * d)) - a)+posY)
                if(i == strokeCount-1){
                    if(capstate == 0){
                    push()
                    stroke('magenta');
                    strokeWeight(4);
                    var angle = atan2(p1.y - p2.y, p1.x - p2.x);
                    translate(p2.x, p2.y);
                    rotate(angle-HALF_PI);
                    fill('magenta')
                    triangle(-offset*0.9, 4*offset, offset*0.9, 4*offset, 0, offset);
                    pop();
                    stroke(0);
                    strokeWeight(0)
                    fill('rgba(100%, 0%, 100%, 0.4)');
                    textSize(160)
                    textAlign(CENTER,CENTER);
                    text(dataName[patternName][i+1],posX, posY+a+110)
                    stroke('magenta');
                    strokeWeight(4);
                    }
                    if(strokeCount > 1) {
                        this.board.childNodes[1].innerHTML = `<span style="font-size:large;">Prev</span><span>${dataName[patternName][i]}</span>`;
                    } else {
                        this.board.childNodes[1].innerHTML = '<span style="font-size:large;">Start</span><span>0</span>';
                    }
                    this.board.childNodes[3].innerHTML = `<span style="font-size:large;">${strokeCount}/${dataName[patternName].length-2}</span><span style="font-size:xxx-large;"> 
                ${dataName[patternName][i+1]}</span>`;
                    if(strokeCount < dataName[patternName].length-2) {
                        this.board.childNodes[5].innerHTML =`<span style="font-size:large;">Next</span><span>${dataName[patternName][i+2]}</span>`;
                    } else {
                        this.board.childNodes[5].innerHTML = '<span style="font-size:large;">Finish</span><span>0</span>';
                    }
                }
                line(p1.x, p1.y, p2.x, p2.y);
            }
            if(capstate == 1) {
                saveCanvas(patternName+ '.jpg');
                capstate = 0;
            }
}




