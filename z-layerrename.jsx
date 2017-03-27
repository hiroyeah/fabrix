///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// Dinamic "E" set PLUGIN for Adobe Illustrator
// (c) Hiroya Tanaka, Social Fabrication Lab, Keio University, Japan, 2016
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// zピッチ
var ratio = 0.2;
var base = 0.2;




//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', 'Z Pitch (mm)?'); 

dlg.location = [500,50];
var defaultValueA = ratio;
var defaultValueB = base;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "magnitude"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,200,35], 'E parameter')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';
	 
	  dlg.alertBtnsPnl2 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl2.titleEt = dlg.alertBtnsPnl2.add('edittext', [100,15,160,35], 0)).helpTip = "magnitude"; 
     dlg.alertBtnsPnl2.titleEt.text = defaultValueB; 
    (dlg.alertBtnsPnl2.titleSt = dlg.alertBtnsPnl2.add('statictext', [10,15,200,35], 'Base ')).helpTip = "..."; 
     dlg.alertBtnsPnl2.orientation='row';
	 

   
   dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();


var ratio =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);
var base =  parseFloat(   dlg.alertBtnsPnl2.titleEt.text);


     alert( n + " layers to  "+ pObj1.length +" paths "); 
     
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ad = activeDocument;





for(i = n-1; i>=0; i--){
if(ad.layers[i].visible == false) continue; 
ad.layers[i].name = base;
base = base + ratio;

}




    
