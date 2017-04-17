///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// Dinamic "E" set PLUGIN for Adobe Illustrator
// (c) Hiroya Tanaka, Social Fabrication Lab, Keio University, Japan, 2016
// http://fab.sfc.keio.ac.jp/gcode_export.jsx 
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 倍数
var ratio = 0.5;




//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', 'Ratio (X-Y distance to E)'); 

dlg.location = [500,50];
var defaultValueA = 0.5;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "magnitude"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,200,35], 'E parameter')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';

   
   dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();


var ratio =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);



     alert( n + " layers to  "+ pObj1.length +" paths "); 
     
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ad = activeDocument;





for(i = n-1; i>=0; i--){



var layOri =  ad.layers[n-1];
  layOri.visible = false;
    var pObj2 = layOri.pathItems;
 var layObj = activeDocument.layers.add();
 layObj.name =   layOri.name;
// app.activeDocument.activeLayer = layObj;
var bottomLayer = layOri;
//layObj.move(bottomLayer,ElementPlacement.PLACEAFTER);

   for (j=pObj2.length-1; j>-1; j--){
   


      for (k=0; k<pObj2[j].pathPoints.length-1; k++){
     
          
      var x =  layOri.pathItems[j].pathPoints[k].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[k].anchor[1];

 // x = x/ 2.834645;
 // y = y/ 2.834645;

      var xx =  layOri.pathItems[j].pathPoints[k+1].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[k+1].anchor[1];

   // xx = xx/ 2.834645;
   //   yy = yy/ 2.834645;



      var cc = layObj.pathItems.add();
 var dash = 0;
if (layOri.pathItems[j].strokeDashes>0){
  dash = layObj.pathItems[j].strokeDashes;
  }

cc.filled = false;
cc.stroked = true;

if (dash>0){
cc.strokeDashes = dash;
}


var e = ratio  * Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
cc.strokeWidth = e;

 var color = new RGBColor();
 color.red =255; 
 color.green =0;
 color.blue =0;
cc.strokeColor = color; 

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [x,y];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


var newAnchor2= cc.pathPoints.add();

newAnchor2.anchor = [xx,yy];
newAnchor2.leftDirection = newAnchor2.anchor;
newAnchor2.rightDirection = newAnchor2.anchor;
newAnchor2.pointType = PointType.CORNER;



   

      //activeDocument.layers[i].pathItems[j].strokeWidth = e;


      
}


}
}



    
