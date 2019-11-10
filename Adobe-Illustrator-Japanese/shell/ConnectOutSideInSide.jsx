///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// Coast at End = 0の、完全に閉じたパスを用意したとして、さらにその始点と終点を、「レイヤーごと」に完全につなぎ合わせる
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', '1回の移動の規定長さ'); 

dlg.location = [500,50];
var defaultValueA = 2;
var defaultValueB = 1;
var defaultValueC = 0;
var defaultValueD = 0;

     dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');
   (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext',  [15,15,95,35], 0)).helpTip = "steps"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [15,15,95,35], 'steps')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';
	 
	 
	      dlg.alertBtnsPnl1 = dlg.add('group',undefined, 'Threshold:');
   (dlg.alertBtnsPnl1.titleEt = dlg.alertBtnsPnl1.add('edittext', [15,15,95,35], 0)).helpTip = "steps"; 
     dlg.alertBtnsPnl1.titleEt.text = defaultValueB; 
    (dlg.alertBtnsPnl1.titleSt = dlg.alertBtnsPnl1.add('statictext', [15,15,95,35], 'pitch')).helpTip = "..."; 
     dlg.alertBtnsPnl1.orientation='row';

	 
	  
	      dlg.alertBtnsPnl2 = dlg.add('group',undefined, 'Threshold:');
   (dlg.alertBtnsPnl2.titleEt = dlg.alertBtnsPnl1.add('edittext', [15,15,95,35], 0)).helpTip = "DX"; 
     dlg.alertBtnsPnl2.titleEt.text = defaultValueC; 
    (dlg.alertBtnsPnl2.titleSt = dlg.alertBtnsPnl1.add('statictext', [15,15,95,35], 'DX')).helpTip = "..."; 
     dlg.alertBtnsPnl2.orientation='row';
	 
	 
	 
	  
	      dlg.alertBtnsPnl3 = dlg.add('group',undefined, 'Threshold:');
   (dlg.alertBtnsPnl3.titleEt = dlg.alertBtnsPnl1.add('edittext', [15,15,95,35], 0)).helpTip = "DY"; 
     dlg.alertBtnsPnl3.titleEt.text = defaultValueD; 
    (dlg.alertBtnsPnl3.titleSt = dlg.alertBtnsPnl1.add('statictext', [15,15,95,35], 'DY')).helpTip = "..."; 
     dlg.alertBtnsPnl3.orientation='row';
   
   dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,85,225,130], 'OK', {name:'ok'}); 


    dlg.show();


var step =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);
var pitch =  parseFloat(   dlg.alertBtnsPnl1.titleEt.text);

var dx = parseFloat(   dlg.alertBtnsPnl2.titleEt.text);

var dy = parseFloat(   dlg.alertBtnsPnl3.titleEt.text);


//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx



     alert( n + " layers to  "+ pObj1.length +" paths ");
	 
	
	  
	  
	 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

for (var i=0;i<app.activeDocument.layers.length;i=i+1){
	    var cc = app.activeDocument.layers[i].pathItems.add();
	  cc.filled = false;
      cc.stroked = true;
	  var color = new RGBColor();
      color.red = 255; 
      color.green = 0; 
      color.blue = 0; 
      cc.strokeColor = color; 

		  for (var j=0;j<app.activeDocument.layers[i].pathItems[1].pathPoints.length;j=j+pitch) {
	var coordinateText1 = app.activeDocument.layers[i].textFrames.add();
    coordinateText1.contents = j;
	coordinateText1.position= [app.activeDocument.layers[i].pathItems[1].pathPoints[j].anchor[0], app.activeDocument.layers[i].pathItems[1].pathPoints[j].anchor[1]]; 
    coordinateText1.textRange.characterAttributes.size= 15;

		  }
		  
		  for (var j=0;j<app.activeDocument.layers[i].pathItems[2].pathPoints.length;j=j+pitch) {
	var coordinateText1 = app.activeDocument.layers[i].textFrames.add();
    coordinateText1.contents = j;
	coordinateText1.position=  [app.activeDocument.layers[i].pathItems[2].pathPoints[j].anchor[0], app.activeDocument.layers[i].pathItems[2].pathPoints[j].anchor[1]]; 
    coordinateText1.textRange.characterAttributes.size= 10;

		  }
		  
		  
  
	  for(var k=0; k<app.activeDocument.layers[i].pathItems[1].pathPoints.length; k=k+pitch){ 
	  
	  
	    var newAnchor1= cc.pathPoints.add();

      newAnchor1.anchor = [ app.activeDocument.layers[i].pathItems[1].pathPoints[k].anchor[0], app.activeDocument.layers[i].pathItems[1].pathPoints[k].anchor[1] ];
      newAnchor1.leftDirection =  [newAnchor1.anchor[0] -dx, newAnchor1.anchor[1]+ dy]
      newAnchor1.rightDirection = [newAnchor1.anchor[0] +dx, newAnchor1.anchor[1]+ dy]
      newAnchor1.pointType = PointType.SMOOTH;
	
      var newAnchor2= cc.pathPoints.add();
	  
	  var n= k+step;
	
	  if( n>app.activeDocument.layers[i].pathItems[1].pathPoints.length-1) { n=n-app.activeDocument.layers[i].pathItems[1].pathPoints.length; }

      newAnchor2.anchor = [ app.activeDocument.layers[i].pathItems[2].pathPoints[n].anchor[0], app.activeDocument.layers[i].pathItems[2].pathPoints[n].anchor[1] ];
      newAnchor2.leftDirection = [newAnchor2.anchor[0]  -dx, newAnchor2.anchor[1]+dy]
      newAnchor2.rightDirection = [newAnchor2.anchor[0] +dx, newAnchor2.anchor[1]+dy]
      newAnchor2.pointType = PointType.SMOOTH;
	  
	
	  }
	  
	    var newAnchor2= cc.pathPoints.add();
	     newAnchor2.anchor = [ app.activeDocument.layers[i].pathItems[1].pathPoints[0].anchor[0], app.activeDocument.layers[i].pathItems[1].pathPoints[0].anchor[1] ];
      newAnchor2.leftDirection = [newAnchor2.anchor[0]  -dx, newAnchor2.anchor[1]+dy]	  ;
      newAnchor2.rightDirection = [newAnchor2.anchor[0] +dx, newAnchor2.anchor[1]+dy]
      newAnchor2.pointType = PointType.SMOOTH;
	  
	  
}
	


