// MARK String Art Sketch - UI 테스트용
// p5.js를 사용한 기본 스케치

var adaptWidth;
var adaptHeight;

// MARK 관련 변수들
let markConnected = false;
let markRunning = false;
let markPaused = false;
let markData = [];
let currentSequenceIndex = 0;
let sequenceNumbers = [];
let serialPort = null;
let serialReader = null;
let Pins = 320;
// 버튼 상태 변수들
let buttonStates = {
    CCW: false,    // A0
    CW: false,     // A1
    DN: false,     // A2
    FWD: false,    // A3
    REV: false,     // A4
    UP: false,    // A5
    ONOFF: false,  // D2
    SET: false,    // D3
    RESET: false   // RESET
};

// 버튼 클릭 영역 저장
let buttonAreas = {};

// 리셋 버튼 깜빡임 관련
let resetBlinkInterval = null;
let resetBlinkState = false;
function preload() {
    img_swbox = loadImage('textures/swbox.svg');
  }
function setup() {
    // 캔버스 생성 및 설정
    adaptWidth = window.innerWidth; // 왼쪽 컨트롤 패널 공간 확보
    adaptHeight = window.innerHeight-140;
    
    // 스케치 컨테이너에 캔버스 생= \-]
    let canvas = createCanvas(adaptWidth, adaptHeight);
    canvas.parent('sketch-container');
    
    // 초기 설정
    background(240);
    
    // 테스트용 텍스트 표시
    updateDisplay();
    //sendSequence([43,67,98,129,314,2,0,28]);
    // 파일 입력 이벤트 리스너
    var a=document.getElementById('control-panel').getBoundingClientRect().height;
    document.getElementById('main-content').style.marginTop = `${a}px`
    // 페이지 로드 시 기존 연결 정리
    cleanupOnPageLoad();
    
    // 마우스 이벤트 리스너
    canvas.mousePressed(handleMousePressed);
    canvas.mouseReleased(handleMouseReleased);
}

// 페이지 로드 시 기존 연결 정리
function cleanupOnPageLoad() {
    // 페이지가 로드될 때 기존 시리얼 연결 상태 초기화
    if (serialPort) {
        console.log('페이지 로드 시 기존 연결 정리 중...');
        disconnectMark();
    }
    
    // 브라우저 탭/창 닫힐 때 연결 해제
    window.addEventListener('beforeunload', function() {
        if (serialPort) {
            console.log('페이지 종료 시 연결 해제');
            disconnectMark();
        }
    });
}

function draw() {
    //sendSequence();
}

function updateDisplay() {
    clear();
    background(240);
    framedrawPins(Pins);
    // 버튼 패널 그리기
    drawButtonPanel();
    
    // 연결 상태 표시
    drawConnectionStatus();
    
    // 시퀀스 정보 표시
    drawSequenceInfo();
}

// 버튼 패널 그리기
function drawButtonPanel() {

    const panelX = 30;
    const panelY = 30;
    const swboxWidth=windowWidth*0.1;
    const swboxHeight=windowWidth*0.1;
    const buttonSize=swboxWidth*0.1057;
    const spacing = swboxWidth*0.237
    image(img_swbox, panelX,panelY,swboxWidth,swboxHeight);

    // 첫 줄: UP
    drawButton(buttonSize,panelX+swboxWidth*0.302, panelY+swboxWidth*0.1111, 'UP', buttonStates.UP, 'A0');
    // // 두번째 줄: REV, FWD
    drawButton(buttonSize,panelX + swboxWidth*0.302 + spacing,panelY+swboxWidth*0.1111+spacing/2, 'REV', buttonStates.REV, 'A1');
    drawButton(buttonSize,panelX + swboxWidth*0.302 + spacing*2,panelY+swboxWidth*0.1111+spacing/2, 'FWD', buttonStates.FWD, 'A2');
    
    // // 세번째 줄: DN
    // drawButton(buttonSize,panelX, panelY + buttonSize, 'DN', buttonStates.DN, 'A3');
    // // 네번째 줄: CCW, CW
    // drawButton(buttonSize,panelX + buttonSize + spacing, panelY + buttonSize + spacing + buttonSize/2, 'CCW', buttonStates.CCW, 'A5');
    // drawButton(buttonSize,panelX + (buttonSize + spacing) * 2, panelY + buttonSize + spacing + buttonSize/2, 'CW', buttonStates.CW, 'A4');
    
    // // 다섯번째 줄: RESET
    // drawButton(buttonSize,panelX, panelY + buttonSize + spacing + buttonSize/2, 'RESET', buttonStates.RESET, 'RESET');
    // // 여섯번째 줄: ON/OFF, SET
    // drawSlider(panelX, panelY + buttonSize + buttonSize, buttonStates.ONOFF, 'D2');
    // drawButton(buttonSize,panelX + buttonSize+25 + spacing+10 , panelY + buttonSize + spacing*2 + buttonSize, 'SET', buttonStates.SET, 'D3');
}

// 개별 버튼 그리기
function drawButton(buttonSize,x, y,label, isActive, pin) {
    // 버튼 배경 (원형)
    fill(isActive ? color(255, 0, 0) : color(0, 0, 0));
    stroke(0);
    strokeWeight(1);
    ellipse(x+buttonSize/2 , y+buttonSize/2, buttonSize, buttonSize);
    

    // 클릭 영역 저장
    buttonAreas[label] = {
        x: x, y: y, width: buttonSize, height: buttonSize, pin: pin
    };
}

// 슬라이더 그리기
function drawSlider(x, y, isOn, pin) {
    const sliderWidth = 40;
    const sliderHeight = 20;
    const knobSize = 15;
    
    // 슬라이더 배경
    fill(0);
    stroke(200);
    strokeWeight(3);
    rect(x, y + 35, sliderWidth, sliderHeight, 40);
    
    // 슬라이더 노브
    fill(isOn ? color(255, 0, 0) : color(0, 0, 0));
    const knobX = isOn ? x + sliderWidth - knobSize - 10 : x + 10;
    ellipse(knobX + knobSize/2, y + 35 + sliderHeight/2, knobSize, knobSize);
    
    // 라벨
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(10);
    text(isOn ? 'ON' : 'OFF', x + 10, y + 25);
    
    // // 핀 정보
    // textSize(12);
    // text(pin, x + 75, y + 130);
    
    // 클릭 영역 저장
    buttonAreas['ON/OFF'] = {
        x: x, y: y, width: sliderWidth, height: 150, pin: pin, isSlider: true
    };
}

// 연결 상태 표시
function drawConnectionStatus() {
    const statusX = 300;
    const statusY = 30;
    
    textAlign(LEFT, TOP);
    textSize(18);
    
    if (markConnected) {
        fill(0, 150, 0);
        text('MARK 연결됨', statusX, statusY);
        fill(0, 150, 0);
    } else {
        fill(150, 0, 0);
        text('MARK 연결 안됨', windowWidth*0.15, statusY);
        fill(150, 0, 0);
    }

}

// 시퀀스 정보 표시
function drawSequenceInfo() {
    const infoX = 300;
    const infoY = 60;
    
    textAlign(LEFT, TOP);
    textSize(16);
    fill(80);
    
    if (sequenceNumbers.length > 0) {
        text(`로드된 시퀀스: ${sequenceNumbers.length}개 숫자`, infoX, infoY);
        text(`현재 진행: ${currentSequenceIndex + 1}/${sequenceNumbers.length}`, infoX, infoY + 25);
        text(`현재 값: ${sequenceNumbers[currentSequenceIndex] || '대기중'}`, infoX, infoY + 50);
    } else {
        textAlign(LEFT);
        text('시퀀스 파일을 로드해주세요', windowWidth*0.15, 60);
    }
}

// 파일 선택 처리
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            parseSequenceFile(content);
        };
        reader.readAsText(file);
    } else {
        alert('올바른 .txt 파일을 선택해주세요.');
    }
}

// 시퀀스 파일 파싱
function parseSequenceFile(content) {
    try {
        // 쉼표로 구분된 숫자들을 파싱
        sequenceNumbers = content.split(',')
            .map(num => num.trim())
            .filter(num => num !== '')
            .map(num => parseInt(num))
            .filter(num => !isNaN(num));
        
        if (sequenceNumbers.length === 0) {
            alert('파일에서 유효한 숫자를 찾을 수 없습니다.');
            return;
        }
        
        currentSequenceIndex = 0;
        console.log('시퀀스 로드됨:', sequenceNumbers);
        updateDisplay();
        
        // 파일 입력 초기화
        document.getElementById('file-input').value = '';
        
    } catch (error) {
        console.error('파일 파싱 오류:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
    }
}

// MARK 관련 함수들
function startMark() {
    if (!markConnected) {
        alert('먼저 MARK를 연결해주세요.');
        return;
    }
    
    if (sequenceNumbers.length === 0) {
        alert('먼저 시퀀스 파일을 로드해주세요.');
        return;
    }
    
    if (!markRunning) {
        markRunning = true;
        markPaused = false;
        currentSequenceIndex = 0;
        console.log('MARK 시퀀스 시작됨');
        updateDisplay();
        
        // 시퀀스 시작
        advanceSequence();
    }
}

function pauseMark() {
    if (markRunning) {
        markPaused = !markPaused;
        console.log(markPaused ? 'MARK 일시정지됨' : 'MARK 재개됨');
        
        // 버튼 텍스트 업데이트
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = markPaused ? '재개' : '일시정지';
        }
        
        // 일시정지 해제 시 시퀀스 재개
        if (!markPaused && markRunning) {
            advanceSequence();
        }
    }
}

function stopMark() {
    markRunning = false;
    markPaused = false;
    currentSequenceIndex = 0;
    console.log('MARK 정지됨');
    updateDisplay();
}

function resetMark() {
    markRunning = false;
    markPaused = false;
    currentSequenceIndex = 0;
    sequenceNumbers = [];
    console.log('MARK 리셋됨');
    updateDisplay();
}

// Web Serial API를 사용한 MARK 연결
async function connectMark() {
    try {
        // Web Serial API 지원 확인
        if (!navigator.serial) {
            alert('이 브라우저는 Web Serial API를 지원하지 않습니다. Chrome을 사용해주세요.');
            return;
        }
        
        // 이미 연결된 포트가 있다면 먼저 해제
        if (serialPort) {
            await disconnectMark();
        }
        
        // 포트 선택 (브라우저가 자동으로 사용 가능한 포트를 보여줘)
        const port = await navigator.serial.requestPort();
        
        // 포트 정보 확인
        console.log('선택된 포트 정보:', port);
        
        // 포트 열기 시도 (여러 설정으로 시도)
        let portOpened = false;
        const baudRates = [9600, 115200, 57600, 38400];
        
        for (const baudRate of baudRates) {
            try {
                console.log(`${baudRate} baud로 포트 열기 시도...`);
                await port.open({ baudRate: baudRate });
                portOpened = true;
                console.log(`${baudRate} baud로 포트 열기 성공!`);
                break;
            } catch (openError) {
                console.log(`${baudRate} baud로 포트 열기 실패:`, openError.message);
                if (baudRate === baudRates[baudRates.length - 1]) {
                    throw new Error(`모든 baud rate로 포트 열기 실패. 마지막 오류: ${openError.message}`);
                }
            }
        }
        
        if (!portOpened) {
            throw new Error('포트를 열 수 없습니다.');
        }
        
        serialPort = port;
        console.log('Serial 포트 열림:', port);
        
        // 잠시 대기 (아두이노 리셋 대기)
        console.log('아두이노 리셋 대기 중... (2초)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // StringPhoto 기기 식별 시도
        const isStringPhotoDevice = await identifyStringPhotoDevice(port);
        
        if (isStringPhotoDevice) {
            markConnected = true;
            console.log('StringPhoto 기기 연결 성공!');
            alert('StringPhoto 기기에 성공적으로 연결되었습니다!');
            
            // Serial 읽기 시작
            startSerialReading();
            
            // 버튼 활성화 (indexstringartm.html에서 사용)
            if (typeof window.enableAllButtons === 'function') {
                window.enableAllButtons();
            }
            
            updateDisplay();
        } else {
            await port.close();
            serialPort = null;
            alert('StringPhoto 기기가 아닙니다. 올바른 기기를 선택해 주세요.');
            console.log('연결 실패 - StringPhoto 기기가 아님');
        }
        
    } catch (error) {
        console.error('Serial 연결 오류:', error);
        
        // 더 구체적인 오류 메시지 제공
        if (error.name === 'NotFoundError') {
            alert('사용자가 포트 선택을 취소했습니다.');
        } else if (error.message.includes('Failed to open serial port')) {
            alert('시리얼 포트를 열 수 없습니다.\n\n해결 방법:\n1. 아두이노 IDE의 시리얼 모니터를 닫아주세요\n2. 다른 프로그램에서 포트를 사용 중지해주세요\n3. 브라우저를 새로고침한 후 다시 시도해주세요');
        } else if (error.message.includes('Access denied')) {
            alert('시리얼 포트 접근이 거부되었습니다.\n\n해결 방법:\n1. 브라우저를 관리자 권한으로 실행해주세요\n2. 다른 프로그램에서 포트를 사용 중지해주세요');
        } else {
            alert('Serial 연결 중 오류가 발생했습니다:\n' + error.message);
        }
    }
}

// StringPhoto 기기 식별 (아두이노 우노/나노 모두 지원)
async function identifyStringPhotoDevice(port) {
    try {
        console.log('아두이노 기기 식별 시작...');
        
        // 1. VID/PID 확인 (가능한 경우)
        if (port.getInfo) {
            try {
                const info = port.getInfo();
                console.log('포트 정보:', info);
                
                // 아두이노 우노와 나노의 일반적인 VID/PID
                const arduinoVIDs = [
                    0x2341, // Arduino LLC
                    0x2A03, // Arduino.org
                    0x0403, // FTDI
                    0x10C4, // Silicon Labs CP210x
                    0x1A86, // QinHeng Electronics CH340
                    0x1969, // WCH.CN CH340
                    0x067B, // Prolific Technology Inc.
                ];
                
                const arduinoPIDs = [
                    0x0043, // Arduino Uno
                    0x0001, // Arduino Uno
                    0x6001, // FTDI
                    0xEA60, // CP210x
                    0x7523, // CH340
                    0x2918, // CH340
                    0x2303, // Prolific
                ];
                
                if (info.usbVendorId && info.usbProductId) {
                    const vid = info.usbVendorId;
                    const pid = info.usbProductId;
                    console.log(`VID: 0x${vid.toString(16).toUpperCase()}, PID: 0x${pid.toString(16).toUpperCase()}`);
                    
                    if (arduinoVIDs.includes(vid) && arduinoPIDs.includes(pid)) {
                        console.log('VID/PID로 아두이노 기기 확인됨 (1차 확인 성공)');
                        // 1차 확인 성공, 이제 2차 StringPhoto 응답 확인 필요
                    } else {
                        console.log('VID/PID가 아두이노 기기와 일치하지 않음');
                        return false; // 아두이노가 아니면 즉시 실패
                    }
                } else {
                    console.log('VID/PID 정보 없음, 다음 단계로 진행');
                }
            } catch (error) {
                console.log('포트 정보 가져오기 실패:', error);
            }
        }
        
        // 2. StringPhoto 기기 응답 확인 (2차 확인)
        console.log('2차 확인: StringPhoto 기기 응답 테스트 시작...');
        const isStringPhoto = await testArduinoCommands(port);
        if (isStringPhoto) {
            console.log('StringPhoto 기기 확인됨! (2차 확인 성공)');
            return true;
        } else {
            console.log('StringPhoto 기기 응답 없음 (2차 확인 실패)');
            return false;
        }
        
    } catch (error) {
        console.error('아두이노 기기 식별 오류:', error);
        return false;
    }
}

// 아두이노 특정 명령어로 식별
async function testArduinoCommands(port) {
    try {
        console.log('StringPhoto 기기 식별 시작...');
        
        const writer = port.writable.getWriter();
        
        // StringPhoto 기기 식별 명령
        const identifyCommand = new TextEncoder().encode('IDENTIFY\n');
        await writer.write(identifyCommand);
        writer.releaseLock();
        
        console.log('IDENTIFY 명령 전송됨');
        
        // 응답 읽기 (2초 대기)
        const reader = port.readable.getReader();
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 2000)
        );
        
        try {
            const { value, done } = await Promise.race([
                reader.read(),
                timeout
            ]);
            
            reader.releaseLock();
            
            if (value) {
                const response = new TextDecoder().decode(value);
                console.log('기기 응답:', response);
                
                // "stringphoto" 응답 확인 (대소문자 구분 없음)
                if (response.toLowerCase().includes('stringphoto')) {
                    console.log('StringPhoto 기기 확인됨!');
                    return true;
                } 
                // 임시: "638" 응답도 허용 (테스트용)
                else if (response.includes('638')) {
                    console.log('StringPhoto 기기 확인됨! (임시 허용: 638)');
                    return true;
                }
                else {
                    console.log('StringPhoto 기기가 아님. 응답:', response);
                    return false;
                }
            } else {
                console.log('응답 없음');
                return false;
            }
            
        } catch (error) {
            reader.releaseLock();
            console.log('응답 대기 시간 초과');
            return false;
        }
        
    } catch (error) {
        console.error('StringPhoto 기기 식별 오류:', error);
        return false;
    }
}

// 기본 연결 테스트 (마지막 수단)
async function testBasicConnection(port) {
    try {
        const writer = port.writable.getWriter();
        const testCommand = new TextEncoder().encode('TEST\n');
        await writer.write(testCommand);
        writer.releaseLock();
        
        // 응답 대기 (1초)
        const reader = port.readable.getReader();
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 1000)
        );
        
        try {
            const { value, done } = await Promise.race([
                reader.read(),
                timeout
            ]);
            
            reader.releaseLock();
            
            if (value) {
                const response = new TextDecoder().decode(value);
                console.log('기본 테스트 응답:', response);
                return response.length > 0;
            }
            
            return false;
            
        } catch (error) {
            reader.releaseLock();
            console.log('기본 테스트 응답 없음');
            return false;
        }
        
    } catch (error) {
        console.error('기본 연결 테스트 오류:', error);
        return false;
    }
}

// Serial 읽기 시작
async function startSerialReading() {
    if (!serialPort) return;
    
    try {
        const reader = serialPort.readable.getReader();
        serialReader = reader;
        
        let buffer = ''; // 데이터 버퍼
        
        while (true) {
            try {
                const { value, done } = await reader.read();
                if (done) break;
                
                const data = new TextDecoder().decode(value);
                buffer += data; // 버퍼에 데이터 추가
                
                // 완전한 라인 처리
                const lines = buffer.split('\n');
                buffer = lines.pop(); // 마지막 불완전한 라인은 버퍼에 유지
                
                for (const line of lines) {
                    if (line.trim()) { // 빈 라인 제외
                        console.log('Serial 수신:', line.trim());
                        handleArduinoResponse(line.trim());
                    }
                }
                
            } catch (error) {
                console.error('Serial 읽기 오류:', error);
                break;
            }
        }
        
    } catch (error) {
        console.error('Serial 읽기 시작 오류:', error);
    }
}

// 아두이노 응답 처리
function handleArduinoResponse(data) {
    // 아두이노로부터의 응답을 처리하는 로직
    if (data.includes('READY')) {
        console.log('아두이노 준비 완료');
    } else if (data.includes('DONE')) {
        console.log('아두이노 작업 완료');
    } else if (data.includes('ERROR')) {
        console.log('아두이노 오류 발생');
    } else if (data.includes('RESET')) {
        console.log('아두이노 리셋 완료');
    }
    
    // 버튼 상태 업데이트 처리
    // 형식: "BUTTON:STATE" (예: "FWD:ON", "UP:OFF")
    const buttonMatch = data.match(/^(\w+):(ON|OFF)$/);
    if (buttonMatch) {
        const button = buttonMatch[1];
        const state = buttonMatch[2] === 'ON';
        
        // 버튼 상태 업데이트 (상호 배타적)
        if (button === 'ONOFF') {
            buttonStates.ONOFF = state;
        } else if (button === 'RESET') {
            buttonStates.RESET = state;
        } else if (buttonStates.hasOwnProperty(button)) {
            if (state) {
                // ON 상태일 때: 다른 모든 버튼을 OFF로 만들고 현재 버튼만 ON
                for (const otherButton in buttonStates) {
                    if (otherButton !== 'ONOFF' && otherButton !== 'RESET' && otherButton !== button) {
                        buttonStates[otherButton] = false;
                    }
                }
                buttonStates[button] = true;
            } else {
                // OFF 상태일 때: 현재 버튼만 OFF
                buttonStates[button] = false;
            }
        }
        
        console.log(`아두이노로부터 버튼 상태 수신: ${button} = ${state ? 'ON' : 'OFF'}`);
        updateDisplay();
    }
}

// Serial 통신으로 데이터 전송
async function sendToArduino(data) {
    if (!serialPort || !markConnected) {
        console.log('Serial 포트가 연결되지 않았습니다.');
        return false;
    }
    
    try {
        const writer = serialPort.writable.getWriter();
        const command = new TextEncoder().encode(data.toString() + '\n');
        await writer.write(command);
        writer.releaseLock();
        
        console.log(`아두이노로 전송: ${data}`);
        return true;
        
    } catch (error) {
        console.error('Serial 전송 오류:', error);
        return false;
    }
}

// 연결 해제
async function disconnectMark() {
    if (serialPort) {
        try {
            console.log('Serial 포트 연결 해제 시작...');
            
            // Serial 읽기 중지
            if (serialReader) {
                try {
                    serialReader.releaseLock();
                    serialReader = null;
                    console.log('Serial 읽기 중지됨');
                } catch (error) {
                    console.log('Serial 읽기 중지 중 오류:', error);
                }
            }
            
            // 포트 닫기
            try {
                await serialPort.close();
                console.log('Serial 포트 닫힘');
            } catch (error) {
                console.log('Serial 포트 닫기 중 오류:', error);
            }
            
            // 상태 초기화
            serialPort = null;
            markConnected = false;
            markRunning = false;
            markPaused = false;
            
            // 버튼 비활성화 (indexstringartm.html에서 사용)
            if (typeof window.disableAllButtons === 'function') {
                window.disableAllButtons();
            }
            
            console.log('Serial 포트 연결 해제 완료');
            updateDisplay();
            
        } catch (error) {
            console.error('연결 해제 중 오류:', error);
            // 강제로 상태 초기화
            serialPort = null;
            markConnected = false;
            markRunning = false;
            markPaused = false;
            
            // 버튼 비활성화 (indexstringartm.html에서 사용)
            if (typeof window.disableAllButtons === 'function') {
                window.disableAllButtons();
            }
            
            updateDisplay();
        }
    }
}

// 시퀀스 진행 (실제 Serial 통신으로 데이터 전송)
async function advanceSequence() {
    if (markRunning && !markPaused && sequenceNumbers.length > 0) {
        if (currentSequenceIndex < sequenceNumbers.length) {
            const currentValue = sequenceNumbers[currentSequenceIndex];
            console.log(`시퀀스 진행: ${currentValue} (${currentSequenceIndex + 1}/${sequenceNumbers.length})`);
            
            // Serial 통신으로 데이터 전송
            const sent = await sendSequence("0,2,3,2,6,8,0");
            
            if (sent) {
                currentSequenceIndex++;
                updateDisplay();
                
                // 다음 시퀀스로 진행 (1초 간격)
                if (currentSequenceIndex < sequenceNumbers.length) {
                    setTimeout(advanceSequence, 1000);
                } else {
                    console.log('시퀀스 완료!');
                    markRunning = false;
                    updateDisplay();
                }
            } else {
                console.log('데이터 전송 실패, 시퀀스 중단');
                markRunning = false;
                updateDisplay();
            }
        }
    }
}

// 마우스 다운 처리 (버튼 누를 때)
function handleMousePressed() {
    const clickX = mouseX;
    const clickY = mouseY;
    
    // 각 버튼 영역 확인
    for (const [label, area] of Object.entries(buttonAreas)) {
        if (clickX >= area.x && clickX <= area.x + area.width &&
            clickY >= area.y && clickY <= area.y + area.height) {
            
            handleButtonClick(label, area);
            break;
        }
    }
}

// 마우스 업 처리 (버튼 뗄 때)
function handleMouseReleased() {
    const clickX = mouseX;
    const clickY = mouseY;
    
    // 각 버튼 영역 확인
    for (const [label, area] of Object.entries(buttonAreas)) {
        if (clickX >= area.x && clickX <= area.x + area.width &&
            clickY >= area.y && clickY <= area.y + area.height) {
            
            // 일반 택트 스위치만 버튼 업 처리
            if (label !== 'RESET' && label !== 'ON/OFF') {
                handleButtonUp(label);
            }
            break;
        }
    }
}

// 버튼 클릭 처리
function handleButtonClick(label, area) {
    console.log(`버튼 클릭: ${label} (핀: ${area.pin})`);
    
    if (label === 'RESET') {
        // 리셋 버튼은 특별 처리
        handleResetButton();
    } else if (label === 'ON/OFF') {
        // 슬라이더 스위치 토글
        buttonStates.ONOFF = !buttonStates.ONOFF;
        sendButtonStateToArduino('ONOFF', buttonStates.ONOFF);
        updateDisplay();
    } else {
        // 일반 택트 스위치 - 버튼 다운 처리
        handleButtonDown(label);
    }
}

// 버튼 다운 처리 (누를 때)
function handleButtonDown(label) {
    console.log(`버튼 다운: ${label}`);
    buttonStates[label] = true;
    sendButtonStateToArduino(label, true);
    updateDisplay();
}

// 버튼 업 처리 (뗄 때)
function handleButtonUp(label) {
    console.log(`버튼 업: ${label}`);
    buttonStates[label] = false;
    sendButtonStateToArduino(label, false);
    updateDisplay();
}

// 리셋 버튼 처리
function handleResetButton() {
    if (resetBlinkInterval) return; // 이미 실행 중이면 무시
    
    console.log('리셋 버튼 시작');
    
    // 리셋 깜빡임 시작
    resetBlinkInterval = setInterval(() => {
        resetBlinkState = !resetBlinkState;
        buttonStates.RESET = resetBlinkState;
        updateDisplay();
    }, 200);
    
    // 2초 후 리셋 완료
    setTimeout(() => {
        if (resetBlinkInterval) {
            clearInterval(resetBlinkInterval);
            resetBlinkInterval = null;
        }
        buttonStates.RESET = false;
        resetBlinkState = false;
        
        // 아두이노에 리셋 명령 전송
        sendButtonStateToArduino('RESET', false);
        
        console.log('리셋 완료');
        updateDisplay();
    }, 2000);
}

// 아두이노로 버튼 상태 전송
async function sendButtonStateToArduino(button, state) {
    if (!markConnected || !serialPort) {
        console.log('아두이노가 연결되지 않았습니다.');
        return;
    }
    
    try {
        const command = `${button}:${state ? 'ON' : 'OFF'}\n`;
        
        // WritableStream이 잠겨있는지 확인
        if (serialPort.writable.locked) {
            console.log('WritableStream이 잠겨있음, 잠시 대기...');
            // 잠시 대기 후 재시도
            await new Promise(resolve => setTimeout(resolve, 10));
            
            // 여전히 잠겨있다면 건너뛰기
            if (serialPort.writable.locked) {
                console.log('WritableStream이 여전히 잠겨있음, 전송 건너뛰기');
                return;
            }
        }
        
        const writer = serialPort.writable.getWriter();
        await writer.write(new TextEncoder().encode(command));
        writer.releaseLock();
        
        console.log(`아두이노로 전송: ${button} = ${state ? 'ON' : 'OFF'}`);
        
    } catch (error) {
        console.error('버튼 상태 전송 오류:', error);
        
        // WritableStream 잠금 오류인 경우 특별 처리
        if (error.message.includes('locked')) {
            console.log('WritableStream 잠금 오류, 전송 재시도 중...');
            // 잠시 후 재시도
            setTimeout(() => {
                sendButtonStateToArduino(button, state);
            }, 50);
        }
    }
}

// 윈도우 리사이즈 처리
function windowResized() {
    adaptWidth = windowWidth;
    adaptHeight = windowHeight;
    resizeCanvas(adaptWidth, adaptHeight);
    updateDisplay();
}
function framedrawPins(pins) {
    if(adaptWidth>adaptHeight) {
        SIZE=adaptHeight;
    } else {     
            SIZE=adaptWidth;
    }
    if(pins == 240) framethickness = SIZE*0.1134/2;
    if(pins == 280) framethickness = SIZE*0.0866/2;
    if(pins == 320) framethickness = SIZE*0.1015;
    ellipseMode(CENTER);
    fill('rgba(100,100,100, 0)');
    stroke('rgba(255,255,255,0)');
    stroke('black');
    stroke(0);
    strokeWeight(1);
    if(adaptWidth>adaptHeight) {
    translate(adaptWidth/2 ,adaptHeight/2);
    } else {
        translate(adaptWidth/2 ,adaptHeight/2);
    }
    for (var i = 0; i < pins; i++) {
        angleMode(RADIANS);
        textSize(10);
        textAlign(CENTER,CENTER);
        stroke('rgba(0, 0, 0, 1)');
        strokeWeight(1);
        fill(0);
        ellipse(SIZE/2-60,0,1,1)
        if(i%5 == 0) {
            line(SIZE/2-60,0,SIZE/2-60+10,0)
            text(i,SIZE/2-60+20,0)           
        } else {
             line(SIZE/2-60,0,SIZE/2-60+5,0)
        }
         rotate((-TWO_PI / float(pins)));
    }
    translate(-adaptWidth/2,-adaptHeight/2);
   rectMode(CORNER)
}
function lineDraw() {
    clear();
     background(255);
     framedrawPins(Pins);
     count++;
     stroke('black');
     strokeWeight(1);
     var d = -2 * Math.PI / Pins;
     var a = SIZE/2-60;
     var posX = adaptWidth/2, posY = SIZE/2;
     var offset =r;
     for (let i = 0; i < strokeCount ; i+=2) {
         p1 = createVector(((a + a * Math.cos(Math.abs(dataName[patternName][i]) * d)) - a)+posX,
         ((a + a * Math.sin(Math.abs(dataName[patternName][i]) * d)) - a)+posY)
         p2 = createVector(((a + a * Math.cos(Math.abs(dataName[patternName][i+1]) * d)) - a)+posX,
         ((a + a * Math.sin(Math.abs(dataName[patternName][i+1]) * d)) - a)+posY)
         if(i == strokeCount-2){
             if(capstate == 0){
             stroke(0);
             strokeWeight(0)
             fill('rgba(100%, 0%, 100%, 0.4)');
             textSize(160)
             textAlign(CENTER,CENTER);
             text(Math.abs(dataName[patternName][i+1]),posX, posY+a+110)
             stroke('magenta');
             strokeWeight(3);
             }
             if(strokeCount > 2) {
                 this.drawcanvas.childNodes[1].innerHTML = `<span style="font-size:large;">Prev</span><span>${Math.abs(dataName[patternName][i-2])} - ${Math.abs(dataName[patternName][i-1])}</span>`;
             } else {
                 this.drawcanvas.childNodes[1].innerHTML = '<span style="font-size:large;">Start</span><span>0</span>';
             }
             this.drawcanvas.childNodes[3].innerHTML = `<span style="font-size:large;">${strokeCount/2}/${dataName[patternName].length/2-1}</span><span style="font-size:xx-large;"> 
         ${Math.abs(dataName[patternName][i])} - ${Math.abs(dataName[patternName][i+1])}</span>`;
             if(strokeCount < dataName[patternName].length-2) {
                 this.drawcanvas.childNodes[5].innerHTML =`<span style="font-size:large;">Next</span><span>${Math.abs(dataName[patternName][i+2])} - ${Math.abs(dataName[patternName][i+3])}</span>`;
             } else {
                 this.drawcanvas.childNodes[5].innerHTML = '<span style="font-size:large;">Finish</span><span>0</span>';
             }
         }
         line(p1.x, p1.y, p2.x, p2.y);
     }
     if(capstate == 1) {
         saveCanvas(patternName+ '.jpg');
         capstate = 0;
     }
}