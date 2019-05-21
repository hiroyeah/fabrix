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

//

//初期設定
//
var xx = 0;
var yy = 0;
// F値の倍数
var trans  = 12;

//e値が絶対値であるため積算
var extrude = 0;
var extrudetwo = 0;
// 温度
var heatbed = 55;
var hotend = 195;
var hotendtwo = 160;

// リトラクトの長さ
var retract = 2;

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
var saveFilen = File.saveDialog("Save filename (.gcode)");
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
var dlg = new Window('dialog', 'G-CODE変換設定パネル');

dlg.location = [500,50];
var defaultValueA = 50;
var defaultValueB = 50;
var defaultValue1 = trans ; //F係数　12 (*100= 1200)
var defaultValue3 = heatbed; //temparature
var defaultValue4 = hotend; //temparature
var defaultValue5 = hotendtwo; //temparature
var defaultValue7 = retract; //rectract
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

     dlg.alertBtnsPnl2 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl2.titleEt = dlg.alertBtnsPnl2.add('edittext', [100,15,160,35], 0)).helpTip = "";
     dlg.alertBtnsPnl2.titleEt.text = defaultValue1;
    (dlg.alertBtnsPnl2.titleSt = dlg.alertBtnsPnl2.add('statictext', [10,15,360,35], '線の透明度をF(速度)値に変換する係数')).helpTip = "times";
     dlg.alertBtnsPnl2.orientation='row';

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
    (dlg.alertBtnsPnl7.titleSt = dlg.alertBtnsPnl7.add('statictext', [10,15,360,35], 'リトラクトの長さ (mm)')).helpTip = "times";
     dlg.alertBtnsPnl7.orientation='row';

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

trans=  parseFloat(   dlg.alertBtnsPnl2.titleEt.text);
heatbed =  parseFloat(   dlg.alertBtnsPnl4.titleEt.text);
hotend =  parseFloat(     dlg.alertBtnsPnl5.titleEt.text);
hotendtwo =  parseFloat(     dlg.alertBtnsPnl6.titleEt.text);
var shiftx =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);
var shifty =  parseFloat(   dlg.alertBtnsPnl1.titleEt.text);
retract = parseFloat(   dlg.alertBtnsPnl7.titleEt.text);
eratio = parseFloat(   dlg.dimsPnl10.titleEt.text);
filament =  parseFloat(   dlg.dimsPnl11.titleEt.text);
extrudeheight = parseFloat(   dlg.alertBtnsPnl12.titleEt.text);
extrudewidth =  parseFloat(   dlg.alertBtnsPnl13.titleEt.text);



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
resultArr.push("M107")
resultArr.push("M190 S"+heatbed) // set bed temperature

// original ↓/////////////////////////////////////////////////////////////////////////////////////////////////////////////
// resultArr.push("M104 S"+hotend+ "T0");
// resultArr.push("M104 S"+hotendtwo+ "T1");
// original ↑
// mod↓　ヘッドの設定数に合わせるため。材料によっては焦げ付く可能性があるのでそれを回避する意味合いもあります。
if (headnum==1){
    resultArr.push("M104 S"+hotend+ " T0");
}
if (headnum==2){
    resultArr.push("M104 S"+hotend+ " T0");
    resultArr.push("M104 S"+hotendtwo+ " T1");
}
// mod↑/////////////////////////////////////////////////////////////////////////////////////////////////////////////

resultArr.push("M891 P0");
resultArr.push("T0");
resultArr.push("G28");
resultArr.push("G90");
resultArr.push("G1 Z5 F5000");

// original↓/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//resultArr.push("M109 S"+hotend+ "T0");
//resultArr.push("M109 S"+hotendtwo+ "T1");
// original↑
// mod↓
if (headnum==1){
    resultArr.push("M109 S"+hotend+ " T0");
}
if (headnum==2){
    resultArr.push("M109 S"+hotend+ " T0");
    resultArr.push("M109 S"+hotendtwo+ " T1");
}
// mod↑/////////////////////////////////////////////////////////////////////////////////////////////////////////////

resultArr.push("G1 X10 Y10");

resultArr.push("G21"); // set units to millimeters
resultArr.push("G90"); // use absolute coordinates
resultArr.push("M82"); // use absolute distances for extrusion

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
//original↑
//mod↓ 理由こちらもヘッド数に合わせました
if (headnum==1){
    resultArr.push("T0");
    resultArr.push("G92 E0");
    if (retract>0) {
        resultArr.push("; ----Retract Motion (Ready)-----");
        extrude = extrude - retract; //リトラクト
        resultArr.push("G1 E"+extrude+" F1800.00000");
        resultArr.push("; --------------------------");
    }
}

if (headnum==2){
    resultArr.push("T0");
    resultArr.push("G92 E0");
    if (retract>0) {
        resultArr.push("; ----Retract Motion (Ready)-----");
        extrude = extrude - retract; //リトラクト
        resultArr.push("G1 E"+extrude+" F1800.00000");
        resultArr.push("; --------------------------");
    }
    resultArr.push("T1");
    resultArr.push("G92 E0");
    if (retract>0) {
        resultArr.push("; ----Retract Motion (Ready)-----");
        extrudetwo = extrudetwo - retract; //リトラクト
        resultArr.push("G1 E"+extrudetwo +" F1800.00000");
        resultArr.push("; --------------------------");
    }
}
//mod↑/////////////////////////////////////////////////////////////////////////////////////////////////////////////

resultArr.push("M106"); // Fan On
resultArr.push("; M106 Fan On");
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
// mod↓　//////////////////////////////////////////////////////////////////////////////
        x = x/ 2.834645;
        y = y/ 2.834645;

        x = x + shiftx;
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


// 破線の場合
 if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0) {



    resultArr.push("T1");
    resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" F"+h);

    xx=x;
    yy=y;


  if (retract>0) {
  extrudetwo = extrudetwo + retract; //リトラクト
    resultArr.push("; ----Rectract Motion (Start)-----");
  resultArr.push("G1 E"+extrudetwo +" F1800.00000");
    resultArr.push("; --------------------------------");
}
}

// 実線の場合
 else {



    resultArr.push("T0");
    resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" F"+h);

    xx=x;
    yy=y;

  if (retract>0 ) {
  extrude = extrude + retract; //リトラクト
    resultArr.push("; ----Rectract Motion (Start)----");
  resultArr.push("G1 E"+extrude+" F1800.00000");
    resultArr.push("; -------------------------------");
}
}
}


// 最初の点(K=0)の場合'以外'
 else {
     if (extrudenum == 1) {
     //ヘッド数が1つ

     extrude = extrude + e;
      resultArr.push("T0");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h);

    xx=x;
    yy=y;


}




      if (extrudenum == 2) {
    //ヘッド数が2つ
      if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0 ) {
           extrudetwo = extrudetwo + e;


     resultArr.push("T1");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrudetwo+" F"+h);

    xx=x;
    yy=y;
      }  else {
           extrude = extrude + e;

      resultArr.push("T0");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h);

    xx=x;
    yy=y;
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
// mod↓　//////////////////////////////////////////////////////////////////////////////
        x = x/ 2.834645;
        y = y/ 2.834645;

        x = x + shiftx;
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


//ヘッド数が１つ
  if (extrudenum == 1) {


      extrude = extrude + e;
      resultArr.push("T0");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h);

    xx=x;
    yy=y;



      }


//ヘッド数が２つ
      if (extrudenum == 2) {
      if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0 ) {
           extrudetwo = extrudetwo + e;
   resultArr.push("T1");
　
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrudetwo+" F"+h);

    xx=x;
    yy=y;


      }  else {
           extrude = extrude + e;

      resultArr.push("T0");
      resultArr.push("G1 X"+x+" Y"+y+ " Z"+z+" E"+extrude+" F"+h);

    xx=x;
    yy=y;
}

      }

}





////リトラクト

 if (parseFloat(activeDocument.layers[i].pathItems[j].strokeDashes) > 0 ) {

  if (retract>0 && extrudenum ==2) {
	resultArr.push("; ----Rectract Motion (End) -----");
    resultArr.push("T1");

  extrudetwo = extrudetwo - retract; //リトラクト
  resultArr.push("G1 E"+extrudetwo +" F1800.00000");
    resultArr.push("; -----------------------^^^^^---");
}
} else {

  if (retract > 0) {

  resultArr.push("; ----Rectract Motion (End) -----");
  resultArr.push("T0");
  extrude = extrude - retract; //リトラクト
  resultArr.push("G1 E"+extrude+" F1800.00000");
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
resultArr.push("M107");
resultArr.push("M400");
resultArr.push("M104 S0 T0");
resultArr.push("M104 S0 T1");
resultArr.push("M140 S0");
resultArr.push("G1 Y300 F6000");
resultArr.push("T0");
resultArr.push("G28 X");
resultArr.push("G91");
resultArr.push("G1 Z100 F600");
resultArr.push("G90");
resultArr.push("M701");
resultArr.push("M107");
resultArr.push("; M107 Fan Off");
resultArr.push("M84");
resultArr.push("; 定型Footerここまで");
//--


//for Unix OS and Mac OS
saveFile.lineFeed = 'Unix';

var openFlag = saveFile.open("w");
var success;
if(openFlag){

  for(var i=0; i<resultArr.length; i++){
    success = saveFile.writeln(resultArr[i]);
  }

}else{
  alert("failed to open file, don't know why");
}

//var success = saveFile.write(resultArr.join("\n"));
saveFile.close();
saveFile = null;

// 読み込み終了　表示を出す
if(success){
     alert( n + " layers to "+ pObj1.length +" paths are written in G-CODE");
    } else {
}
