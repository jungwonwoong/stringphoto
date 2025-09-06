var adaptWidth;
var adaptHeight;
var sPage;
var editPage;
var genrPage;
var state;
var devMode = 0; //0:mobile, 1:pc


function setup() {
    
    this.step01 = document.getElementById('step01');
    this.step02 = document.getElementById('step02');
    this.colorBalance = document.getElementById('colorBalance');
    adaptWidth = screen.width;
    adaptHeight = window.innerHeight;
    const userAgent = navigator.userAgent;

    canWidth=adaptWidth;
    canHeight=adaptHeight;
    
    if (/Mobi|Android|iPhone|iPad/i.test(userAgent)) {
        // 모바일 기기일 경우
        SIZE=canWidth*0.95;
        lineWidth=0.15;
        lineAlpha = 140;
        devMode = 0;
    } else {
        // PC일 경우
        SIZE=adaptHeight*0.8;
        lineWidth=0.2
        lineAlpha = 200;
        devMode = 1;
    }

    createCanvas(adaptWidth, adaptHeight).parent('sketch-holder').position(0, 0);
    var saveList = document.getElementById('saveList');
    saveList.addEventListener('click', e => {
        if(e.target.innerText == 'IMG') {
            saveCanvas('myCanvas.jpg');;
        } else if(e.target.innerText == 'DAT') {
            var combined = NR_PINS + ',' + stepsInstructions;
            let data = split(combined, ' ');
            
            saveStrings(data, `${Date.now()}.txt`)
        }
    })
    state = 0;
    editPage = new editPicturePage();
    genrPage = new generatePage();
    document.getElementById('bodyContainer').style.visibility = 'visible';
}
function draw() {
    if(state == 0) {
        this.step01.style.pointerEvents = 'auto';
        this.step01.style.opacity=1;
        this.step02.style.pointerEvents = 'none';
        this.step02.style.opacity=0;
        editPage.draw();
    } else if (state == 1) {
        this.step01.style.pointerEvents = 'none';
        this.step01.style.opacity=0;
        this.step02.style.pointerEvents = 'auto';
        this.step02.style.opacity=1;
        genrPage.draw();
    }
}
function touchStarted() {
  var touchpoints = [mouseX,mouseY];
  if (state == 0) {
      editPage.touchStart(touchpoints)
  }
}
function touchMoved() {
    var touchpoints = [mouseX,mouseY];
    if (state == 0) {
        editPage.touchMove(touchpoints)
    }
}
function touchEnded() {
    if (state == 0) {
        if (editPage.touchEnd()) {
                document.getElementById('makeArt').childNodes[1].innerText = 'Ready'
                state = 1;
                NR_PINS=editPage.numberOfPins;
                beginGenerate();
                isgenerating = true
        }
    }
}
function mouseWheel(e) {
  editPage.mouseWheel(e, mouseX, mouseY)
}


