var adaptWidth;
var adaptHeight;
var sPage;
var editPage;
var genrPage;
var state;


function setup() {
    
    var colorbox = document.getElementsByClassName('colorbox');
    for( var i = 0; i < colorbox.length; i++ ){
        var section1 = colorbox.item(i);
        section1.style.height = `${section1.getBoundingClientRect().width}px`;
    }

    this.step01 = document.getElementById('step01');
    this.step02 = document.getElementById('step02');
    this.colorBalance = document.getElementById('colorBalance');
    if (float(screen.width) / float(screen.height) >= 1) {
        adaptWidth = screen.width;
        adaptHeight = screen.height;
    } else {
        adaptWidth = screen.height;
        adaptHeight = screen.width;
    }
    SIZE=screen.height*0.6;
    var a=document.getElementById('toolBar').getBoundingClientRect().width;
    createCanvas(adaptWidth, adaptHeight).parent('sketch-holder').position(a, 0);
    var saveList = document.getElementById('saveList');
    saveList.addEventListener('click', e => {
        if(e.target.innerText == 'IMAGE') {
            saveCanvas('myCanvas.jpg');;
        } else if(e.target.innerText == 'DATA') {
            let data = split(stepsInstructions, ' ');
            saveStrings(data, `${Date.now()}.txt`)
        }
    })
    state = 0;
    editPage = new editPicturePage();
    genrPage = new generatePage();
    canWidth=adaptWidth-a;
    canHeight=adaptHeight-(screen.height-windowHeight);
}
function draw() {
    if(state == 0) {
        this.step01.style.pointerEvents = 'auto';
        this.step01.style.opacity=1;
        this.step02.style.pointerEvents = 'none';
        this.step02.style.opacity=0.2;
        editPage.draw();
    } else if (state == 1) {
        this.step01.style.pointerEvents = 'none';
        this.step01.style.opacity=0.2;
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


