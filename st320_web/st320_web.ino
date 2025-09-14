#include <Stepper.h>
#include <Servo.h>
#include <avr/wdt.h>

// Pin definitions
#define STEPPER_DIR_PIN 9
#define STEPPER_STEP_PIN 8
#define STEPPER_ENA_PIN 7
#define SERVO_PIN1 5
#define SERVO_PIN2 6
#define SWITCH_PIN 2
#define CELL_PIN 3
#define ANALOG_PINS_START A0

// Constants
#define CIRCLE_DIVISION 320
#define MAX_PINS 320
volatile int pinCount = CIRCLE_DIVISION;
int headOffset = 0; // logical rotation offset
#define STEPS_PER_REV 80
#define MICROSTEPS 4
#define STEPS_PER_PIN (STEPS_PER_REV / MICROSTEPS)
#define DEFAULT_DELAY 1450
#define SERVO_DELAY 100
#define CALIBRATION_DELAY 500

// Servo positions
#define SERVO_INNER_POS 90
#define SERVO_OUTER_POS 150
#define SERVO_TOP_POS 90
#define SERVO_BOTTOM_POS 50

const int pulseWidth = 20;
const float startDelay = 4000.0;
const float endDelay = 160.0;
const float ck = 0.02;

Servo servo;
Servo servo1;

struct {
  int outStart = 0;
  int inStart = 0;
  int upStart = 0;
  int downStart = 0;
  int nowDeg = SERVO_INNER_POS;
  int nowHigh = SERVO_TOP_POS;
  int outleng = 0;
  int inleng = 86;
  int upleng = 0;
  int downleng = 60;
} position;

struct {
  unsigned long thisMillis_old;
  unsigned long allMillis;
  int cRotS = 850;
  int cRotAdd = 6;
} timing;

// StringPhoto 기기 식별을 위한 변수
String inputString = "";
boolean stringComplete = false;

// 웹과의 버튼 싱크를 위한 변수들
bool buttonStates[9] = {false}; // FWD, DN, UP, REV, CW, CCW, ONOFF, SET, RESET
bool lastButtonStates[9] = {false}; // 이전 상태 저장
unsigned long lastButtonCheck = 0;
const unsigned long BUTTON_CHECK_INTERVAL = 5; // 5ms 주기 폴링

int num[MAX_PINS] = { 0 };
int k = -1;
int idxplus = 0;
int spoint=0;
bool drc = HIGH;
// Browser-streamed current/next step indices
volatile int stepNow = -1;
volatile int stepNext = -1;
// BULK processing state
const int BULK_MAX = 100;
volatile bool bulkActive = false;
int bulkBuffer[BULK_MAX];
int bulkCount = 0;
int bulkIndex = 0;
// Compute angle on the fly to avoid large tables
inline float readDegValue(int idx) {
  int i = idx % pinCount; if (i < 0) i += pinCount;
  return (360.0f * i) / (float)pinCount;
}

// Sequence data (restored)
int dataSize = 10;//sizeof(data) / sizeof(data[0]);

void setup() {
  Serial.begin(115200);
  // Serial.println(dataSize);
  
  // 기존 핀 설정
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SWITCH_PIN, INPUT_PULLUP);
  pinMode(STEPPER_ENA_PIN, OUTPUT);
  pinMode(STEPPER_STEP_PIN, OUTPUT);
  pinMode(STEPPER_DIR_PIN, OUTPUT);
  pinMode(CELL_PIN, INPUT_PULLUP);
  digitalWrite(STEPPER_ENA_PIN, LOW);
  
  // 아날로그 핀들 (A0-A5) - 웹과 싱크
  pinMode(A5, INPUT_PULLUP);
  pinMode(A4, INPUT_PULLUP);
  pinMode(A0, INPUT_PULLUP);
  pinMode(A1, INPUT_PULLUP);
  pinMode(A2, INPUT_PULLUP);
  pinMode(A3, INPUT_PULLUP);
  
  // 디지털 핀들 (D2, D3) - 웹과 싱크
  pinMode(2, INPUT_PULLUP); // ON/OFF 스위치
  pinMode(3, INPUT_PULLUP); // SET 버튼
  
  servo.attach(SERVO_PIN1);
  servo1.attach(SERVO_PIN2);
  spoint=0;
  for (int i = 0; i < pinCount; i++) {
    num[i] = i;
  }
  
  // 초기 상태 전송 제거 (브라우저는 읽지 않음)
  // Serial.println("StringPhoto Ready");
}

void loop() {

  
  // 버튼 상태 확인 및 폴링
  if (millis() - lastButtonCheck >= BUTTON_CHECK_INTERVAL) {
    checkButtonStates();
    lastButtonCheck = millis();
  }
  if (stringComplete) {
    processSerialCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  if (digitalRead(SWITCH_PIN) == LOW) {
    //digitalWrite(LED_BUILTIN, HIGH);
      // 시리얼 명령 처리
    digitalWrite(STEPPER_ENA_PIN, HIGH);
    if (k < 0) {
      k = 0;
      Serial.println("ready");
    }
    timing.thisMillis_old = millis();
    position.outStart = analogRead(A3);
    position.inStart = analogRead(A4);
    position.upStart = analogRead(A5);
    position.downStart = analogRead(A2);
    if (position.inStart < 900) position.nowDeg = position.nowDeg + 1;      //in
    if (position.outStart < 900) position.nowDeg = position.nowDeg - 1;     //out
    if (position.downStart < 900) position.nowHigh = position.nowHigh + 1;  //down
    if (position.upStart < 900) position.nowHigh = position.nowHigh - 1;    //up
    servo1.write(position.nowHigh);
    servo.write(position.nowDeg);
    delay(5);
    position.downleng = position.nowHigh;
    position.inleng = position.nowDeg;
    position.outleng = position.inleng + 80;
    position.upleng = position.downleng + 50;
    if (analogRead(A1) < 900 && analogRead(A0) > 900) {
      oneStepM(HIGH);
    }
    if (analogRead(A0) < 900 && analogRead(A1) > 900) {
      oneStepM(LOW);
    }
    if (analogRead(A1) < 900 && analogRead(A3) < 900) {
      for (int i = 0; i < pinCount; i++) {
        if (analogRead(A0) < 900) break;
        cRotate(drc, STEPS_PER_PIN);
        delay(300);
      }
    }
  } else {
    //digitalWrite(LED_BUILTIN, LOW);
    // BULK execution path: run 99 pairs per received chunk, then emit OK
    if (bulkActive) {
      if (bulkCount <= 1) {
        // nothing to do, ask for next
        bulkActive = false;
        bulkIndex = 0;
        bulkCount = 0;
        Serial.println("OK");
      } else {
        if (bulkIndex <= bulkCount - 2) {
          // prepare pair
          stepNow = bulkBuffer[bulkIndex];
          stepNext = bulkBuffer[bulkIndex + 1];
          // execute same logic as STEP: branch, without per-step OK
          int idx = logicalIndexOf(stepNow);
          headOffset = (headOffset + idx) % pinCount;
          if (idx == pinCount / 2) {
            drc = HIGH;
            if (arr_check_head((pinCount - idx), pinCount, stepNext) > 0) {
              cRotate(drc, ((idx + idxplus) - 1) * STEPS_PER_PIN);
              sawing(drc);
              idxplus = 0;
            } else {
              cRotate(drc, (idx + idxplus) * STEPS_PER_PIN);
              sawing(!drc);
              idxplus = 1;
              delay(50);
            }
          } else {
            if (1 / sin(radians(readDegValue(idx))) > 0) {
              drc = HIGH;
              if (arr_check_head((pinCount - idx), pinCount, stepNext) > 0) {
                cRotate(drc, ((idx + idxplus) - 1) * STEPS_PER_PIN);
                sawing(drc);
                idxplus = 0;
              } else {
                cRotate(drc, (idx + idxplus) * STEPS_PER_PIN);
                idxplus = 1;
                sawing(!drc);
                delay(50);
              }
            } else if (1 / sin(radians(readDegValue(idx))) < 0) {
              drc = LOW;
              if (arr_check_head(0, (pinCount - idx), stepNext) > 0) {
                cRotate(drc, (pinCount - (idx + idxplus)) * STEPS_PER_PIN);
                sawing(drc);
                idxplus = 1;
                delay(50);
              } else {
                cRotate(drc, ((pinCount - (idx + idxplus)) + 1) * STEPS_PER_PIN);
                sawing(!drc);
                idxplus = 0;
              }
            }
          }
          bulkIndex++;
          // report progress for browser UI per step
          Serial.println("PROG");
        } else {
          // chunk finished -> request next
          bulkActive = false;
          bulkIndex = 0;
          bulkCount = 0;
          Serial.println("OK");
        }
      }
    }
    // if (k >= 0 && k < dataSize) {
    //   Serial.print("stepNow:");
    //   Serial.print(stepNow);
    //   Serial.print(", ");
    //   delay(500);
    //   Serial.print("stepNext");
    //   Serial.println(stepNext);
    //   delay(500);
    //   Serial.println("gok");
      // digitalWrite(STEPPER_ENA_PIN, LOW);
      // if (k != 0 && k % 200 == 0) {
      //   position.upleng--;
      //   position.downleng--;
      // }
      // unsigned long deltaMillis = 0;
      // unsigned long thisMillis = millis();

      // int idx = logicalIndexOf(pgm_read_word_near(&(data[k])));
      // headOffset = (headOffset + idx) % pinCount;
      //   if (idx == 160) {
      //     drc = HIGH;
      //     if (arr_check_head((pinCount - idx), pinCount, pgm_read_word_near(&(data[k + 1]))) > 0) {
      //       cRotate(drc, ((idx + idxplus) - 1) * STEPS_PER_PIN);
      //       sawing(drc);
      //       idxplus = 0;
      //     } else {
      //       cRotate(drc, (idx + idxplus) * STEPS_PER_PIN);
      //       sawing(!drc);
      //       idxplus = 1;
      //       delay(50);
      //     }
      //   } else {
      //     if (1 / sin(radians(readDegValue(idx))) > 0) {
      //       drc = HIGH;
      //       if (arr_check_head((pinCount - idx), pinCount, pgm_read_word_near(&(data[k + 1]))) > 0) {
      //         cRotate(drc, ((idx + idxplus) - 1) * STEPS_PER_PIN);
      //         sawing(drc);
      //         idxplus = 0;
      //       } else {
      //         cRotate(drc, (idx + idxplus) * STEPS_PER_PIN);
      //         idxplus = 1;
      //         sawing(!drc);
      //         delay(50);
      //       }
      //     } else if (1 / sin(radians(readDegValue(idx))) < 0) {
      //       drc = LOW;
      //       if (arr_check_head(0, (pinCount - idx), pgm_read_word_near(&(data[k + 1]))) > 0) {
      //         cRotate(drc, (pinCount - (idx + idxplus)) * STEPS_PER_PIN);
      //         sawing(drc);
      //         idxplus = 1;
      //         delay(50);
      //       } else {
      //         cRotate(drc, ((pinCount - (idx + idxplus)) + 1) * STEPS_PER_PIN);
      //         sawing(!drc);
      //         idxplus = 0;
      //       }
      //     }
      //   }
      
     // k = k + 1;
      // if (thisMillis != timing.thisMillis_old) {
      //   deltaMillis = thisMillis - timing.thisMillis_old;
      //   timing.thisMillis_old = thisMillis;
      //   timing.allMillis = timing.allMillis + deltaMillis;
      // }
    //}
    // if (k >= dataSize) {
    //   k = -1;
    //   for (int i = 0; i < 2; i++) {
    //     delay(300);
    //     sawing(HIGH);
    //     cRotate(LOW, STEPS_PER_PIN);
    //   }
    //   delay(300);
    //   sawing(LOW);
    //   cRotate(HIGH, STEPS_PER_PIN);
    //   sawing(LOW);
      // unsigned long allSeconds = timing.allMillis / 1000;
      // int runHours = allSeconds / 3600;
      // int secsRemaining = allSeconds % 3600;
      // int runMinutes = secsRemaining / 60;
      // int runSeconds = secsRemaining % 60;
      // char buf[21];
      // sprintf(buf, "Runtime%02d:%02d:%02d", runHours, runMinutes, runSeconds);
      // timing.allMillis = 0;
    //}
  }
}

void oneStepM(bool dic) {
  digitalWrite(STEPPER_DIR_PIN, dic);
  digitalWrite(STEPPER_ENA_PIN, LOW);
  digitalWrite(STEPPER_STEP_PIN, HIGH);
  delayMicroseconds(DEFAULT_DELAY);
  digitalWrite(STEPPER_STEP_PIN, LOW);
  delayMicroseconds(DEFAULT_DELAY);
  delay(500);
}

void callibration(bool cal, bool dic, int sw) {
  digitalWrite(STEPPER_DIR_PIN, dic);
  digitalWrite(STEPPER_ENA_PIN, LOW);
  for (int i = 2000; i > 500; i = i - 1) {
    digitalWrite(STEPPER_STEP_PIN, HIGH);
    delayMicroseconds(i);
    digitalWrite(STEPPER_STEP_PIN, LOW);
    delayMicroseconds(i);
    if (analogRead(sw) < 900 || analogRead(A4) + analogRead(A5) > 1800) {
      break;
    }
  }
  while (cal) {
    if (analogRead(sw) < 900 || analogRead(A4) + analogRead(A5) > 1800) {
      cal = false;
    }
    cRotate(drc, STEPS_PER_PIN);
    delay(500);
  }
}

void sawing(bool drc) {
  delay(50);
  servo.write(position.outleng);
  delay(50);
  servo1.write(position.upleng);
  delay(50);
  cRotate(drc, STEPS_PER_PIN);
  delay(50);
  servo.write(position.inleng);
  delay(50);
  servo1.write(position.downleng);
  delay(50);
}

int arr_check(int* arr, int start, int end, int val) {
  for (int i = start; i < end; i++) {
    if (arr[i] == val) return 1;
  }
  return -1;
}

void cRotate(bool direc, int spr) {
  digitalWrite(STEPPER_DIR_PIN, !direc);
  digitalWrite(STEPPER_ENA_PIN, LOW);
  int accelSteps = spr / 2;
  for (int i = 0; i < accelSteps; i++) {
    float delayTime = startDelay - (startDelay - endDelay) * (1.0 - exp(-ck * i));
    oneStep();
    delayMicroseconds((int)delayTime);
  }

  // 감속
  for (int i = 0; i < accelSteps; i++) {
    float delayTime = startDelay - (startDelay - endDelay) * (1.0 - exp(-ck * (accelSteps - i)));
    oneStep();
    delayMicroseconds((int)delayTime);
  }
}
void oneStep() {
  digitalWrite(STEPPER_STEP_PIN, HIGH);
  delayMicroseconds(pulseWidth);
  digitalWrite(STEPPER_STEP_PIN, LOW);
}
void shiftLeft(int arr[], int d, int n) {
  reverse(arr, 0, d);
  reverse(arr, d, n);
  reverse(arr, 0, n);
}

void reverse(int arr[], int start, int end) {
  int temp;
  end = end - 1;
  while (start < end) {
    temp = arr[start];
    arr[start] = arr[end];
    arr[end] = temp;
    start++;
    end--;
  }
}

int index_arr(int* arr, int size, int val) {
  for (int i = 0; i < size; i++) {
    if (arr[i] == val) return i;
  }
  return -1;
}

void stepMotor(int delay_us) {
  digitalWrite(STEPPER_STEP_PIN, HIGH);
  delayMicroseconds(delay_us);
  digitalWrite(STEPPER_STEP_PIN, LOW);
  delayMicroseconds(delay_us);
}

// Helper: set pin count (240/280/320) and re-init state
void setPinCount(int n) {
  if (n != 240 && n != 280 && n != 320) return;
  pinCount = n;
  for (int i = 0; i < pinCount; i++) num[i] = i;
  headOffset = 0;
}

// Map absolute value -> logical index considering headOffset
inline int logicalIndexOf(int val) {
  int v = val % pinCount;
  if (v < 0) v += pinCount;
  int idx = v - headOffset;
  if (idx < 0) idx += pinCount;
  return idx;
}

// Check if value falls within [start, end) in logical ring
inline int arr_check_head(int start, int end, int val) {
  if (start < 0) start = 0;
  if (end > pinCount) end = pinCount;
  int idx = logicalIndexOf(val);
  return (idx >= start && idx < end) ? 1 : -1;
}

// 완전 재시작(워치독) 리셋: 안전 정지 후 MCU 리셋
void resetAction() {
  // 모터/서보 안전 정지
  digitalWrite(STEPPER_ENA_PIN, LOW);
  servo.detach();
  servo1.detach();
  delay(20);
  // 워치독 짧은 타임아웃으로 강제 리셋 (AVR)
  wdt_enable(WDTO_15MS);
  while (1) {}
}

// 버튼 상태 확인 (웹 전송 제거)
void checkButtonStates() {
  // A0-A5 핀 상태 확인 (아날로그)
  bool newStates[9] = {
    analogRead(A2) < 900,  // UP (A2)
    analogRead(A3) < 900,  // REV (A3)
    analogRead(A0) < 900,  // FWD (A0)
    analogRead(A1) < 900,  // DN (A1)
    analogRead(A4) < 900,  // CW (A4)
    analogRead(A5) < 900,  // CCW (A5)
    digitalRead(2) == LOW, // ON/OFF (D2)
    digitalRead(3) == LOW, // SET (D3)
    false                   // RESET (웹에서만 제어)
  };
  
  // 상태 변경 감지 (웹으로 전송하지 않음)
  for (int i = 0; i < 9; i++) {
    if (newStates[i] != lastButtonStates[i]) {
      buttonStates[i] = newStates[i];
      lastButtonStates[i] = newStates[i];
      // ON/OFF 상태만 브라우저로 통지 (표시용)
      if (i == 6) {
        if (newStates[i]) {
          Serial.println("ONOFF:OFF");
          
        } else {
          Serial.println("ONOFF:ON");
          Serial.println("start");
        }
      }
    }
  }
}

// 버튼 인덱스를 이름으로 변환
String getButtonName(int index) {
  switch(index) {
    case 0: return "FWD";
    case 1: return "DN";
    case 2: return "UP";
    case 3: return "REV";
    case 4: return "CW";
    case 5: return "CCW";
    case 6: return "ONOFF";
    case 7: return "SET";
    case 8: return "RESET";
    default: return "UNKNOWN";
  }
}
// 시리얼 명령 처리 함수 (쓰기 전용 모드)
void processSerialCommand(String command) {
  command.trim();
  
  if (command.equals("IDENTIFY")) {
    // no-op in write-only mode
  }
  else if (command.startsWith("PINS:")) {
    int n = command.substring(5).toInt();
    setPinCount(n);
    Serial.println("OK");
  }
  else if (command.startsWith("LEN:")) {
    // e.g., LEN:2000 (optional, informational)
    int n = command.substring(4).toInt();
    if (n > 0) {
      dataSize = n;
    }
    // do not echo OK here to avoid confusing host flow
  }
  else if (command.startsWith("STEP:")) {
    // 예: STEP:123,456
    int commaIdx = command.indexOf(',');
    if (commaIdx > 5) {
      int cur = command.substring(5, commaIdx).toInt();
      int nxt = command.substring(commaIdx + 1).toInt();
      stepNow = cur;
      stepNext = nxt;
      if (digitalRead(SWITCH_PIN) == HIGH) {
        // 기존 로직에 적용
        int idx = logicalIndexOf(stepNow);
        headOffset = (headOffset + idx) % pinCount;
        if (idx == pinCount / 2) {
          drc = HIGH;
          if (arr_check_head((pinCount - idx), pinCount, stepNext) > 0) {
            cRotate(drc, ((idx + idxplus) - 1) * STEPS_PER_PIN);
            sawing(drc);
            idxplus = 0;
          } else {
            cRotate(drc, (idx + idxplus) * STEPS_PER_PIN);
            sawing(!drc);
            idxplus = 1;
            delay(50);
          }
        } else {
          if (1 / sin(radians(readDegValue(idx))) > 0) {
            drc = HIGH;
            if (arr_check_head((pinCount - idx), pinCount, stepNext) > 0) {
              cRotate(drc, ((idx + idxplus) - 1) * STEPS_PER_PIN);
              sawing(drc);
              idxplus = 0;
            } else {
              cRotate(drc, (idx + idxplus) * STEPS_PER_PIN);
              idxplus = 1;
              sawing(!drc);
              delay(50);
            }
          } else if (1 / sin(radians(readDegValue(idx))) < 0) {
            drc = LOW;
            if (arr_check_head(0, (pinCount - idx), stepNext) > 0) {
              cRotate(drc, (pinCount - (idx + idxplus)) * STEPS_PER_PIN);
              sawing(drc);
              idxplus = 1;
              delay(50);
            } else {
              cRotate(drc, ((pinCount - (idx + idxplus)) + 1) * STEPS_PER_PIN);
              sawing(!drc);
              idxplus = 0;
            }
          }
        }
        Serial.println("OK");
      } else {
        Serial.println("BUSY");
      }
    } else {
      Serial.println("ERR");
    }
  }
  else if (command.startsWith("BULK:")) {
    // BULK:val0,val1,... up to 100 values
    int count = 0;
    int start = 5;
    int len = command.length();
    while (start <= len && count < BULK_MAX) {
      int commaIdx = command.indexOf(',', start);
      String token;
      if (commaIdx == -1) {
        token = command.substring(start);
        // ensure loop exit next
        start = len + 1;
      } else {
        token = command.substring(start, commaIdx);
        start = commaIdx + 1;
      }
      token.trim();
      if (token.length() > 0) {
        bulkBuffer[count++] = token.toInt();
      }
    }
    bulkCount = count;
    bulkIndex = 0;
    if (digitalRead(SWITCH_PIN) == HIGH) {
      bulkActive = true;
    } else {
      bulkActive = false;
    }
    // do not print OK here; OK is emitted after executing the 99 pairs
  }
  else {
    // no-op
  }
}

// 시리얼 이벤트 처리 (문자열 수신)
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}
