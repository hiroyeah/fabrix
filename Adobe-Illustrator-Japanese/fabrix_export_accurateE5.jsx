///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Fabrix Scripts
// G-CODE-EXPORT PLUGIN for Adobe Illustrator
// (c) Hiroya Tanaka, Social Fabrication Lab, Keio University, Japan, 2016-2017
//  
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//

//初期設定
//
var xx = 0;
var yy = 0;


var zpos = 0.00;  //zも保持していないとRetractが計算できない

// F値の倍数
var trans  = 360;
// E値の倍数
var transs = 1;
//e値が絶対値であるため積算
var extrude = 0; 
var extrudetwo = 0; 
// 温度
var heatbed = 50;
var hotend = 200;
var hotendtwo = 160;

// リトラクトの長さ
var retract = 0.0000;  // Retract for E
var zretract = 0.0000; // Retract for Z 

// ヘッドの数
var extrudenum = 1;
function setTextQ() {
extrudenum = 1;
    }
function setTextR() {
extrudenum = 2;
    }

// ヘッドの切り替え変数(EのままT0/T1 or A/B)
var headnum = 1;
function setTextO() {
headnum = 1;
    }
function setTextP() {
headnum = 2;
    }

// Eの値を自動計算
var eassign = 1;
function setTextS() {
eassign = 1;
    }
function setTextT() {
eassign = 2;
    }
function setTextU() {
eassign = 3;
    }
var eratio = 0.5;


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//var saveFolder = actDoc.path;
//var actDocName = actDoc.name;
//var myFolder=Folder(app.activeDocument.path).selectDlg("Choose g-code output folder:");
//alert (myFolder + "/" + actDocName + ".gco");
//var saveFile = new File(myFolder + "/" + actDocName + ".gco");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var actDoc = activeDocument;
var saveFilen = File.saveDialog("Save filename (.gco/.gcode)");
saveFilen = saveFilen + ".gcode";
var saveFile = new File(saveFilen);
var resultArr = new Array;

//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', 'Ratio (Transparence of Anchor Path to G-Code Fade Rate)'); 

dlg.location = [500,50];
var defaultValueA = 50;
var defaultValueB = 50;
var defaultValue1 = trans ; //opacity to F
var defaultValue2 = transs; //strokeWidth to E 
var defaultValue3 = heatbed; //opacity to F
var defaultValue4 = hotend; //temparature
var defaultValue5 = hotendtwo; //temparature
var defaultValue7 = retract; //rectract (for E)
var defaultValue77 = zretract; //z-retract 
var defaultValue8 = eratio;


 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "X"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,360,35], 'Shift (x)')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl0.orientation='row';

     dlg.alertBtnsPnl1 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl1.titleEt = dlg.alertBtnsPnl1.add('edittext', [100,15,160,35], 0)).helpTip = "Y"; 
     dlg.alertBtnsPnl1.titleEt.text = defaultValueB; 
    (dlg.alertBtnsPnl1.titleSt = dlg.alertBtnsPnl1.add('statictext', [10,15,360,35], 'Shift (y)')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl1.orientation='row';

     dlg.alertBtnsPnl2 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl2.titleEt = dlg.alertBtnsPnl2.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl2.titleEt.text = defaultValue1; 
    (dlg.alertBtnsPnl2.titleSt = dlg.alertBtnsPnl2.add('statictext', [10,15,360,35], 'Fの値　絶対値　 (Transparency of Anchor Path to G-Code Fade Rate)')).helpTip = "times"; 
     dlg.alertBtnsPnl2.orientation='row';

     dlg.alertBtnsPnl3 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl3.titleEt = dlg.alertBtnsPnl3.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl3.titleEt.text = defaultValue2; 
    (dlg.alertBtnsPnl3.titleSt = dlg.alertBtnsPnl3.add('statictext', [10,15,360,35], 'Ratio (Thickness of Anchor Path to G-Code Extrusion)')).helpTip = "times"; 
     dlg.alertBtnsPnl3.orientation='row';
     
      dlg.alertBtnsPnl4 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl4.titleEt = dlg.alertBtnsPnl4.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl4.titleEt.text = defaultValue3; 
    (dlg.alertBtnsPnl4.titleSt = dlg.alertBtnsPnl4.add('statictext', [10,15,360,35], 'Temparature of Heatbed (M104)')).helpTip = "c"; 
     dlg.alertBtnsPnl4.orientation='row';
     
      dlg.alertBtnsPnl5 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl5.titleEt = dlg.alertBtnsPnl5.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl5.titleEt.text = defaultValue4; 
    (dlg.alertBtnsPnl5.titleSt = dlg.alertBtnsPnl5.add('statictext', [10,15,360,35],'Temparature of Extruder1 (T0)')).helpTip = "c"; 
     dlg.alertBtnsPnl5.orientation='row';
     
      dlg.alertBtnsPnl6 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl6.titleEt = dlg.alertBtnsPnl6.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl6.titleEt.text = defaultValue5; 
    (dlg.alertBtnsPnl6.titleSt = dlg.alertBtnsPnl6.add('statictext', [10,15,360,35],'Temparature of Extruder2 (T1)')).helpTip = "c"; 
     dlg.alertBtnsPnl6.orientation='row';
    
     dlg.alertBtnsPnl7 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl7.titleEt = dlg.alertBtnsPnl7.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl7.titleEt.text = defaultValue7; 
    (dlg.alertBtnsPnl7.titleSt = dlg.alertBtnsPnl7.add('statictext', [10,15,360,35], 'E Retraction (mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl7.orientation='row';
	 
	      dlg.alertBtnsPnl77 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl77.titleEt = dlg.alertBtnsPnl77.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl77.titleEt.text = defaultValue77; 
    (dlg.alertBtnsPnl77.titleSt = dlg.alertBtnsPnl77.add('statictext', [10,15,360,35], 'Z Retraction (formove) (mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl77.orientation='row';
	 
	 
	 
	      dlg.alertBtnsPnl8 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl8.titleEt = dlg.alertBtnsPnl8.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl8.titleEt.text = defaultValue8; 
    (dlg.alertBtnsPnl8.titleSt = dlg.alertBtnsPnl8.add('statictext', [10,15,360,35], '線分の長さをE値に自動換算する場合の乗数 (Extrusion Multiplier)')).helpTip = "times"; 
     dlg.alertBtnsPnl8.orientation='row';
	 


	(dlg.dimsPnl3 = dlg.add('panel', undefined, 'エクストルーダ数')).helpTip = "エクストルーダ数"; 
	 dlg.dimsPnl3.orientation='row';
	(dlg.dimsPnl3.selectQ = dlg.dimsPnl3.add('radiobutton', [5,115,180,135], '1ヘッド' )).helpTip = ""; 
	(dlg.dimsPnl3.selectR = dlg.dimsPnl3.add('radiobutton', [5,140,180,160], '2ヘッド' )).helpTip = "";


	dlg.dimsPnl3.selectQ.value = true; 

	dlg.dimsPnl3.selectQ.onClick= setTextQ;
	dlg.dimsPnl3.selectR.onClick= setTextR;


//	(dlg.dimsPnl3 = dlg.add('panel', undefined, '押し出し変数')).helpTip = "押し出し変数"; 
//	dlg.dimsPnl3.orientation='row';
//	(dlg.dimsPnl3.selectQ = dlg.dimsPnl3.add('radiobutton', [5,115,180,135], 'E' )).helpTip = ""; 
//	(dlg.dimsPnl3.selectR = dlg.dimsPnl3.add('radiobutton', [5,140,180,160], 'A/B' )).helpTip = "";


//	dlg.dimsPnl3.selectQ.value = true; 

//	dlg.dimsPnl3.selectQ.onClick= setTextQ;
//	dlg.dimsPnl3.selectR.onClick= setTextR;

	(dlg.dimsPnl3 = dlg.add('panel', undefined, '線分の長さに比例してE値を自動換算')).helpTip = "線分の長さに比例してE値を自動換算"; 
	dlg.dimsPnl3.orientation='row';
	(dlg.dimsPnl3.selectS = dlg.dimsPnl3.add('radiobutton', [5,115,180,135], 'はい' )).helpTip = ""; 
	(dlg.dimsPnl3.selectT = dlg.dimsPnl3.add('radiobutton', [5,140,180,160], 'いいえ' )).helpTip = "";
	(dlg.dimsPnl3.selectU = dlg.dimsPnl3.add('radiobutton', [5,165,180,185], '数式' )).helpTip = "";

	dlg.dimsPnl3.selectS.value = true; 

	dlg.dimsPnl3.selectS.onClick= setTextS;
	dlg.dimsPnl3.selectT.onClick= setTextT;
    dlg.dimsPnl3.selectU.onClick= setTextU;

///----------

    dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
   
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();

trans=  parseFloat(   dlg.alertBtnsPnl2.titleEt.text);
transs=  parseFloat(   dlg.alertBtnsPnl3.titleEt.text);
heatbed =  parseFloat(   dlg.alertBtnsPnl4.titleEt.text);
hotend =  parseFloat(     dlg.alertBtnsPnl5.titleEt.text);
hotendtwo =  parseFloat(     dlg.alertBtnsPnl6.titleEt.text);
var shiftx =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);
var shifty =  parseFloat(   dlg.alertBtnsPnl1.titleEt.text);
retract = parseFloat(   dlg.alertBtnsPnl7.titleEt.text).toFixed(4);
zretract = parseFloat(   dlg.alertBtnsPnl77.titleEt.text).toFixed(4);
eratio = parseFloat(   dlg.alertBtnsPnl8.titleEt.text);
  //   alert( n + " layers to  "+ pObj1.length +" paths "); 
     
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// G-COde 生成
//
     resultArr.push("; G-Code generated from G-Illustrator developed by Hiroya Tanaka");
     resultArr.push("; "+saveFilen ); 
     resultArr.push("; ");
     resultArr.push("; ");  

//--
//===以下Header===



resultArr.push("; 定型Header");
resultArr.push("M103");
resultArr.push("MM73 P0");
resultArr.push("G21");
resultArr.push("G90");



resultArr.push("M109 S"+heatbed+ " T0");
resultArr.push("M104 S"+hotend+ " T0");

resultArr.push("G162 X Y F2500"); 
resultArr.push("G161 Z F1100");
resultArr.push("G92 Z-5"); 
resultArr.push("G1 Z0.0 ");
resultArr.push("G161 Z F100");
resultArr.push("M132 X Y Z A B");
resultArr.push("G1 X-110.5 Y-74 Z150 F3300.0");
resultArr.push("G130 X20 Y20 Z20 A20 B20");
resultArr.push("M6 T0");
resultArr.push("G130 X127 Y127 Z40 A127 B127");
resultArr.push("M108 R3.0 T0");
resultArr.push("G0 X-110.5 Y-74");
resultArr.push("G0 Z0.6");
resultArr.push("M108 R5.0 ");
resultArr.push("M101");
resultArr.push("G4 P2000");
resultArr.push("M105");
resultArr.push("M106"); //Fan On


resultArr.push("M133 T0") ; //stabilize bed temperature



resultArr.push("T0");


if (retract>0) {
    resultArr.push("; ----Rectract Motion Extruder1(Ready/ Minus)-----");
    extrude = -parseFloat(retract).toFixed(4);
    resultArr.push("G1 E"+extrude+" F2500.00000");

	
    zpos = parseFloat(parseFloat(zpos) - parseFloat(zretract)).toFixed(4);
	resultArr.push("G1 Z"+zpos+" F1800.00000");
	
	resultArr.push("; --------------------------");
}

     if (extrudenum == 2) { 
resultArr.push("T1");
resultArr.push("G92 E0");
if (retract>0) {
    resultArr.push("; ----Rectract Motion Extruder2(Ready / Minus)-----");
 extrudetwo = -parseFloat(retract).toFixed(4);
extrudetwo = parseFloat(extrudetwo).toFixed(4);
  resultArr.push("G1 E"+extrudetwo +" F2500.00000");


    zpos = parseFloat(parseFloat(zpos) - parseFloat(zretract)).toFixed(4);
	resultArr.push("G1 Z"+zpos+" F1800.00000");
  resultArr.push("; --------------------------");

}
	 }

resultArr.push("; Header");
//===============



   

      
for(i = n-1; i>=0; i--){
    if (!isNaN(parseFloat(activeDocument.layers[i].name))) {
    if (parseFloat(activeDocument.layers[i].name) >=0 && activeDocument.layers[i].visible){ 
   

  var pObj2 = activeDocument.layers[i].pathItems;
                     resultArr.push("; ");  
                     resultArr.push("; ");  
  
              resultArr.push(";  layer: "+String(n-1-i)+"/"+(n-1));  
                               resultArr.push("; ");  

      for (j=pObj2.length-1; j>-1; j--){


              resultArr.push("; ");  
              resultArr.push(";  layer: "+String(n-1-i)+ "  path: "+j+"/"+ (pObj2.length-1));  
      
      for (k=0; k<pObj2[j].pathPoints.length; k++){


              resultArr.push("; ");  
              resultArr.push(";  layer: "+String(n-1-i) + "  path: "+j +" points: "+k +"/"+(pObj2[j].pathPoints.length-1));  


//pointからmmへの変換（mm×2.834645）
//mmからpointへの変換 (point/2.834645）
          
      var x =   activeDocument.layers[i].pathItems[j].pathPoints[k].anchor[0]; 
      var y =   activeDocument.layers[i].pathItems[j].pathPoints[k].anchor[1];
	  
	  if(eassign==1){
      var e =   activeDocument.layers[i].pathItems[j].strokeWidth;
	  e = e/ 2.834645* transs;
	  }
          if(eassign==2){ 
      var e =   eratio  * Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
	  e = e/ 2.834645* transs;
	  }
	   
	  
	  
      var h=    activeDocument.layers[i].pathItems[j].opacity;
      var z=    activeDocument.layers[i].name;
      zpos = z; 
	  
	  //値を換算
      x = x/ 2.834645;
      y = -y/ 2.834645;
      h =  trans;
	  
	  
	  if(eassign==3){ 
	  var ln = Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
	  var vg = ln * 0.2 * 0.4;  // 0.2 = Height, 0.4 = Width 
	  var lf = vg /  (Math.PI * (1.75/2)* (1.75/2)); 
      var e =   eratio  * lf; 
	  
	  }
	  
	  
      

      x = x  +  shiftx;
      y = y  +  shifty;

	  
	  x = parseFloat(x).toFixed(2);
	  y = parseFloat(y).toFixed(2);

	  
//alert(activeDocument.layers[i].pathItems[j].strokeDashes);


// 最初の点(K=0)の場合
if (k==0) {
// 最初の点までは樹脂を出さないで単なる移動


// 破線の場合
 if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0) {



    resultArr.push("T1");
    resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" F"+h); 

    xx=x; 
    yy=y;
    zpos=z;

  if (retract>0) {
 extrudetwo = parseFloat(retract).toFixed(4);
		 
    	 extrudetwo = parseFloat(extrudetwo).toFixed(4);
		 
    resultArr.push("; ----Rectract Motion Extruder2(Start/ Plus)-----");
  resultArr.push("G1 E"+extrudetwo +" F750");

  
   // zpos = parseFloat(parseFloat(zpos) + parseFloat(zretract)).toFixed(4);
	//resultArr.push("G1 Z"+zpos+" F1800.00000");
	
    resultArr.push("; --------------------------------");
	
}	
} 

// 実線の場合
 else {



    resultArr.push("T0");
    resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" F"+h); 

    xx=x; 
    yy=y;
        zpos=z;
		
  if (retract>0 ) {
 extrude = parseFloat(retract).toFixed(4);
		 

    resultArr.push("; ----Rectract Motion Extruder1 (Start/ Plus)----");
	

    resultArr.push("G1 E"+extrude+" F750");

  
   // zpos = parseFloat(parseFloat(zpos) + parseFloat(zretract)).toFixed(4);
	//resultArr.push("G1 Z"+zpos+" F1800.00000");
    resultArr.push("; -------------------------------");
}
}
}


// 最初の点(K=0)の場合'以外'
 else {
     if (extrudenum == 1) { 
     //ヘッド数が1つ


 extrude = parseFloat(e).toFixed(4); 

	 


     //alert("e: "+e+ "+parseFloat: "+parseFloat(e).toFixed(4)+" ... "+ extrude + "(3)");
	 
      resultArr.push("T0");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 

    xx=x; 
    yy=y;
    zpos=z;

}

      
      

      if (extrudenum == 2) {
    //ヘッド数が2つ
      if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0 ) {
         
  extrudetwo = parseFloat(e).toFixed(4);
	
     resultArr.push("T1");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrudetwo+" F"+h); 

    xx=x; 
    yy=y;
	    zpos=z;
      }  else {
      extrude = parseFloat(e).toFixed(4);
	  
      resultArr.push("T0");
	  
	  
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 

    xx=x; 
    yy=y;
	    zpos=z;
}

      }
 }
	 
      




if (k==pObj2[j].pathPoints.length-1){
//アンカーの最後でまたリトラクト


if (activeDocument.layers[i].pathItems[j].closed) {

            resultArr.push("; ");  
            resultArr.push(";  path closed"); 

      var x =   activeDocument.layers[i].pathItems[j].pathPoints[0].anchor[0]; 
      var y =   activeDocument.layers[i].pathItems[j].pathPoints[0].anchor[1];

	  if(eassign==1){
      var e =   activeDocument.layers[i].pathItems[j].strokeWidth;
	      e = e/ 2.834645* transs;
	  }
          if(eassign==2){ 
      var e =   eratio  * Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
	      e = e/ 2.834645* transs;
	  }
	  

      var h=    activeDocument.layers[i].pathItems[j].opacity;
      var z=    activeDocument.layers[i].name;

      x = x/ 2.834645;
      y = y/ 2.834645;
      h = trans;
  

	  
	  
	  if(eassign==3){ 
	  var ln = Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
	  var vg = ln * 0.2 * 0.4;  // 0.2 = Height, 0.4 = Width 
	  var lf = vg /  (Math.PI * (1.75/2)* (1.75/2)); 
      var e =   eratio  * lf; 
	  }
	  
	  
	  
      x = x +  shiftx;
      y = y  + shifty;



//ヘッド数が１つ
  if (extrudenum == 1) {
     if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0) {

         extrude = parseFloat(e).toFixed(4);
	
      resultArr.push("T0");
	  
	  
	 

      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 

    xx=x; 
    yy=y;
    zpos =z;

}

      }
      

//ヘッド数が２つ
      if (extrudenum == 2) {
      if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0 ) {
       extrudetwo = parseFloat(e).toFixed(4);
   resultArr.push("T1");
　
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrudetwo+" F"+h); 

    xx=x; 
    yy=y;
    zpos =z;

      }  else {
          extrude = parseFloat(e).toFixed(4);

      resultArr.push("T0");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 

    xx=x; 
    yy=y;
	    zpos =z;
}

      }

}





////リトラクト

 if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0 ) {

  if (retract>0 && extrudenum ==2) {
	resultArr.push("; ----Rectract Motion Extruder2(End/ Minus) -----");
    resultArr.push("T1");


         extrudetwo = -parseFloat(retract).toFixed(4);
		   resultArr.push("G1 E"+extrudetwo +" F2500.00000");
		 

    zpos = parseFloat(parseFloat(zpos) - parseFloat(zretract)).toFixed(4);
	resultArr.push("G1 Z"+zpos+" F1800.00000");
	

    resultArr.push("; -----------------------^^^^^---");
}	
} else {

  if (retract > 0) {

  resultArr.push("; ----Rectract Motion Extruder1(End /minus) -----");
  resultArr.push("T0");
  
  extrude = -parseFloat(retract).toFixed(4);
		 resultArr.push("G1 E"+extrude+" F2500.00000");
  

    zpos = parseFloat(parseFloat(zpos) - parseFloat(zretract)).toFixed(4);
	resultArr.push("G1 Z"+zpos+" F1800.00000");
	
  resultArr.push("; -------------------------------");
}

}
}
}


}
}
	}

else {
resultArr.push("; Layer:"+activeDocument.layers[i].name+" failed.");
}
}

 

//--定型Footer
resultArr.push(";Footer");
resultArr.push("G1 X0 Y0 Z400 F5000");
resultArr.push("M140 S0");
resultArr.push("M42 P2 S0");
resultArr.push("G28");
resultArr.push("M107");

resultArr.push("; 定型Footerここまで");
//--


saveFile.open("w");
var success = saveFile.write(resultArr.join("\n"));
saveFile.close();


// 読み込み終了　表示を出す
if(success){
     alert( n + " layers to "+ pObj1.length +" paths are written in G-CODE"); 
    } else {
    alert("failed.");
    }
  
  /////
    
