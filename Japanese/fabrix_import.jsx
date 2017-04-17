///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Fabrix Script
// G-CODE-IMPORT PLUGIN for Adobe Illustrator
// (c) Hiroya Tanaka, Social Fabrication Lab, Keio University, Japan, 2016 - 2017
// 
// Project Official Website:  http://www.fabrix.design/ 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////










//初期設定
//ライン配列
var lines = [];
//レイヤー配列
var layers = [];
// 描画モード (&デフォルト)
var mode = 1;
var vis = 2;
var extrude = 1;
var showtext = 2;


var Toolhead = 0;

// CMYKカラーのセッティング (実際には使わない)
function setCMYKColor(c,m,y,k){
var CMYK = new CMYKColor();
CMYK.cyan = c;
CMYK.magenta = m;
CMYK.yellow = y;
CMYK.black = k;
return CMYK;
}

//モード変更ボタンの挙動
function setTextS() {
mode = 1;
    }

function setTextA() {
mode = 2;
    }

function setTextW() {
mode = 3;
    }
function setTextB() {
vis = 1;
    }

function setTextC() {
    vis= 2;
    }
function setTextD() {
    vis= 3;
    }
function setTextO() {
extrude = 1;
    }
function setTextP() {
extrude = 2;
    }
function setTextQ() {
extrude = 3;
    }
function setTextOO() {
showtext = 1;
    }
function setTextPP() {
showtext = 2;
    }
function setTextQQ() {
showtext = 3;
    }
//ファイルの中身を展開
var embedder = (function () {
var klass = function (file, mapping) {
this.file = file;
this.inputNewLine = String.fromCharCode(10);
this.lines = [];
this.elements = [];
};


// ファイルオープンのダイアログ
klass.prototype.readGCODEFile = function () {
var file = new File(this.file);
if (!file.open('r', '', '')) return;

alert(file+" を読み込みます");

var win = new Window("palette","ファイル解析中 (処理に時間がかかる場合があります)");
var maxT = 100;
win.myProgressbar = win.add("Progressbar",[10,10,300,20],0,maxT);
win.show();
redraw();

file.open("r"); // 読み込みモード

while(!file.eof) {
  lines.push(file.readln());
}

file.close();
win.close();




   
// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', '原点移動'); 
dlg.location = [500,50];
var defaultValue1 = 0;
var defaultValue2 = 0;
var fontsizee = 1;

     dlg.alertBtnsPnl2 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl2.titleEt = dlg.alertBtnsPnl2.add('edittext', [100,15,160,35], 0)).helpTip = "X"; 
     dlg.alertBtnsPnl2.titleEt.text = defaultValue1; 
    (dlg.alertBtnsPnl2.titleSt = dlg.alertBtnsPnl2.add('statictext', [10,15,200,35], 'シフト座標値  (x)')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl2.orientation='row';

     dlg.alertBtnsPnl3 = dlg.add('group',undefined, 'Threshold:');
    (dlg.alertBtnsPnl3.titleEt = dlg.alertBtnsPnl3.add('edittext', [100,45,160,65], 0)).helpTip = "Y"; 
     dlg.alertBtnsPnl3.titleEt.text = defaultValue2; 
    (dlg.alertBtnsPnl3.titleSt = dlg.alertBtnsPnl3.add('statictext', [10,45,200,65], 'シフト座標値 (y)')).helpTip = "Pixels."; 
     dlg.alertBtnsPnl3.orientation='row';

    dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
   
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 

///

	(dlg.dimsPnl = dlg.add('panel', undefined, 'GコードからIllstratorエレメントへの変換')).helpTip = "GコードからIllstratorエレメントへの変換"; 
	dlg.dimsPnl.orientation='row';
	(dlg.dimsPnl.selectS = dlg.dimsPnl.add('radiobutton', [15,15,150,35], 'アンカーパス' )).helpTip = ""; 
	(dlg.dimsPnl.selectA = dlg.dimsPnl.add('radiobutton', [15,40,150,60], '色・太さ付きライン' )).helpTip = "";
	(dlg.dimsPnl.selectW = dlg.dimsPnl.add('radiobutton', [15,65,150,85], '点群' )).helpTip = "";

	dlg.dimsPnl.selectS.value = true; 

	dlg.dimsPnl.selectS.onClick= setTextS;
	dlg.dimsPnl.selectA.onClick= setTextA;
	dlg.dimsPnl.selectW.onClick= setTextW;
    
    ////
	(dlg.dimsPnl2 = dlg.add('panel', undefined, '描画プロセス')).helpTip = "描画と視認プロセス"; 
	dlg.dimsPnl2.orientation='row';
	(dlg.dimsPnl2.selectB = dlg.dimsPnl2.add('radiobutton', [45,15,150,35], 'ラインごと (Slow)' )).helpTip = ""; 
	(dlg.dimsPnl2.selectC = dlg.dimsPnl2.add('radiobutton', [45,40,150,60], '結果のみ (Fast)' )).helpTip = "";
	(dlg.dimsPnl2.selectD = dlg.dimsPnl2.add('radiobutton', [45,65,150,85], 'レイヤーごと (Mid)' )).helpTip = "";

	dlg.dimsPnl2.selectC.value = true; 

	dlg.dimsPnl2.selectB.onClick= setTextB;
	dlg.dimsPnl2.selectC.onClick= setTextC;
       dlg.dimsPnl2.selectD.onClick= setTextD;
    
   ////
        
	(dlg.dimsPnl3 = dlg.add('panel', undefined, '押し出しの変数')).helpTip = "押し出しの変数"; 
	dlg.dimsPnl3.orientation='row';
	(dlg.dimsPnl3.selectO = dlg.dimsPnl3.add('radiobutton', [45,115,150,135], 'E' )).helpTip = ""; 
	(dlg.dimsPnl3.selectP = dlg.dimsPnl3.add('radiobutton', [45,140,150,160], 'A/B' )).helpTip = "";
	(dlg.dimsPnl3.selectQ = dlg.dimsPnl3.add('radiobutton', [45,175,150,185], '' )).helpTip = "";

	dlg.dimsPnl3.selectO.value = true; 

	dlg.dimsPnl3.selectO.onClick= setTextO;
	dlg.dimsPnl3.selectP.onClick= setTextP;
    dlg.dimsPnl3.selectQ.onClick= setTextQ;
    
   //////

   
	(dlg.dimsPnl4 = dlg.add('panel', undefined, '座標値のテキスト表示')).helpTip = "座標値のテキスト表示"; 
	dlg.dimsPnl4.orientation='row';
	(dlg.dimsPnl4.selectOO = dlg.dimsPnl4.add('radiobutton', [45,215,150,235], 'あり' )).helpTip = ""; 
	(dlg.dimsPnl4.selectPP = dlg.dimsPnl4.add('radiobutton', [45,240,150,260], 'なし' )).helpTip = "";
	(dlg.dimsPnl4.selectQQ = dlg.dimsPnl4.add('radiobutton', [45,275,150,285], '' )).helpTip = "";

	dlg.dimsPnl4.selectPP.value = true; 

	dlg.dimsPnl4.selectOO.onClick= setTextOO;
	dlg.dimsPnl4.selectPP.onClick= setTextPP;
        dlg.dimsPnl4.selectQQ.onClick= setTextQQ;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'テキストフォントサイズ');
    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "テキストフォントサイズ"; 
     dlg.alertBtnsPnl0.titleEt.text = fontsizee; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,200,35], 'テキストフォントサイズ')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';



    dlg.show();

var fontsizee =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);

// 新しく画面を作ることはしない（座標系が変わるため)
var shiftx =  parseFloat(   dlg.alertBtnsPnl2.titleEt.text);
var shifty =  parseFloat(   dlg.alertBtnsPnl3.titleEt.text);
//var doc = documents.add(DocumentColorSpace.RGB, 500, 500);
var doc = activeDocument;


// １行ずつ順番に読み込んでいく
// (Zをレイヤーに分割する部分をここに実装すべし)

var sxxx = 0;
var syyy = 0;
var szzz = 0;
var exxx = 0;
var eyyy = 0;
var ezzz = 0;
var eee =0;
var fff =0;
var linenum = 0;
var layernum = 0;
var xon = 0; 
var yon = 0;
var zon = 0;
var eon = 0;
var fon = 0;
var con = 0;
var pon = 0;

alert(lines.length+"  行の  G-Codeを読み込みます (描画には時間がかかる場合があります)");

//３つのパターンがある
// G1 Z334 F3000 ; lift nozzle   単なるノズル操作のz
// G1 E-0.5000 F3000 ; ノズルのリトラクトのための試験的なe
// G1 Z0.200 F1200 このあとに本番のxyが続く（ただしzはそこにはない)

con =0; //そのレイヤーは単なるノズル動作か、あるいは樹脂出力の中身があるか
pon =0; //パスを書いたかどうか



//---------ここから本体-----------
//初期状態
sxxx = 0;
syyy = 0;
szzz = 0;
eee =0;
fff =0;

ksxxx = 0;
ksyyy = 0;
kszzz = 0;
keee =0;
kfff =0;


var coordinateLine1;
var coordinateText1;
var newAnchor1;




var win = new Window("palette","進行状況");
var maxT = 100;
win.myProgressbar = win.add("Progressbar",[10,10,300,20],0,maxT);
win.show();


for (var i = 0; i < lines.length-1; i++) {


    win.myProgressbar.value = (100*(i/(lines.length-1)));
    //win.name = (100*(i/(lines.length-1)));
    win.update();


if (!lines[i]) continue; // 空行は除く




// 現在の行を分析
elementsa = [];
elementsa = lines[i].split(' ');





/////////////////////////////////////////


if (elementsa[0] == 'T0' ) { 
Toolhead = 0;
}

if (elementsa[0] == 'T1' ) { 
Toolhead = 1;
}



if (elementsa[0] == 'G1' ) { 
xon =0;
yon =0;
zon =0;
eon =0;
fon =0;
//まずその行のすべてコマンドを読み込む    
for (var j=0; j<elementsa.length; j++){ 
    if (elementsa[j].substring(0,1) == 'X') { ksxxx = sxxx; sxxx =  shiftx + parseFloat(elementsa[j].substring(1, elementsa[j].length)); xon = 1;}
    if (elementsa[j].substring(0,1) == 'Y') { ksyyy = syyy; syyy =  shifty + parseFloat(elementsa[j].substring(1, elementsa[j].length)); yon = 1;}
    if (elementsa[j].substring(0,1) == 'Z') { kszzz = szzz; szzz =   parseFloat(elementsa[j].substring(1, elementsa[j].length)); zon = 1;}
    if (elementsa[j].substring(0,1) == 'E' && extrude ==1) { eee =  parseFloat(elementsa[j].substring(1, elementsa[j].length)); eon=1;}
    if (elementsa[j].substring(0,1) == 'A' && extrude ==2 ) { eee =  parseFloat(elementsa[j].substring(1, elementsa[j].length)); eon=1;}
    if (elementsa[j].substring(0,1) == 'F') { fff =  parseFloat(elementsa[j].substring(1, elementsa[j].length)); fon=1;}
}

//その位置をキープ





//場合分け1: 
//zが単独で出てきたらレイヤーを生成

if (zon == 1 && xon == 0 && yon == 0 && !isNaN(szzz)){

// ただし前に作業していたzレイヤーに何も中身がなかったら新しいのを作る前にそれをinvisibleにしておく
//if (con == 0 && layernum > 0) {
//layers[layernum-1].visible = false; 
//}
//

layers[layernum] = activeDocument.layers.add();
layers[layernum].name = szzz;
layernum++;
con = 0; //あとでこのレイヤーに中身ができるかどうかを調べる（最初は空なので0)
pon = 0; //パスアイテムまだなし
}


//場合分け2: 
// xとyが出てきたら
/////////////////////////////////////////
if (xon == 1 || yon == 1) {

con = 1; //このzレイヤーには中身があったことをまずチェック

if (showtext == 1){
// 数値をテキストで添える
var coordinateText1 = doc.activeLayer.textFrames.add();
coordinateText1.contents ="";
if (xon==1){
coordinateText1.contents = coordinateText1.contents + " x: "+sxxx;
}
if (yon==1){
coordinateText1.contents = coordinateText1.contents + " y: "+syyy;
}
if (zon==1){
coordinateText1.contents = coordinateText1.contents + " z: "+szzz;
}
if (eon==1){
coordinateText1.contents = coordinateText1.contents + " e: "+eee;
}
if (fon==1){
coordinateText1.contents = coordinateText1.contents + " f: "+fff;
}

coordinateText1.position=[sxxx,syyy+10];
coordinateText1.textRange.characterAttributes.size= fontsizee;
var texColor = new RGBColor();
texColor.red   = 255;
texColor.green = 140;
texColor.blue  = 140;
coordinateText1.textRange.characterAttributes.fillColor = texColor;
coordinateText1.characters.stroked = true;
coordinateText1.characters.strokeColor = texColor;
coordinateText1.fillColor = texColor;
}

if ( eon ==0) {
//樹脂出力がなく、かつまだパスアイテムがなかった場合、新しいパスアイテムをつくり、
//最初のアンカーを置く
if (mode == 1){
var coordinateLine1 = doc.activeLayer.pathItems.add();
coordinateLine1.stroked = true;
coordinateLine1.strokeWidth =0.1; 
var lineColor = new RGBColor();
lineColor.red   = 100;
lineColor.green = 100;
lineColor.blue  = 100;
coordinateLine1.strokeColor = lineColor;
coordinateLine1.filled = false;

if (Toolhead>0){
 coordinateLine1.strokeDashes = [0.1,0.1];
 var lineColor = new RGBColor();
lineColor.red   = 100;
lineColor.green = 0;
lineColor.blue  = 0;
coordinateLine1.strokeColor = lineColor;
}




newAnchor1= coordinateLine1.pathPoints.add();

newAnchor1.anchor = [sxxx,syyy];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;
newAnchor1.strokeWidth = eee;
newAnchor1.opacity = fff/100;


if (Toolhead>0){
newAnchor1.strokeDashes = [1,1];
}


pon = 1; //パスアイテムをつくったことの記録
}

} 

if (eon == 1) {
/////////////////////////////////////////
//樹脂出力があれば、アンカーを追加していく

if (pon ==0) {
//まだパスアイテムつくってなければここでつくる
if (mode == 1){
coordinateLine1 = doc.activeLayer.pathItems.add();
coordinateLine1.stroked = true;
coordinateLine1.strokeWidth =0.1; 
var lineColor = new RGBColor();
lineColor.red   = 100;
lineColor.green = 100;
lineColor.blue  = 100;
coordinateLine1.strokeColor = lineColor;
coordinateLine1.filled = false;
if (Toolhead>0){
 coordinateLine1.strokeDashes = [0.1,0.1];
 var lineColor = new RGBColor();
lineColor.red   = 100;
lineColor.green = 0;
lineColor.blue  = 0;
coordinateLine1.strokeColor = lineColor;
}




newAnchor1= coordinateLine1.pathPoints.add();

newAnchor1.anchor = [ksxxx,ksyyy];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;
newAnchor1.strokeWidth = eee;
newAnchor1.opacity = fff/100;

newAnchor1= coordinateLine1.pathPoints.add();

newAnchor1.anchor = [sxxx,syyy];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;
newAnchor1.strokeWidth = eee;
newAnchor1.opacity = fff/100;

pon = 1; //パスアイテムをつくったことの記録

}
}


/////////////////////////////////////////
// アンカー方式の場合
if (mode == 1){
newAnchor1= coordinateLine1.pathPoints.add();
newAnchor1.anchor = [sxxx,syyy];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;
newAnchor1.strokeWidth = eee;
newAnchor1.opacity = fff/100;
}
/////////////////////////////////////////


/////////////////////////////////////////
// ライン方式の場合
if (mode == 2){ 

  
    lines[linenum] = doc.activeLayer.pathItems.add();
    lines[linenum].setEntirePath([[ksxxx,ksyyy],[sxxx,syyy]]);
    lines[linenum].filled = false;
    lines[linenum].stroked = true; 
    lines[linenum].strokeWidth = eee; 
    lines[linenum].strokeColor = setCMYKColor(0,0,0,fff/100);
if (Toolhead>0){
  lines[linenum].strokeDashes = [0.1,0.1];
  lines[linenum].strokeColor = setCMYKColor(0,255,0,fff/100);
}




    linenum++;

 }
/////////////////////////////////////////


/////////////////////////////////////////
// 点群の場合楕円を描く
if (mode == 3 ){
 var newPoint = activeDocument.pathItems.ellipse(syyy,sxxx,0.1,0.1,false,false);
 var color = new RGBColor();
 color.red =255; 
 color.green =0;
 color.blue =0;
 
  newPoint.fillColor = color;
  newPoint.filled =true;
  newPoint.strokeColor = color;
  newPoint.stroked =true; 
  newPoint.strokeWidth = 2;
  }
/////////////////////////////////////////

if (vis == 3) { redraw(); }


}//e-on 樹脂あった場合
/////////////////////////////////////////
}//x-y
/////////////////////////////////////////

if (vis == 1){redraw();}

}
// レイヤー生成おわり
/////////////////////////////////////////

}//G1終わり




// 終了
win.close();
alert(lines.length+"  行の 読み込みと描画が完了しました");

};


//ファイル読み込み補完

klass.prototype.embedText = function () {
this.readGCODEFile();


}

return klass;
}



)();



// ダイアログ
(function () {
var file = File.openDialog("gcodeファイルを選択してください");
if (!file) return;
var e = new embedder(file);
e.embedText();
})();