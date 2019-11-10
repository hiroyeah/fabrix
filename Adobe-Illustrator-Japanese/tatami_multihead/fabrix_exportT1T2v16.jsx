///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// Fabrix Script
// G-CODE-IMPORT PLUGIN for Adobe Illustrator
// (c) Hiroya Tanaka, Social Fabrication Lab, Keio University, Japan, 2016 - 2017
// 
// Project Official Website:  http://www.fabrix.design/ 
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//現在のツールヘッド  1 or 2 
var tt = 1; 
var z =0.0; 
//初期設定
//
var xx = 0;
var yy = 0;

// F値の倍数
var trans  = 12;

//e値が絶対値であるため積算

// extrude値を交換しながら使う
var extrude = 0; 
//extrudeTZ= extrude T Zero
var extrudeTZ = 0;
//extrudeTZ= extrude T One
var extrudeTO = 0;
// 






// 温度
var heatbed = 55;
var hotend = 195;
var hotendtwo = 160;

// リトラクトの長さ
var retract = 4; 
var retractpull = 2;
var retract2 = 4; 
var retractpull2 = 2;

 
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
//var eassign = 1;  //original　///////////////////////////////////////
var eassign = 2;  //mod  理由：初期条件にてselectTがtrueとなっているため ///////////////////////////////////////////////////////
function setTextS() {
eassign = 1;
    }
function setTextT() {
eassign = 2;
    }
function setTextU() {
eassign = 3;
    }

// Eを長さに線形で設定する場合の係数
var eratio = 0.5;


// Eを超詳細設定する場合のフィラメント直径

var filament = 1.75

// Eを超詳細設定する場合の層の高さ
var extrudeheight = 0.2;

// Eを超詳細設定する場合の層の幅
var extrudewidth = 0.42



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//var saveFolder = actDoc.path;
//var actDocName = actDoc.name;
//var myFolder=Folder(app.activeDocument.path).selectDlg("Choose g-code output folder:");
//alert (myFolder + "/" + actDocName + ".gco");
//var saveFile = new File(myFolder + "/" + actDocName + ".gco");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var actDoc = activeDocument;
var saveFilen = File.saveDialog("Save filename (.gco/.gcode)");
var saveFilea = saveFilen + "_T1.gco";
var saveFile  = new File(saveFilea);
var saveFileb = saveFilen + "_T2.gco";
var saveFilee = new File(saveFileb);

//ツールヘッド1のためのG-CODE
var resultArrT1 = new Array;
//ツールヘッド2のためのG-CODE
var resultArrT2 = new Array;


//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', 'G-CODE変換設定パネル'); 

dlg.location = [500,50];
var defaultValueA = 50;
var defaultValueB = 50;
var defaultValueC = 1;
var defaultValueD = -6;

var defaultValue1 = trans ; //F係数　12 (*100= 1200)

var freemove = 2000;
var defaultValue2a = freemove ; //F係数　12 (*100= 1200)

var defaultValue3 = heatbed; //temparature
var defaultValue4 = hotend; //temparature
var defaultValue5 = hotendtwo; //temparature
var defaultValue7 = retract; //rectract
var defaultValue7z = retractpull; //rectract
var defaultValue7v = retract2; //rectract
var defaultValue7u = retractpull2; //rectract

var retractzup = 2.0;
var defaultValue7a = retractzup; //rectract
var defaultValue10 = eratio; //E係数　0.5
var defaultValue11 = filament; //フィラメント幅
var defaultValue12 = extrudeheight; //印刷層高さ
var defaultValue13 = extrudewidth; //印刷幅



     dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "X"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,360,35], '原点シフトX )')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl0.orientation='row';

     dlg.alertBtnsPnl1 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl1.titleEt = dlg.alertBtnsPnl1.add('edittext', [100,15,160,35], 0)).helpTip = "Y"; 
     dlg.alertBtnsPnl1.titleEt.text = defaultValueB; 
    (dlg.alertBtnsPnl1.titleSt = dlg.alertBtnsPnl1.add('statictext', [10,15,360,35], '原点シフトY ')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl1.orientation='row';
	 
	  dlg.alertBtnsPnl0a = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl0a.titleEt = dlg.alertBtnsPnl0a.add('edittext', [100,15,160,35], 0)).helpTip = "X"; 
     dlg.alertBtnsPnl0a.titleEt.text = defaultValueC; 
    (dlg.alertBtnsPnl0a.titleSt = dlg.alertBtnsPnl0a.add('statictext', [10,15,360,35], 'T2データ座標補正X )')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl0a.orientation='row';

     dlg.alertBtnsPnl1a = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl1a.titleEt = dlg.alertBtnsPnl1a.add('edittext', [100,15,160,35], 0)).helpTip = "Y"; 
     dlg.alertBtnsPnl1a.titleEt.text = defaultValueD; 
    (dlg.alertBtnsPnl1a.titleSt = dlg.alertBtnsPnl1a.add('statictext', [10,15,360,35], 'T2データ座標補正Y ')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl1a.orientation='row';
	 
	 

     dlg.alertBtnsPnl2 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl2.titleEt = dlg.alertBtnsPnl2.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl2.titleEt.text = defaultValue1; 
    (dlg.alertBtnsPnl2.titleSt = dlg.alertBtnsPnl2.add('statictext', [10,15,360,35], '線の透明度をF(速度)値に変換する係数')).helpTip = "times"; 
     dlg.alertBtnsPnl2.orientation='row';
	 
	 
	     dlg.alertBtnsPnl2a = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl2a.titleEt = dlg.alertBtnsPnl2a.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl2a.titleEt.text = defaultValue2a; 
    (dlg.alertBtnsPnl2a.titleSt = dlg.alertBtnsPnl2a.add('statictext', [10,15,360,35], 'プリントしない移動の速度')).helpTip = "mm/sec"; 
     dlg.alertBtnsPnl2a.orientation='row';
	 
	 
     
      dlg.alertBtnsPnl4 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl4.titleEt = dlg.alertBtnsPnl4.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl4.titleEt.text = defaultValue3; 
    (dlg.alertBtnsPnl4.titleSt = dlg.alertBtnsPnl4.add('statictext', [10,15,360,35], 'ヒートベッドの温度 (M104)')).helpTip = "c"; 
     dlg.alertBtnsPnl4.orientation='row';
     
      dlg.alertBtnsPnl5 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl5.titleEt = dlg.alertBtnsPnl5.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl5.titleEt.text = defaultValue4; 
    (dlg.alertBtnsPnl5.titleSt = dlg.alertBtnsPnl5.add('statictext', [10,15,360,35],'エクストルーダ1の温度  (T0)')).helpTip = "c"; 
     dlg.alertBtnsPnl5.orientation='row';
     
      dlg.alertBtnsPnl6 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl6.titleEt = dlg.alertBtnsPnl6.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl6.titleEt.text = defaultValue5; 
    (dlg.alertBtnsPnl6.titleSt = dlg.alertBtnsPnl6.add('statictext', [10,15,360,35],'エクストルーダ2の温度(T1)')).helpTip = "c"; 
     dlg.alertBtnsPnl6.orientation='row';
    
     dlg.alertBtnsPnl7 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl7.titleEt = dlg.alertBtnsPnl7.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl7.titleEt.text = defaultValue7; 
    (dlg.alertBtnsPnl7.titleSt = dlg.alertBtnsPnl7.add('statictext', [10,15,360,35], 'T1ヘッド- リトラクトの押し長さ (mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl7.orientation='row';
	 
	   dlg.alertBtnsPnl7z = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl7z.titleEt = dlg.alertBtnsPnl7z.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl7z.titleEt.text = defaultValue7z; 
    (dlg.alertBtnsPnl7z.titleSt = dlg.alertBtnsPnl7z.add('statictext', [10,15,360,35], 'T1ヘッド- リトラクトの戻し長さ (mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl7z.orientation='row';
	 
	   dlg.alertBtnsPnl7v = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl7v.titleEt = dlg.alertBtnsPnl7v.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl7v.titleEt.text = defaultValue7v; 
    (dlg.alertBtnsPnl7v.titleSt = dlg.alertBtnsPnl7v.add('statictext', [10,15,360,35], 'T2ヘッド- リトラクトの押し長さ (mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl7v.orientation='row';
	 
	   dlg.alertBtnsPnl7u = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl7u.titleEt = dlg.alertBtnsPnl7u.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl7u.titleEt.text = defaultValue7u; 
    (dlg.alertBtnsPnl7u.titleSt = dlg.alertBtnsPnl7u.add('statictext', [10,15,360,35], 'T2ヘッド- リトラクトの戻し長さ (mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl7u.orientation='row';
	 
	 
	     dlg.alertBtnsPnl7a = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl7a.titleEt = dlg.alertBtnsPnl7a.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
     dlg.alertBtnsPnl7a.titleEt.text = defaultValue7a; 
    (dlg.alertBtnsPnl7a.titleSt = dlg.alertBtnsPnl7a.add('statictext', [10,15,360,35], 'リトラクト前のZ持ち上げ')).helpTip = "mm"; 
     dlg.alertBtnsPnl7a.orientation='row';
	 
	 
     dlg.alertBtnsPnl8 = dlg.add('group',undefined, 'Threshold:');
     dlg.dimsPnl8 = dlg.add('panel', undefined, 'エクストルーダ数'); 
     dlg.dimsPnl8.orientation='row';
    (dlg.dimsPnl8.selectQ = dlg.dimsPnl8.add('radiobutton', [5,115,180,135], '1ヘッド' )).helpTip = ""; 
    (dlg.dimsPnl8.selectR = dlg.dimsPnl8.add('radiobutton', [5,140,180,160], '2ヘッド' )).helpTip = "";


	dlg.dimsPnl8.selectQ.value = true; 
	dlg.dimsPnl8.selectQ.onClick= setTextQ;
	dlg.dimsPnl8.selectR.onClick= setTextR;


	(dlg.dimsPnl9 = dlg.add('panel', undefined, 'E値の計算方法')).helpTip = "線分の長さに比例してE値を自動換算"; 
	dlg.dimsPnl9.orientation='row';
	(dlg.dimsPnl9.selectS = dlg.dimsPnl9.add('radiobutton', [5,115,180,135], '太さ個別指定' )).helpTip = ""; 
	(dlg.dimsPnl9.selectT = dlg.dimsPnl9.add('radiobutton', [5,140,180,160], '線分の長さに比例' )).helpTip = "";
	(dlg.dimsPnl9.selectU = dlg.dimsPnl9.add('radiobutton', [5,140,180,160], '超詳細設定をする' )).helpTip = "";

	dlg.dimsPnl9.selectT.value = true; 

	dlg.dimsPnl9.selectS.onClick= setTextS;
	dlg.dimsPnl9.selectT.onClick= setTextT;
	dlg.dimsPnl9.selectU.onClick= setTextU;


	(dlg.dimsPnl10b = dlg.add('panel', undefined, '上記で「太さ個別指定」か「線分の長さに比例」を選択した場合は下記の１項目だけ入力')).helpTip = "上記で「線分の長さに比例」を選択した場合は下記の１項目だけ入力"; 
	(dlg.dimsPnl10 = dlg.add('group', undefined, '上記で「太さ個別指定」「線分の長さに比例」を選択した場合は下記の１項目だけ入力')).helpTip = ""; 

     (dlg.dimsPnl10.titleEt = dlg.dimsPnl10.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
      dlg.dimsPnl10.titleEt.text = defaultValue10; 
    (dlg.dimsPnl10.titleSt = dlg.dimsPnl10.add('statictext', [10,15,360,35], 'E変換乗数')).helpTip = "times"; 
     dlg.dimsPnl10.orientation='row';
	 


	(dlg.dimsPnl11b = dlg.add('panel', undefined, '上記で「超詳細設定をする」を選択した場合は上記の１項目に加えて、下記の３項目を入力')).helpTip = "上記で「超詳細設定をする」を選択した場合は上記の１項目に加えて、下記の３項目を入力"; 
	(dlg.dimsPnl11 = dlg.add('group', undefined, '上記で「超詳細設定をする」を選択した場合は上記の１項目に加えて、下記の３項目を入力')).helpTip = ""; 
     (dlg.dimsPnl11.titleEt = dlg.dimsPnl11.add('edittext', [100,15,160,35], 0)).helpTip = "";  
      dlg.dimsPnl11.titleEt.text = defaultValue11; 
    (dlg.dimsPnl11.titleSt = dlg.dimsPnl11.add('statictext', [10,15,360,35], 'フィラメントの直径(mm)')).helpTip = "times"; 
     dlg.dimsPnl11.orientation='row';


     dlg.alertBtnsPnl12 = dlg.add('group',undefined, 'Threshold:');
     (dlg.alertBtnsPnl12.titleEt = dlg.alertBtnsPnl12.add('edittext', [100,15,160,35], 0)).helpTip = "";  
      dlg.alertBtnsPnl12.titleEt.text = defaultValue12; 
    (dlg.alertBtnsPnl12.titleSt = dlg.alertBtnsPnl12.add('statictext', [10,15,360,35], '印刷された1層の高さ(mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl12.orientation='row';

     dlg.alertBtnsPnl13 = dlg.add('group',undefined, 'Threshold:');
     (dlg.alertBtnsPnl13.titleEt = dlg.alertBtnsPnl13.add('edittext', [100,15,160,35], 0)).helpTip = ""; 
      dlg.alertBtnsPnl13.titleEt.text = defaultValue13; 
    (dlg.alertBtnsPnl13.titleSt = dlg.alertBtnsPnl13.add('statictext', [10,15,360,35], '印刷された1層の幅(mm)')).helpTip = "times"; 
     dlg.alertBtnsPnl13.orientation='row';



///----------

    dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
   
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();

	

freemove = parseFloat(dlg.alertBtnsPnl2a.titleEt.text); 
trans=  parseFloat(   dlg.alertBtnsPnl2.titleEt.text);
heatbed =  parseFloat(   dlg.alertBtnsPnl4.titleEt.text);
hotend =  parseFloat(     dlg.alertBtnsPnl5.titleEt.text);
hotendtwo =  parseFloat(     dlg.alertBtnsPnl6.titleEt.text);
var shiftx =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);
var shifty =  parseFloat(   dlg.alertBtnsPnl1.titleEt.text);
retractzup = parseFloat ( dlg.alertBtnsPnl7a.titleEt.text);



var T2x =  parseFloat (dlg.alertBtnsPnl0a.titleEt.text);
var T2y =  parseFloat (dlg.alertBtnsPnl1a.titleEt.text);
alert("T2補正" + T2x + " , " +T2y); 

retract = parseFloat(   dlg.alertBtnsPnl7.titleEt.text);
retractpull = parseFloat (   dlg.alertBtnsPnl7z.titleEt.text);


retract2 = parseFloat(   dlg.alertBtnsPnl7v.titleEt.text);
retractpull2 = parseFloat (   dlg.alertBtnsPnl7u.titleEt.text);




eratio = parseFloat(   dlg.dimsPnl10.titleEt.text);
filament =  parseFloat(   dlg.dimsPnl11.titleEt.text);
extrudeheight = parseFloat(   dlg.alertBtnsPnl12.titleEt.text);
extrudewidth =  parseFloat(   dlg.alertBtnsPnl13.titleEt.text);



  //   alert( n + " layers to  "+ pObj1.length +" paths "); 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// G-COde 生成
//
     resultArrT1.push("; Tool Head 1"); 
	 resultArrT1.push("; G-Code generated from G-Illustrator developed by Hiroya Tanaka");
     resultArrT1.push("; "+saveFilen +"T1" ); 
     resultArrT1.push("; ");
     resultArrT1.push("; ");  
     resultArrT1.push("; 定型Header");
	 
     resultArrT1.push("M400");
     resultArrT1.push("M42 P8 S0"); // set bed temperature
     resultArrT1.push("G4 P5000");

	      resultArrT1.push("; ");
		  resultArrT1.push("; block");
     resultArrT1.push("G1 Y0 F3600");
     resultArrT1.push("M400");
     resultArrT1.push("M42 P8 S255");
     resultArrT1.push("M400");
     resultArrT1.push("M226 P2 S0");
     resultArrT1.push("M400");
     resultArrT1.push("M42 P8 S0");
     resultArrT1.push("G4 P1000");
    

///


     resultArrT2.push("; Tool Head 2"); 
	 resultArrT2.push("; G-Code generated from G-Illustrator developed by Hiroya Tanaka");
     resultArrT2.push("; "+saveFilen +"T2" ); 
     resultArrT2.push("; ");
     resultArrT2.push("; ");  
     resultArrT2.push("; 定型Header");
	 
     resultArrT2.push("M400");
     resultArrT2.push("M42 P8 S0"); // set bed temperature
     resultArrT2.push("G4 P5000");

	 	      resultArrT2.push("; ");
		  resultArrT2.push("; block");
		  
     resultArrT2.push("G1 G1 Y1400 F3600");
     resultArrT2.push("M400");
     resultArrT2.push("M42 P8 S255");
     resultArrT2.push("M400");
     resultArrT2.push("M226 P2 S0");
     resultArrT2.push("M400");
     resultArrT2.push("M42 P8 S0");
     resultArrT2.push("G4 P1000");
	      resultArrT2.push("; ");
		  resultArrT2.push("; block");
	 resultArrT2.push("G1 G1 Y1400 F3600");
     resultArrT2.push("M400");
     resultArrT2.push("M42 P8 S255");
     resultArrT2.push("M400");
     resultArrT2.push("M226 P2 S0");
     resultArrT2.push("M400");
     resultArrT2.push("M42 P8 S0");
     resultArrT2.push("G4 P1000");
 



// original↓/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//resultArr.push("M109 S"+hotend+ "T0");
//resultArr.push("M109 S"+hotendtwo+ "T1");
// original↑
// mod↓

// mod↑/////////////////////////////////////////////////////////////////////////////////////////////////////////////


//resultArrT1.push("G21, G90, M82 = Millimeters, Absolute");
//resultArrT1.push("G21"); // set units to millimeters
//resultArrT1.push("G90"); // use absolute coordinates
//resultArrT1.push("M82"); // use absolute distances for extrusion


//resultArrT1.push("G21, G90, M82 = Millimeters, Absolute");
//resultArrT2.push("G21"); // set units to millimeters
//resultArrT2.push("G90"); // use absolute coordinates
//resultArrT2.push("M82"); // use absolute distances for extrusion

//original↓/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//resultArr.push("T0");
//resultArr.push("G92 E0");
//if (retract>0) {
//    resultArr.push("; ----Rectract Motion (Ready)-----");
//  extrude = extrude - retract; //リトラクト
//  resultArr.push("G1 E"+extrude+" F1800.00000");
//    resultArr.push("; --------------------------");
//}
//
//resultArr.push("T1");
//resultArr.push("G92 E0");
//if (retract>0) {
//    resultArr.push("; ----Rectract Motion (Ready)-----");
//  extrudetwo = extrudetwo - retract; //リトラクト
//  resultArr.push("G1 E"+extrudetwo +" F1800.00000");
//    resultArr.push("; --------------------------");
//
//}
//


if (headnum==1){
// １ヘッドモード
	
	if (tt == 1) {
    //現在のヘッドがヘッド1
	
    resultArrT1.push("T0");
    resultArrT1.push("G92 E0"); 
	} else { 
	
	 //現在のヘッドがヘッド2
	resultArrT2.push("T0");
    resultArrT2.push("G92 E0"); 	
	}
	
	
    if (retractpull>0) {
		
	    if (tt == 1) { 
			    //現在のヘッドがヘッド1
        resultArrT1.push("; ----Retract Motion (Ready)-----");

		
        extrude = extrude - retractpull; //リトラクト
		
        resultArrT1.push("G1 E"+extrude+" F1800.00000");
		
		        z = parseFloat(z) + parseFloat(retractzup); 
        resultArrT1.push("G1 Z"+z+" F1800");
		
		
        resultArrT1.push("; --------------------------"); 
		
			} else { 
				 //現在のヘッドがヘッド2
		resultArrT2.push("; ----Retract Motion (Ready)-----");

		
        extrude = extrude - retractpull2; //リトラクト
		
        resultArrT2.push("G1 E"+extrude+" F1800.00000");
		
			    z = parseFloat(z) + parseFloat(retractzup); 
        resultArrT2.push("G1 Z"+z+" F1800");
        resultArrT2.push("; --------------------------"); 	
			
			}	
    }
}

if (extrudenum==2){
	
	alert ("We are going to generate 2 different g-code files at the same time.");
	
	
    //resultArr.push("T0");
     //resultArr.push("G92 E0");
     //if (retract>0) {
     //    resultArr.push("; ----Retract Motion (Ready)-----");
      //   extrude = extrude - retract; //リトラクト
       //  resultArr.push("G1 E"+extrude+" F1800.00000");
       //  resultArr.push("; --------------------------");
     //}
     //resultArr.push("T1");
     //resultArr.push("G92 E0");
     //if (retract>0) {
       //  resultArr.push("; ----Retract Motion (Ready)-----");
        // extrudetwo = extrudetwo - retract; //リトラクト
        // resultArr.push("G1 E"+extrudetwo +" F1800.00000");
        // resultArr.push("; --------------------------");
     //}
}
//mod↑/////////////////////////////////////////////////////////////////////////////////////////////////////////////

//resultArr.push("M106"); // Fan On
//resultArr.push("; M106 Fan On");
//resultArr.push("; Header");
//===============



   

      
for(i = n-1; i>=0; i--){
	
	
  
	  if (activeDocument.layers[i].name  === "T1") { 
	  tt=1; 
	  resultArrT2.push("; "); 
	  resultArrT2.push("; block "); 
	  resultArrT2.push("G1 Y1400 F3600 ");
	  resultArrT2.push("M400 ");
	  resultArrT2.push("M42 P8 S255 ");
	  resultArrT2.push("M400 ");
	  resultArrT2.push("M226 P2 S0 ");
	  resultArrT2.push("M400  ");
	  resultArrT2.push("M42 P8 S0 ");
	  resultArrT2.push("G4 P1000 ");

	  resultArrT2.push("; block "); 
	  resultArrT2.push("G1 Y1400 F3600 ");
	  resultArrT2.push("M400 ");
	  resultArrT2.push("M42 P8 S255 ");
	  resultArrT2.push("M400 ");
	  resultArrT2.push("M226 P2 S0 ");
	  resultArrT2.push("M400  ");
	  resultArrT2.push("M42 P8 S0 ");
	  resultArrT2.push("G4 P1000 ");
	  
	  
	  // extrude change
	  extrudeTO = extrude; 
	  extrude = extrudeTZ;
	  
	  } 	  
	  if (activeDocument.layers[i].name  === "T2") { 
      tt=2; 
      resultArrT1.push("; "); 
	  

    resultArrT1.push(" ; block ");
    resultArrT1.push("G1 Y0 F3600");
    resultArrT1.push("M400");
    resultArrT1.push("M42 P8 S255");
    resultArrT1.push("M400");
    resultArrT1.push("M226 P2 S0");
    resultArrT1.push("M400 ");
    resultArrT1.push("M42 P8 S0");
    resultArrT1.push("G4 P1000");

    resultArrT1.push(" ; block");
    resultArrT1.push("G1 Y0 F3600");
    resultArrT1.push("M400");
    resultArrT1.push("M42 P8 S255");
    resultArrT1.push("M400");
    resultArrT1.push("M226 P2 S0");
    resultArrT1.push("M400 ");
    resultArrT1.push("M42 P8 S0");
    resultArrT1.push("G4 P1000");

		  // extrude change
    extrudeTZ = extrude; 
	extrude = extrudeTO;
	
	  } 	
	
	
    if (!isNaN(parseFloat(activeDocument.layers[i].name))) {
    if (parseFloat(activeDocument.layers[i].name) >=0 && activeDocument.layers[i].visible){ 
   

  var pObj2 = activeDocument.layers[i].pathItems;
                     
					 if (tt == 1) { 
					 resultArrT1.push("; ");  
                     resultArrT1.push("; ");  
                     resultArrT1.push(";  layer: "+String(n-1-i)+"/"+(n-1));  
                     resultArrT1.push("; ");  
					 } else { 
					 resultArrT2.push("; ");  
                     resultArrT2.push("; ");  
                     resultArrT2.push(";  layer: "+String(n-1-i)+"/"+(n-1));  
                     resultArrT2.push("; ");  					 					 
					 }

      for (j=pObj2.length-1; j>-1; j--){

              	 if (tt == 1) { 
              resultArrT1.push("; ");  
              resultArrT1.push(";  layer: "+String(n-1-i)+ "  path: "+j+"/"+ (pObj2.length-1));  
      	 } else {  
		       resultArrT2.push("; ");  
              resultArrT2.push(";  layer: "+String(n-1-i)+ "  path: "+j+"/"+ (pObj2.length-1)); 
		 
		 }
		 
		 
      for (k=0; k<pObj2[j].pathPoints.length; k++){

	 if (tt == 1) { 
              resultArrT1.push("; ");  
              resultArrT1.push(";  layer: "+String(n-1-i) + "  path: "+j +" points: "+k +"/"+(pObj2[j].pathPoints.length-1));  
	 } else { 
	          resultArrT2.push("; ");  
              resultArrT2.push(";  layer: "+String(n-1-i) + "  path: "+j +" points: "+k +"/"+(pObj2[j].pathPoints.length-1));  
	 }

//pointからmmへの変換（mm×2.834645）
//mmからpointへの変換 (point/2.834645）
          
      var x =   activeDocument.layers[i].pathItems[j].pathPoints[k].anchor[0]; 
      var y =   activeDocument.layers[i].pathItems[j].pathPoints[k].anchor[1];
// mod↓　//////////////////////////////////////////////////////////////////////////////	  
        x = x/ 2.834645;
        y = y/ 2.834645;
        
        x = x  + shiftx;
        y = y  + shifty;      
//mod↑　理由 E値を計算する際、pointからmmに変換し、シフト量を踏まえた上で計算させないと、実際とずれてしまうため。      
	  
	  if(eassign==1){
      var e =  eratio  * activeDocument.layers[i].pathItems[j].strokeWidth;
	  }
          if(eassign==2){ 
      var e =   eratio  * Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
	  }
	  if(eassign==3){
      var e = eratio  * (Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) * extrudewidth * extrudeheight)/(Math.PI*(filament/2)*(filament/2));

          }
	  
	  
      var h=    activeDocument.layers[i].pathItems[j].opacity;
      var z=    activeDocument.layers[i].name;
	  
	  
	  
 
	  
//origin ↓
//      x = x/ 2.834645;
//      y = y/ 2.834645;
//origin↑　単位換算を上に持って行ったため
      h = h* trans;
// origin↓      
//     e = e/ 2.834645;
//origin↑ 単位mmにてe値を計算しているため単位変換不要
//origin ↓
//      x = x +  shiftx;
//      y = y  + shifty;
//origin↑　上に持って行ったため

//alert(activeDocument.layers[i].pathItems[j].strokeDashes);


// 最初の点(K=0)の場合
if (k==0) {
// 最初の点までは樹脂を出さないで単なる移動





  if (tt==1) { 
    resultArrT1.push("T0");
    resultArrT1.push("G1 X"+x+" Y"+y+ " Z"+z+" F"+freemove); 
  } else { 
    resultArrT2.push("T0");
    resultArrT2.push("G1 X"+parseFloat(x+T2x)+" Y"+parseFloat(y+ T2y)+" Z"+z+" F"+freemove); //T1T2湯浅補正あり
  
  }

    xx=x; 
    yy=y;

  if (retract>0 ) {

  
    if (tt==1) { 
	  extrude = extrude + retract; //リトラクト
	  
    resultArrT1.push("; ----Rectract Motion (Start)----");
    resultArrT1.push("G1 E"+extrude+" F1800.00000");
    resultArrT1.push("; -------------------------------"); 
	} else { 
	  extrude = extrude + retract2; //リトラクト
    resultArrT2.push("; ----Rectract Motion (Start)----");
    resultArrT2.push("G1 E"+extrude+" F1800.00000");
    resultArrT2.push("; -------------------------------"); 
	
	}
}
}



// 最初の点(K=0)の場合'以外'
 else {
     if (extrudenum == 1) { 
     //ヘッド数が1つ

     extrude = extrude + e;
	 
	     if (tt==1) { 
      resultArrT1.push("T0");
      resultArrT1.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 
		 } else { 
	  resultArrT2.push("T0");
      resultArrT2.push("G1 X"+parseFloat(x+T2x)+" Y"+parseFloat(y+ T2y)+" Z"+z+" E"+extrude+" F"+h); 	 //T1T2湯浅補正あり	 
		 
		 }

    xx=x; 
    yy=y;


}

      
      

      if (extrudenum == 2) {
  
           extrude = extrude + e;

  if (tt==1) { 
      resultArrT1.push("T0");
      resultArrT1.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 
  } else { 
      resultArrT2.push("T0");
      resultArrT2.push("G1 X"+parseFloat(x+T2x)+" Y"+parseFloat(y+ T2y)+" Z"+z+" E"+extrude+" F"+h); 	 //T1T2湯浅補正あり
  }

    xx=x; 
    yy=y;
}

      }
 
	 
      




if (k==pObj2[j].pathPoints.length-1){
//アンカーの最後でまたリトラクト


if (activeDocument.layers[i].pathItems[j].closed) {

      var x =   activeDocument.layers[i].pathItems[j].pathPoints[0].anchor[0]; 
      var y =   activeDocument.layers[i].pathItems[j].pathPoints[0].anchor[1];
// mod↓　//////////////////////////////////////////////////////////////////////////////	  
        x = x/ 2.834645;
        y = y/ 2.834645;
        
        x = x + shiftx;
        y = y + shifty;      
//mod↑　理由 E値を計算する際、pointからmmに変換し、シフト量を踏まえた上で計算させないと、実際とずれてしまうため。

	  if(eassign==1){
      var e =  eratio  * activeDocument.layers[i].pathItems[j].strokeWidth;
	  }
          if(eassign==2){ 
      var e =   eratio  * Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
	  }
          if(eassign==3){
       var e = eratio  * (Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) * extrudewidth * extrudeheight)/(Math.PI*(filament/2)*(filament/2));

          }
	  

      var h=    activeDocument.layers[i].pathItems[j].opacity;
      var z=    activeDocument.layers[i].name;

//origin ↓
//      x = x/ 2.834645;
//      y = y/ 2.834645;
//origin↑　単位換算を上に持って行ったため
      h = h* trans;
// origin↓      
//     e = e/ 2.834645;
//origin↑ 単位mmにてe値を計算しているため単位変換不要
//origin ↓
//      x = x +  shiftx;
//      y = y  + shifty;
//origin↑　上に持って行ったため


//ヘッド数が１つ
  if (extrudenum == 1) {
 

      extrude = extrude + e;
	  
	    if (tt==1) { 
      resultArrT1.push("T0");
      resultArrT1.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h); 
		} else {
      resultArrT2.push("T0");
      resultArrT2.push("G1 X"+parseFloat(x+T2x)+" Y"+parseFloat(y+ T2y)+" Z"+z+" E"+extrude+" F"+h); 	 //T1T2湯浅補正あり	
		}

    xx=x; 
    yy=y;



      }
      

//ヘッド数が２つ
      if (extrudenum == 2) {

           extrude = extrude + e;
     if (tt==1) { 
      resultArrT1.push("T0");
      resultArrT1.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h);
	 } else { 
      resultArrT2.push("T0");
      resultArrT2.push("G1 X"+parseFloat(x+T2x)+" Y"+parseFloat(y+ T2y)+" Z"+z+" E"+extrude+" F"+h); 	 //T1T2湯浅補正あり	 

	 }	 

    xx=x; 
    yy=y;
}

      

}





////リトラクト



  if (retractpull > 0) {

         if (tt==1) { 
  resultArrT1.push("; ----Rectract Motion (End) -----");
  resultArrT1.push("T0");
		 } else { 
  resultArrT2.push("; ----Rectract Motion (End) -----");
  resultArrT2.push("T0");		 
		 
		 }
  
        if (tt==1) { 

	extrude = extrude - retractpull; //リトラクト
  
  resultArrT1.push("G1 E"+extrude+" F1800.00000");
  	z = parseFloat(z) + parseFloat(retractzup); 
    resultArrT1.push("G1 Z"+z+" F1800");
	
  resultArrT1.push("; -------------------------------");
		} else { 
  
extrude = extrude - retractpull2; //リトラクト
  
  resultArrT2.push("G1 E"+extrude+" F1800.00000");
    z = parseFloat(z) + parseFloat(retractzup); 
    resultArrT2.push("G1 Z"+z+" F1800");
  resultArrT2.push("; -------------------------------");			
		}
}

}
}



}
}
	}

else {
 if (tt==1) {
resultArrT1.push("; Layer name :"+activeDocument.layers[i].name+" Tool Change finished.");
 } else { 
resultArrT2.push("; Layer name :"+activeDocument.layers[i].name+" Tool Change finished."); 
 }
}
}

 

//--定型Footer
resultArrT1.push(";Footer");

resultArrT1.push("G1 Y0 F3600");
resultArrT1.push("M400");
resultArrT1.push("M42 P8 S255");
resultArrT1.push("M400");
resultArrT1.push("M226 P2 S0");
resultArrT1.push("M400"); 
resultArrT1.push("M42 P8 S0");
resultArrT1.push("G4 P1000");

resultArrT1.push("G1 Y0 F3600");
resultArrT1.push("M400");
resultArrT1.push("M42 P8 S255");
resultArrT1.push("M400");
resultArrT1.push("M226 P2 S0");
resultArrT1.push("M400"); 
resultArrT1.push("M42 P8 S0");
resultArrT1.push("G4 P1000");

resultArrT2.push("; 定型Footerここまで");


//--
resultArrT2.push(";Footer");
resultArrT2.push("G1 Y1400 F3600");
resultArrT2.push("M400");
resultArrT2.push("M42 P8 S255");
resultArrT2.push("M400");
resultArrT2.push("M226 P2 S0");
resultArrT2.push("M400 ");
resultArrT2.push("M42 P8 S0");
resultArrT2.push("G4 P1000");


resultArrT2.push("; 定型Footerここまで");
//--

saveFile.open("w");
var success = saveFile.write(resultArrT1.join("\n"));
saveFile.close();

if (extrudenum==2){
saveFilee.open("w");
var success = saveFilee.write(resultArrT2.join("\n"));
saveFilee.close();
}

// 読み込み終了　表示を出す
if(success){
     alert( n + " layers to "+ pObj1.length +" paths are written in G-CODE"); 
    } else {
    alert("failed.");
    }
  
  /////
    
