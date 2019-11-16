///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// Lineを一定の長さにすべて分割
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// 倍数





//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', '分割数'); 

dlg.location = [500,50];
var defaultValueA = 50;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "edges"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,200,35], 'edges')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';

   
   dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();


var divide =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);



     alert( n + " layers to  "+ pObj1.length +" paths "+ divide+ " divide"); 
     
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
   
    var totallength=0; 

      for (k=0; k<pObj2[j].pathPoints.length-1; k++){
     
          
      var x =  layOri.pathItems[j].pathPoints[k].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[k].anchor[1];



      var xx =  layOri.pathItems[j].pathPoints[k+1].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[k+1].anchor[1];


      totallength = totallength + Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));

	  }
	  
	          
      var x =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[1];


      var xx =  layOri.pathItems[j].pathPoints[0].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[0].anchor[1];


      totallength = totallength + Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));

	  
	  ratio = totallength/divide; 
	  alert(ratio);
	  
	  var x =  layOri.pathItems[j].pathPoints[0].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[0].anchor[1];
	  
      for (k=0; k<pObj2[j].pathPoints.length-2; k++){
     
          




      var xx =  layOri.pathItems[j].pathPoints[k+1].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[k+1].anchor[1];


      var xxx =  layOri.pathItems[j].pathPoints[k+2].anchor[0]; 
      var yyy =  layOri.pathItems[j].pathPoints[k+2].anchor[1];

 


var normx = (xx-x)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
var normy = (yy-y)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));

var amari = Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) % ratio; 
var count = parseInt((Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) - amari)/ ratio); 

var normxx = (xxx-xx)/Math.sqrt((xx-xxx)*(xx-xxx)+ (yy-yyy)*(yy-yyy));
var normyy = (yyy-yy)/Math.sqrt((xx-xxx)*(xx-xxx)+ (yy-yyy)*(yy-yyy));



for(w=0; w<count; w++){ 
      var cc = layObj.pathItems.add();
	  cc.filled = false;
      cc.stroked = true;


//var e = ratio  * Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
//cc.strokeWidth = e;

 var color = new RGBColor();
 color.red = Math.random()* 255; 
 color.green = Math.random()* 255; 
 color.blue = Math.random()* 255; 
 cc.strokeColor = color; 

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [ (x + ratio*normx*w),  (y + ratio*normy*w)];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


var newAnchor2= cc.pathPoints.add();

newAnchor2.anchor = [  (x + ratio*normx*(w+1)),   (y + ratio*normy*(w+1))];
newAnchor2.leftDirection = newAnchor2.anchor;
newAnchor2.rightDirection = newAnchor2.anchor;
newAnchor2.pointType = PointType.CORNER;



   

      //activeDocument.layers[i].pathItems[j].strokeWidth = e;


      
}

      var cc = layObj.pathItems.add();
 var color = new RGBColor();
 color.red = Math.random()* 0; 
 color.green = Math.random()* 0; 
 color.blue = Math.random()* 0; 
 cc.strokeColor = color; 

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  (x + ratio*normx*(count)),   (y + ratio*normy*(count))];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


var newAnchor2= cc.pathPoints.add();

newAnchor2.anchor = [  (xx + ratio*normxx - normxx*amari),  (yy + ratio*normyy - normyy*amari)];
newAnchor2.leftDirection = newAnchor2.anchor;
newAnchor2.rightDirection = newAnchor2.anchor;
newAnchor2.pointType = PointType.CORNER;

x =  (xx + ratio*normxx - normxx*amari);
y =  (yy + ratio*normyy - normyy*amari);

}

  
   

      // the last point to point 0



      

   
   
}


}
   