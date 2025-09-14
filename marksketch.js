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
let serialWriter = null;
let Pins = 320;
let readyState = true;
// BULK sending state
let totalLength = 0;
let bulkChunkSize = 100;
let bulkOffset = 0;
let bulkSending = false;
let waitingOkForBulk = false;
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

// 길게 누르는 동안 연속 전송을 위한 상태
let holdIntervals = {};
const HOLD_INTERVAL_MS = 3;

// 버튼 클릭 영역 저장
let buttonAreas = {};

// 리셋 버튼 깜빡임 관련
let resetBlinkInterval = null;
let resetBlinkState = false;
// 드래그 아웃 감지를 위한 상태
let currentPressedLabel = null;
let canvasDom = null;
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
    // 실제 캔버스 DOM 보관
    canvasDom = canvas.canvas || (canvas.elt || null);
    
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
    // 로컬스토리지 우선 로딩 (파일 오픈 시에는 그 데이터가 우선 적용됨)
    loadSequenceFromLocalStorage();
    
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


    if(!markRunning) {
        changeData();
    }
    // 연결 상태 표시
    drawConnectionStatus();
    
    // 시퀀스 정보 표시
    drawSequenceInfo();
}
function changeData() {
    const displayIndex = Math.min(Math.max(currentSequenceIndex, 0), sequenceNumbers.length - 1);
    stepNow = sequenceNumbers[displayIndex];
    stepNext = sequenceNumbers[displayIndex + 1];
    console.log(stepNow);
    console.log(stepNext);

}

// 연결 상태 표시
function drawConnectionStatus() {
    const statusX = 300;
    const statusY = 30;
    
    textAlign(LEFT, TOP);
    textSize(18);
    
    if (markConnected) {
        fill(0, 150, 0);
        text('BATTLE 연결됨', statusX, statusY);
        fill(0, 150, 0);
    } else {
        fill(150, 0, 0);
        text('BATTLE 연결 안됨', windowWidth*0.15, statusY);
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
        const displayIndex = Math.min(Math.max(currentSequenceIndex, 0), sequenceNumbers.length - 1);
        const currentVal = sequenceNumbers[displayIndex];
        text(`로드된 시퀀스: ${sequenceNumbers.length}개 숫자`, infoX, infoY);
        text(`현재 진행: ${displayIndex + 1}/${sequenceNumbers.length}`, infoX, infoY + 25);
        text(`현재 값: ${currentVal !== undefined ? currentVal : '대기중'}`, infoX, infoY + 50);
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
        const nums = content.split(',')
            .map(num => num.trim())
            .filter(num => num !== '')
            .map(num => parseInt(num))
            .filter(num => !isNaN(num));
        
        if (nums.length === 0) {
            alert('파일에서 유효한 숫자를 찾을 수 없습니다.');
            return;
        }
        // 첫 번째 값은 핀 개수(PINS), 나머지는 시퀀스
        Pins = nums[0];
        sequenceNumbers = nums.slice(1);
        
        currentSequenceIndex = 0;
        console.log('핀수(PINS):', Pins, '시퀀스 길이:', sequenceNumbers.length);
        updateDisplay();
        
        // 파일 입력 초기화
        document.getElementById('file-input').value = '';
        
    } catch (error) {
        console.error('파일 파싱 오류:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
    }
}

// 로컬스토리지에 저장된 "핀수,시퀀스..." 문자열 파싱 및 적용
function loadSequenceFromLocalStorage() {
    try {
        const saved = localStorage.getItem('data');
        if (typeof saved === 'string' && saved.trim().length > 0) {
            applyLocalStorageSequence(saved);
        }
    } catch (e) { /* ignore */ }
}

function applyLocalStorageSequence(str) {
    const parts = str.split(',').map(s => s.trim()).filter(s => s !== '');
    if (parts.length === 0) return;
    const maybePins = parseInt(parts[0]);
    let startIdx = 0;
    if (!isNaN(maybePins) && maybePins > 0) {
        Pins = maybePins;
        startIdx = 1;
    }
    const nums = parts.slice(startIdx).map(n => parseInt(n)).filter(n => !isNaN(n));
    if (nums.length > 0) {
        sequenceNumbers = nums;
        currentSequenceIndex = 0;
        updateDisplay();
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
        
        // 배치 전송 시작
        startBulkTransfer();
    }
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
        // console.log('선택된 포트 정보:', port);
        
        // 포트 열기 시도 (여러 설정으로 시도)
        let portOpened = false;
        const baudRates = [115200, 9600];
        
        for (const baudRate of baudRates) {
            try {
                // console.log(`${baudRate} baud로 포트 열기 시도...`);
                await port.open({ baudRate: baudRate });
                portOpened = true;
                // console.log(`${baudRate} baud로 포트 열기 성공!`);
                break;
            } catch (openError) {
                // console.log(`${baudRate} baud로 포트 열기 실패:`, openError.message);
                if (baudRate === baudRates[baudRates.length - 1]) {
                    throw new Error(`모든 baud rate로 포트 열기 실패. 마지막 오류: ${openError.message}`);
                }
            }
        }
        
        if (!portOpened) {
            throw new Error('포트를 열 수 없습니다.');
        }
        
        serialPort = port;
        // console.log('Serial 포트 열림:', port);
        
        // 잠시 대기 (아두이노 리셋 대기)
        // console.log('아두이노 리셋 대기 중... (2초)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        // 식별/읽기 생략: 쓰기 전용 모드로 전환
        markConnected = true;
        serialWriter = serialPort.writable.getWriter();
        // ON/OFF 상태 업데이트 수신 시작
        startSerialReading();
        if (typeof window.enableAllButtons === 'function') {
            window.enableAllButtons();
        }
        updateDisplay();
        
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

// Serial 읽기 시작 (ON/OFF 상태 수신 전용)
async function startSerialReading() {
    if (!serialPort) return;
    try {
        const reader = serialPort.readable.getReader();
        serialReader = reader;
        let buffer = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const data = new TextDecoder().decode(value);
            buffer += data;
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed) handleArduinoResponse(trimmed);
            }
        }
    } catch (e) {
        // ignore
    }
}

function handleArduinoResponse(data) {
    // ON/OFF:ON|OFF 만 반영
    const m = data.match(/^ONOFF:(ON|OFF)$/);
    const m2 = data.match(/ready/i);
    const m3 = data.match(/start/i);
    const m4 = data.match(/^ok$/i);
    const m5 = data.match(/^prog$/i);
    console.log(data);
    if (m) {
        buttonStates.ONOFF = m[1] === 'OFF';
        updateDisplay();
    }
    if (m2) {
        readyState = true;
        updateDisplay();
    }
    if (m3) {
        readyState = false;
        startMark()
    }
    if (m5) {
        // per-step progress during bulk: advance UI index
        if (bulkSending) {
            currentSequenceIndex = Math.min(currentSequenceIndex + 1, sequenceNumbers.length - 1);
            changeData();
            updateDisplay();
        }
        return;
    }
    if (m4) {
        if (bulkSending) {
            // 청크 처리 완료 시 진행 인덱스를 반영 (표시용)
            currentSequenceIndex = Math.min(bulkOffset, sequenceNumbers.length - 1);
        }
        updateDisplay();
        if (bulkSending) {
            sendNextBulkChunk();
        } else {
            advanceSequence();
        }
    }
}

// 시퀀스 한 스텝(cur,next) 전송
async function sendSequence(stepNow, stepNext) {
    if (!serialPort || !markConnected || !serialWriter) return false;
    if (stepNow === undefined || stepNext === undefined) return false;
    try {
        const line = `STEP:${stepNow},${stepNext}\n`;
        await serialWriter.write(new TextEncoder().encode(line));
        return true;
    } catch (e) {
        return false;
    }
}

// Send PINS/LEN and first BULK chunk
async function startBulkTransfer() {
    if (!serialPort || !markConnected || !serialWriter) return;
    if (!Array.isArray(sequenceNumbers) || sequenceNumbers.length === 0) return;
    totalLength = sequenceNumbers.length;
    bulkOffset = 0;
    bulkSending = true;
    // 1) send PINS
    await serialWriter.write(new TextEncoder().encode(`PINS:${Pins}\n`));
    // 2) send LEN (optional)
    await serialWriter.write(new TextEncoder().encode(`LEN:${totalLength}\n`));
    // 3) send first BULK chunk
    await sendNextBulkChunk();
}

async function sendNextBulkChunk() {
    if (!serialPort || !markConnected || !serialWriter) return;
    if (!bulkSending) return;
    if (bulkOffset >= totalLength) {
        // finished
        bulkSending = false;
        return;
    }
    const end = Math.min(bulkOffset + bulkChunkSize, totalLength);
    const slice = sequenceNumbers.slice(bulkOffset, end);
    const payload = `BULK:${slice.join(',')}\n`;
    try {
        await serialWriter.write(new TextEncoder().encode(payload));
        bulkOffset = end;
        // wait for OK; next chunk is triggered by handleArduinoResponse
    } catch (e) {
        console.error('BULK write error', e);
        bulkSending = false;
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
            
            // Serial 쓰기 해제
            if (serialWriter) {
                try {
                    serialWriter.releaseLock();
                } catch (e) {}
                serialWriter = null;
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
            // 진행 로그 제거 (성능)
            
            // Serial 통신으로 데이터 전송
            const sent = await sendSequence(stepNow, stepNext);
            
            if (sent) {
                currentSequenceIndex++;
                updateDisplay();
                stepNow = sequenceNumbers[currentSequenceIndex];
                stepNext = sequenceNumbers[currentSequenceIndex + 1];

            } else {
                // 실패 로그 제거
                markRunning = false;
                updateDisplay();
            }
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

