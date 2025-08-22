#include <Stepper.h>
#include <Servo.h>
#include <SoftwareSerial.h>

// Pin definitions
#define STEPPER_DIR_PIN 8
#define STEPPER_STEP_PIN 9
#define STEPPER_ENA_PIN 10
#define SERVO_PIN1 5
#define SERVO_PIN2 6
#define SWITCH_PIN 11
#define CELL_PIN 3
#define ANALOG_PINS_START A0

// Constants
#define CIRCLE_DIVISION 320
#define STEPS_PER_REV 40
#define MICROSTEPS 4
#define STEPS_PER_PIN (STEPS_PER_REV/MICROSTEPS)
#define DEFAULT_DELAY 1450
#define SERVO_DELAY 100
#define CALIBRATION_DELAY 500

// Servo positions
#define SERVO_INNER_POS 90
#define SERVO_OUTER_POS 150
#define SERVO_TOP_POS 90
#define SERVO_BOTTOM_POS 50

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
  int downleng = 75;
} position;

struct {
  unsigned long thisMillis_old;
  unsigned long allMillis;
  int cRotS = 850;
  int cRotAdd = 6;
} timing;

int num[CIRCLE_DIVISION] = {0};
int k = -1;
int idxplus = 0;
bool drc = HIGH;

const float deg[] PROGMEM = {0.00,1.12,2.25,3.38,4.50,5.63,6.75,7.88,9.00,10.13,11.25,12.38,13.50,14.63,15.75,16.87,18.00,19.12,20.25,21.37,22.50,23.62,24.75,25.87,27.00,28.12,29.25,30.37,31.50,32.63,33.75,34.88,36.00,37.13,38.25,39.38,40.50,41.63,42.75,43.88,45.00,46.13,47.25,48.38,49.50,50.63,51.75,52.88,54.00,55.13,56.25,57.38,58.50,59.63,60.75,61.88,63.00,64.12,65.25,66.37,67.50,68.62,69.75,70.87,72.00,73.12,74.25,75.37,76.50,77.62,78.75,79.87,81.00,82.12,83.25,84.37,85.50,86.62,87.75,88.87,90.00,91.12,92.25,93.37,94.50,95.62,96.75,97.87,99.00,100.12,101.25,102.37,103.50,104.62,105.75,106.87,108.00,109.12,110.25,111.37,112.50,113.62,114.75,115.87,117.00,118.12,119.25,120.37,121.50,122.62,123.75,124.87,126.00,127.12,128.25,129.38,130.50,131.63,132.75,133.88,135.00,136.13,137.25,138.38,139.50,140.63,141.75,142.88,144.00,145.13,146.25,147.38,148.50,149.63,150.75,151.88,153.00,154.13,155.25,156.38,157.50,158.63,159.75,160.88,162.00,163.13,164.25,165.38,166.50,167.63,168.75,169.88,171.00,172.13,173.25,174.38,175.50,176.63,177.75,178.88,180.00,181.13,182.25,183.38,184.50,185.63,186.75,187.88,189.00,190.13,191.25,192.38,193.50,194.63,195.75,196.88,198.00,199.13,200.25,201.38,202.50,203.63,204.75,205.88,207.00,208.13,209.25,210.38,211.50,212.63,213.75,214.88,216.00,217.13,218.25,219.38,220.50,221.63,222.75,223.88,225.00,226.13,227.25,228.38,229.50,230.63,231.75,232.88,234.00,235.13,236.25,237.38,238.50,239.63,240.75,241.88,243.00,244.13,245.25,246.38,247.50,248.63,249.75,250.88,252.00,253.13,254.25,255.38,256.50,257.63,258.75,259.88,261.00,262.13,263.25,264.38,265.50,266.63,267.75,268.88,270.00,271.13,272.25,273.38,274.50,275.63,276.75,277.88,279.00,280.13,281.25,282.38,283.50,284.63,285.75,286.88,288.00,289.13,290.25,291.38,292.50,293.63,294.75,295.88,297.00,298.13,299.25,300.38,301.50,302.63,303.75,304.88,306.00,307.13,308.25,309.38,310.50,311.63,312.75,313.88,315.00,316.13,317.25,318.38,319.50,320.63,321.75,322.88,324.00,325.13,326.25,327.38,328.50,329.63,330.75,331.88,333.00,334.13,335.25,336.38,337.50,338.63,339.75,340.88,342.00,343.13,344.25,345.38,346.50,347.63,348.75,349.88,351.00,352.13,353.25,354.38,355.50,356.63,357.75,358.88};

const uint16_t data[] PROGMEM = {244,287,272,255,286,245,279,264,247,276,254,290,241,225,290,236,220,291,235,280,244,289,242,218,180,199,184,207,177,201,172,208,176,211,171,209,164,213,170,273,248,263,289,228,281,177,204,189,94,192,92,186,206,151,210,161,265,286,221,290,239,219,292,233,281,243,215,292,224,282,176,277,246,265,164,230,175,278,173,207,180,92,190,96,188,205,126,208,165,264,288,243,178,199,95,191,91,193,260,158,214,293,218,291,227,282,222,285,182,197,117,208,137,204,104,202,154,236,276,177,93,183,242,172,279,230,268,163,234,174,277,252,180,274,169,221,289,237,144,211,293,208,123,212,292,217,296,211,131,207,103,190,99,187,97,198,111,209,244,266,163,145,130,208,150,236,145,203,153,257,208,113,198,293,206,181,91,195,114,220,292,226,284,223,269,162,128,148,252,214,110,68,83,172,271,184,89,177,253,165,124,206,134,230,288,222,116,169,87,186,289,240,281,266,237,141,204,294,213,122,166,201,95,53,98,197,259,275,255,289,218,295,212,111,67,89,182,96,200,156,125,163,246,278,231,287,187,121,167,263,179,93,64,104,206,296,202,146,129,159,265,156,235,277,179,283,232,216,251,149,126,212,286,218,121,106,63,112,171,272,197,105,70,91,199,252,186,100,207,294,195,107,171,84,182,287,208,102,65,92,184,239,140,156,261,181,249,278,169,119,224,250,150,244,170,114,177,265,192,274,167,120,219,285,246,140,207,290,228,141,244,213,291,191,93,48,96,55,85,170,280,229,289,215,301,225,118,168,89,71,150,125,160,259,17,255,213,110,182,98,208,128,211,299,206,107,62,114,197,92,194,136,158,266,285,256,16,260,152,204,144,243,217,300,204,111,178,193,289,208,120,190,292,223,242,287,176,115,211,107,190,88,72,163,122,68,151,123,161,176,94,60,108,69,160,232,267,155,201,297,216,109,184,83,177,112,201,89,37,91,66,101,209,256,212,270,173,200,298,212,276,183,284,231,133,159,197,90,167,279,243,2,74,150,264,178,285,225,291,206,259,182,94,178,289,226,281,257,15,261,151,115,170,117,175,103,59,115,194,90,71,164,121,222,292,164,105,201,292,216,122,228,166,291,183,245,166,252,11,316,239,282,169,86,41,93,190,117,220,252,13,79,23,266,241,280,234,131,160,99,52,283,187,86,185,290,219,270,188,92,193,294,169,98,149,265,29,84,193,257,19,80,12,253,147,100,165,120,168,296,204,292,209,286,177,100,46,280,171,243,105,156,137,237,130,71,319,75,171,299,199,89,39,274,178,92,183,232,128,161,73,3,246,111,180,262,189,108,214,254,194,83,31,269,158,134,57,151,234,311,238,283,213,292,177,303,214,233,89,203,301,175,97,47,127,163,68,171,104,244,143,206,103,237,95,59,284,229,269,191,261,11,254,114,200,91,238,102,207,133,237,109,163,292,182,87,184,82,61,93,180,272,36,94,179,284,56,155,270,24,84,28,266,176,116,58,163,112,245,278,172,298,207,258,18,255,113,242,194,174,120,223,251,14,77,7,246,137,152,62,283,168,99,249,115,131,23,86,201,259,192,86,161,124,164,101,176,300,198,256,20,129,160,55,165,292,218,240,139,34,82,179,235,104,174,275,189,282,209,97,54,282,64,309,4,71,316,73,146,254,105,140,63,151,282,180,89,237,92,198,302,210,253,109,205,135,221,292,200,180,305,241,197,6,248,275,38,144,47,99,178,291,169,117,57,153,136,30,79,10,262,185,230,139,77,169,108,246,212,52,223,287,254,159,233,125,213,281,183,274,257,12,260,140,51,284,61,155,285,172,67,314,74,0,70,170,96,236,99,208,297,173,238,88,184,263,160,292,167,100,248,95,188,290,179,307,65,281,55,157,50,216,59,110,133,247,182,93,37,276,172,281,45,152,110,205,265,180,233,249,119,136,55,223,115,253,18,1,120,214,244,4,191,92,196,181,97,251,106,163,52,279,48,218,57,123,162,293,199,87,72,318,76,15,250,98,172,268,200,167,104,255,145,271,40,87,191,98,239,224,134,234,107,136,157,234,84,204,283,257,9,196,7,199,214,109,153,44,219,281,70,151,112,58,96,184,227,63,310,241,319,120,229,214,292,168,63,217,58,227,124,41,82,187,271,153,95,35,269,284,54,164,294,176,269,27,85,196,259,118,252,288,180,276,42,220,170,300,132,208,305,218,46,148,75,312,233,283,156,60,215,107,177,94,190,270,180,75,233,137,100,171,286,67,165,123,0,143,116,210,53,218,9,124,208,246,88,204,136,28,134,299,221,74,160,54,277,178,299,204,7,194,5,74,182,309,72,1,141,49,224,286,103,289,222,72,140,205,91,202,257,17,82,198,181,264,30,211,292,207,247,277,172,111,257,184,93,193,9,309,185,78,63,312,77,177,99,166,121,35,211,304,175,119,2,247,110,258,14,125,153,255,21,87,206,308,65,214,39,207,306,67,191,260,280,148,127,17,2,144,102,290,165,278,149,71,230,285,227,98,178,284,69,154,76,3,141,36,120,251,205,185,92,195,292,186,226,92,62,172,301,190,105,122,210,32,96,179,276,186,7,211,271,23,0,114,176,289,109,299,218,290,111,164,293,130,51,213,245,140,276,48,158,102,177,160,267,236,83,29,97,240,255,94,39,140,33,271,200,5,243,310,184,169,245,89,195,273,252,203,159,294,191,266,26,209,123,173,67,279,56,118,69,230,283,104,52,119,258,198,74,281,296,311,182,95,253,133,243,216,64,284,52,128,222,56,301,131,290,214,111,187,274,190,68,231,91,197,84,186,285,153,106,242,154,267,137,306,65,315,248,139,261,117,167,71,103,176,292,106,300,193,96,181,229,288,303,176,96,34,205,249,151,257,272,57,278,76,8,312,175,116,319,25,132,159,274,175,192,7,182,60,307,136,78,199,16,83,206,106,176,311,62,154,49,217,38,90,75,313,189,92,187,260,195,253,198,5,213,296,110,288,219,237,317,120,170,99,290,250,121,136,249,88,205,43,219,46,158,104,169,306,69,172,48,281,44,131,236,148,9,263,314,240,87,289,223,37,207,223,50,134,109,1,145,279,234,154,280,66,232,281,168,186,94,70,5,77,221,41,206,108,290,127,204,304,230,161,227,107,144,262,24,133,205,166,266,31,208,55,119,28,223,35,163,265,27,224,92,182,111,217,55,124,11,248,102,60,212,6,188,203,138,192,91,201,147,281,76,17,254,269,183,275,260,13,126,159,243,73,199,102,292,179,97,112,288,94,237,4,294,206,120,27,158,143,3,239,58,104,165,301,105,290,227,72,199,173,196,23,8,69,96,30,213,268,291,222,53,241,216,71,229,106,238,265,6,175,233,252,105,211,25,97,173,300,200,92,220,37,119,256,155,43,93,181,292,206,271,289,92,250,1,137,27,316,232,90,254,311,78,170,112,128,243,152,55,230,180,280,50,299,133,235,151,65,301,162,117,29,203,5,219,62,165,202,142,266,234,277,60,41,136,49,82,203,22,272,319,126,63,95,195,87,207,289,85,184,95,121,217,66,271,144,319,300,206,233,315,74,178,301,199,20,0,121,169,42,57,180,96,116,150,275,49,255,156,68,215,317,235,110,0,118,264,193,273,138,311,240,260,67,243,304,170,287,185,223,21,154,54,166,123,24,195,83,209,20,257,128,289,106,248,94,206,262,14,71,194,111,176,285,224,17,151,96,37,202,18,260,15,85,193,54,255,69,274,153,176,3,295,221,269,103,177,97,58,303,171,115,302,104,291,276,170,101,191,140,119,238,82,0,216,231,160,234,290,116,239,142,32,226,34,122,214,72,286,125,211,232,54,217,59,309,68,277,41,145,258,103,246,122,319,33,206,126,284,247,158,189,167,304,286,63,187,93,178,280,105,36,208,7,202,140,168,43,207,91,227,311,249,264,239,1,32,91,194,293,5,80,18,223,195,269,290,90,255,180,72,190,174,111,167,142,103,87,264,8,237,274,179,54,130,302,177,104,119,226,133,22,198,267,284,112,18,195,66,281,191,148,131,270,156,26,7,239,300,219,34,270,163,148,118,3,164,104,245,78,24,259,52,218,201,186,77,42,202,86,251,76,57,113,283,73,88,183,271,214,4,223,40,229,196,106,240,89,197,7,143,277,47,204,134,298,185,41,101,274,52,167,202,121,225,60,192,97,10,113,163,55,192,25,41,177,283,210,300,133,206,7,191,68,256,287,61,172,274,77,223,260,136,309,78,162,277,232,120,252,91,190,109,176,51,298,135,311,288,227,83,294,163,126,67,318,34,233,318,206,84,7,184,86,220,33,173,121,221,28,211,53,255,315,176,98,171,292,169,7,121,154,246,309,61,99,57,164,125,140,270,193,52,34,190,279,294,167,12,236,205,89,216,56,228,244,259,281,46,278,192,246,5,27,152,58,214,291,308,185,114,233,68,20,78,11,82,212,112,301,205,129,0,99,29,208,103,296,135,158,2,299,0};
int dataSize = sizeof(data)/2;

void setup() {
  Serial.begin(9600);
  Serial.println(dataSize);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SWITCH_PIN, INPUT_PULLUP);
  pinMode(STEPPER_ENA_PIN, OUTPUT);
  pinMode(STEPPER_STEP_PIN, OUTPUT);
  pinMode(STEPPER_DIR_PIN, OUTPUT);
  pinMode(CELL_PIN, INPUT_PULLUP);
  digitalWrite(STEPPER_ENA_PIN, LOW);
  pinMode(A5, INPUT_PULLUP);
  pinMode(A4, INPUT_PULLUP);
  pinMode(A0, INPUT_PULLUP);
  pinMode(A1, INPUT_PULLUP);
  pinMode(A2, INPUT_PULLUP);
  pinMode(A3, INPUT_PULLUP);
  servo.attach(SERVO_PIN1);
  servo1.attach(SERVO_PIN2);
  for(int i = 0; i < CIRCLE_DIVISION; i++) {
    num[i] = i;
  }
}

void loop() {
  if(digitalRead(SWITCH_PIN) == LOW) {
    // Serial.print(analogRead(A1));
    // Serial.print(",");
    // Serial.print(analogRead(A2));
    // Serial.print(",");
    // Serial.println(analogRead(A3));
    digitalWrite(LED_BUILTIN, HIGH);
    digitalWrite(STEPPER_ENA_PIN, HIGH);
    if(k < 0) k=0; 
    timing.thisMillis_old = millis();
    position.outStart = analogRead(A3);
    position.inStart = analogRead(A0);
    position.upStart = analogRead(A2);
    position.downStart = analogRead(A1);
    if(position.inStart < 900) position.nowDeg=position.nowDeg+1; //in
    if(position.outStart < 900) position.nowDeg=position.nowDeg-1; //out
    if(position.downStart < 900) position.nowHigh=position.nowHigh+1; //down
    if(position.upStart < 900) position.nowHigh=position.nowHigh-1; //up
    servo1.write(position.nowHigh);
    servo.write(position.nowDeg);
    delay(5);
    position.downleng=position.nowHigh;
    position.inleng = position.nowDeg;
    position.outleng=position.inleng+80;
    position.upleng=position.downleng+50;
    if(analogRead(A5) < 900 && analogRead(A4) > 900) {
      oneStep(HIGH);
    }
    if(analogRead(A4) < 900 && analogRead(A5) > 900) {
      oneStep(LOW);
    }
    if(analogRead(A1) < 900 && analogRead(A3) < 900) {
      for(int i=0;i<320;i++){
        //Serial.println(i);
        if(analogRead(A0) < 900) break;
      cRotate(drc, STEPS_PER_PIN);
      delay(300);
      }
    }
    // if(digitalRead(CELL_PIN) == LOW) {
    //   for(int j=0;j<CIRCLE_DIVISION;j++) {
    //     digitalWrite(STEPPER_ENA_PIN, LOW);
    //     delay(50);
    //     servo.write(position.outleng);
    //     delay(100);
    //     servo1.write(position.upleng);
    //     for (int i = 0; i < STEPS_PER_PIN; i++) {
    //       digitalWrite(STEPPER_STEP_PIN, HIGH);
    //       delayMicroseconds(DEFAULT_DELAY);
    //       digitalWrite(STEPPER_STEP_PIN, LOW);
    //       delayMicroseconds(DEFAULT_DELAY);
    //     }
    //     delay(100);
    //     servo.write(position.inleng);
    //     servo1.write(position.downleng);
    //     delay(150);
    //     if(analogRead(A4) > 900 || analogRead(A5) > 900) {
    //       digitalWrite(STEPPER_ENA_PIN, HIGH);
    //       break;
    //     }
    //   }
    // } 
  } else {
    digitalWrite(LED_BUILTIN, LOW);
    if(k>=0 && k <= dataSize) {
      digitalWrite(STEPPER_ENA_PIN, LOW);
      if(k!=0 && k%200 == 0) {position.upleng--;position.downleng--;}
      unsigned long deltaMillis = 0;
      unsigned long thisMillis = millis();
      Serial.print(pgm_read_word_near(&(data[k])));
      Serial.print(", ");
      Serial.print(k);
      Serial.print("  ");
      unsigned long allSeconds=timing.allMillis/1000;
      int runHours= allSeconds/3600;
      int secsRemaining=allSeconds%3600;
      int runMinutes=secsRemaining/60;
      int runSeconds=secsRemaining%60;
      char buf[21];
      sprintf(buf,"Runtime%02d:%02d:%02d",runHours,runMinutes,runSeconds);
      Serial.println(buf);
      
      int idx = index_arr(num, CIRCLE_DIVISION, pgm_read_word_near(&(data[k])));
      shiftLeft(num, idx, CIRCLE_DIVISION);
      if(idx == 160) {
        drc = LOW;
        if(arr_check(num, (CIRCLE_DIVISION-idx), CIRCLE_DIVISION, pgm_read_word_near(&(data[k+1]))) > 0) {
          cRotate(drc, ((idx+idxplus)-1)*STEPS_PER_PIN);
          sawing(drc);
          idxplus=0;
        } else {
          cRotate(drc, (idx+idxplus)*STEPS_PER_PIN);
          sawing(!drc);
          idxplus=1;
          delay(50);
        }
      } else {
        if(1/sin(radians(pgm_read_float_near(&(deg[idx])))) > 0) {
          drc = LOW;
          if(arr_check(num, (CIRCLE_DIVISION-idx), CIRCLE_DIVISION, pgm_read_word_near(&(data[k+1]))) > 0) {
            cRotate(drc, ((idx+idxplus)-1)*STEPS_PER_PIN);
            sawing(drc);
            idxplus=0;
          } else {
            cRotate(drc, (idx+idxplus)*STEPS_PER_PIN);
            idxplus=1;
            sawing(!drc);
            delay(50);
          }
        } else if(1/sin(radians(pgm_read_float_near(&(deg[idx])))) < 0) {
          drc = HIGH;
          if(arr_check(num, 0, CIRCLE_DIVISION-idx, pgm_read_word_near(&(data[k+1]))) > 0) {
            cRotate(drc, (CIRCLE_DIVISION-(idx+idxplus))*STEPS_PER_PIN);
            sawing(drc);
            idxplus=1;
            delay(50);
          } else {
            cRotate(drc, ((CIRCLE_DIVISION-(idx+idxplus))+1)*STEPS_PER_PIN);
            sawing(!drc);
            idxplus=0;
          }
        }
      }
      k=k+1;
      if (thisMillis != timing.thisMillis_old) {
        deltaMillis = thisMillis-timing.thisMillis_old;
        timing.thisMillis_old = thisMillis;
        timing.allMillis = timing.allMillis + deltaMillis;
      } 
    }
    if(k > dataSize) {
      k=-1;
      for(int i=0;i<2;i++) {
        delay(300);
        sawing(HIGH);
        cRotate(LOW, STEPS_PER_PIN);
      }
      delay(300);
      sawing(LOW);
      cRotate(HIGH, STEPS_PER_PIN);
      sawing(LOW);
      unsigned long allSeconds=timing.allMillis/1000;
      int runHours= allSeconds/3600;
      int secsRemaining=allSeconds%3600;
      int runMinutes=secsRemaining/60;
      int runSeconds=secsRemaining%60;
      char buf[21];
      sprintf(buf,"Runtime%02d:%02d:%02d",runHours,runMinutes,runSeconds);
      timing.allMillis=0;
    }
  }
}

void oneStep(bool dic) {
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
  for(int i=2000;i>500;i=i-1) {
    digitalWrite(STEPPER_STEP_PIN, HIGH);
    delayMicroseconds(i);
    digitalWrite(STEPPER_STEP_PIN, LOW);
    delayMicroseconds(i);
    if(analogRead(sw) < 900 || analogRead(A4)+analogRead(A5) > 1800) {
      break;
    }
  }
  while (cal) {
    if(analogRead(sw) < 900 || analogRead(A4)+analogRead(A5) > 1800) {
      cal=false;
    }
cRotate(drc, STEPS_PER_PIN);
delay(500);
  }
}

void sawing(bool drc) {
  delay(100);
  servo.write(position.outleng);
  delay(100);
  servo1.write(position.upleng);
  delay(50);
  cRotate(drc, STEPS_PER_PIN);
  delay(100);
  servo.write(position.inleng);
  delay(10);
  servo1.write(position.downleng);
  delay(200);
}

int arr_check(int* arr, int start, int end, int val) {
  for(int i = start; i < end; i++) {
    if(arr[i] == val) return 1;
  }
  return -1;
}

void cRotate(bool direc, int spr) {
  digitalWrite(STEPPER_DIR_PIN, direc);
  digitalWrite(STEPPER_ENA_PIN, LOW);
  if(spr/STEPS_PER_REV >= 5 && spr/STEPS_PER_REV <= 40) {
    for(int j=timing.cRotS; j > timing.cRotS-100*timing.cRotAdd; j=j-1*timing.cRotAdd) {
      stepMotor(j);
    }
    for(int k=0; k < spr-200; k++) {
      stepMotor(timing.cRotS-100*timing.cRotAdd);
    }
    for(int l=timing.cRotS-100*timing.cRotAdd; l < timing.cRotS; l=l+1*timing.cRotAdd) {
      stepMotor(l);
    }
  } else {
    for (int i = 0; i < spr; i++) {
      stepMotor(timing.cRotS);
    }
  }
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
  for(int i = 0; i < size; i++) {
    if(arr[i] == val) return i;
  }
  return -1;
}

void stepMotor(int delay_us) {
  digitalWrite(STEPPER_STEP_PIN, HIGH);
  delayMicroseconds(delay_us);
  digitalWrite(STEPPER_STEP_PIN, LOW);
  delayMicroseconds(delay_us);
}
