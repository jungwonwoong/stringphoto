var pins= new Array();
var output = new Array();
var count0 = 0;
var count = 0;
var count1 = 60;
var divi = 3;
var plus = 50;
var total='';
for(let i=0;i<60;i+=2) {
    pins[i]=count0;
    pins[i+1]=count0+45;
    if(pins[i] >= 120 && pins[i] < 240) pins[i]=pins[i]-120;  
    else if(pins[i] >= 240) pins[i]=pins[i]-240;
    if(pins[i+1] >= 120 && pins[i+1] < 240) pins[i+1]=pins[i+1]-120;
    if(pins[i+1] >= 240) pins[i+1]=pins[i+1]-240;
   total=total+pins[i]+','+pins[i+1] + ',';
   count0+=4;
}
for(let i=0;i<40;i+=2) {
     pins[i]=count;
     pins[i+1]=count+40;
     if(pins[i] >= 120 && pins[i] < 240) pins[i]=pins[i]-120;  
     else if(pins[i] >= 240) pins[i]=pins[i]-240;
     if(pins[i+1] >= 120 && pins[i+1] < 240) pins[i+1]=pins[i+1]-120;
     if(pins[i+1] >= 240) pins[i+1]=pins[i+1]-240;
    total=total+pins[i]+','+pins[i+1] + ',';
    count++;
}
for(let i=40;i<80;i+=2) {
    pins[i]=count1;
    pins[i+1]=count1+40;
    if(pins[i] >= 120 && pins[i] < 240) pins[i]=pins[i]-120;  
    else if(pins[i] >= 240) pins[i]=pins[i]-240;
    if(pins[i+1] >= 120 && pins[i+1] < 240) pins[i+1]=pins[i+1]-120;
    if(pins[i+1] >= 240) pins[i+1]=pins[i+1]-240;
   total=total+pins[i]+','+pins[i+1] + ',';
   count1++;
}
// for(let i=16;i<46;i++) {
//     pins[i]=count1;
//     pins[i+1]=count1+30;
//     if(pins[i] >= 120 && pins[i] < 240) pins[i]=pins[i]-120;  
//     else if(pins[i] >= 240) pins[i]=pins[i]-240;
//     if(pins[i+1] >= 120 && pins[i+1] < 240) pins[i+1]=pins[i+1]-120;
//     if(pins[i+1] >= 240) pins[i+1]=pins[i+1]-240;
//    total=total+pins[i]+','+pins[i+1] + ',';
//    count1++;
// }
console.log(total);

// 엉덩이 기본
// var pins= new Array();
// var output = new Array();
// var count = 0;
// var divi = 2;
// var total='';
// for(let i=0;i<240;i+=2) {
//      pins[i]=count;
//      pins[i+1]=count*divi;
//      if(pins[i] >= 120 && pins[i] < 240) pins[i]=pins[i]-120;  
//      else if(pins[i] >= 240) pins[i]=pins[i]-240;
//      if(pins[i+1] >= 120 && pins[i+1] < 240) pins[i+1]=pins[i+1]-120;
//      if(pins[i+1] >= 240) pins[i+1]=pins[i+1]-240;
//     total=total+pins[i]+','+pins[i+1] + ',';
//     count+=1;
// }
// console.log(total);

// 태극 기본
// var pins= new Array();
// var output = new Array();
// var count = 0;
// var divi = 2;
// var total='';
// for(let i=0;i<120;i+=2) {
//      pins[i]=count+60;
//      pins[i+1]=count*divi+60;
//      if(pins[i] >= 120 && pins[i] < 240) pins[i]=pins[i]-120;  
//      else if(pins[i] >= 240) pins[i]=pins[i]-240;
//      if(pins[i+1] >= 120 && pins[i+1] < 240) pins[i+1]=pins[i+1]-120;
//      if(pins[i+1] >= 240) pins[i+1]=pins[i+1]-240;
//     total=total+pins[i]+','+pins[i+1] + ',';
//     count+=1;
// }
// console.log(total);

//눈
