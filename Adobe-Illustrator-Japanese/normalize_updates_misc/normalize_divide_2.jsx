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
var dlg = new Window('dialog', '1回の移動の規定長さ'); 

dlg.location = [500,50];
var defaultValueA = 10;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "pieces"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,200,35], 'pieces')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';

   
   dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();


var divide =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);



     alert( n + " layers to  "+ pObj1.length +" paths "+ divide + " divide"); 
     
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
   
///
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
	  //alert(ratio);
	  


///

	   var  yobun = 0; 
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
 
      for (k=0; k<pObj2[j].pathPoints.length-1; k++){
     
          
      var x =  layOri.pathItems[j].pathPoints[k].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[k].anchor[1];

 

      var xx =  layOri.pathItems[j].pathPoints[k+1].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[k+1].anchor[1];

 





var normx = (xx-x)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
var normy = (yy-y)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));

var amari = (Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) - yobun )% ratio; 
var count = parseInt((Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) - yobun - amari)/ ratio); 


var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  x ,   y ];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


if(yobun>0) { 
    



//var newAnchor2= cc.pathPoints.add();

//newAnchor2.anchor = [  x +  normx* yobun , y + normy * yobun ];
//newAnchor2.leftDirection = newAnchor2.anchor;
//newAnchor2.rightDirection = newAnchor2.anchor;
//newAnchor2.pointType = PointType.CORNER;
}





for(w=1; w<count; w++){ 

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  (x + normx* yobun + ratio*normx*w),   (y + normy * yobun + ratio*normy*w)];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;





   

      //activeDocument.layers[i].pathItems[j].strokeWidth = e;


      
}

 
var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  (x + normx* yobun + ratio*normx*(count)),  (y + normy* yobun + ratio*normy*(count))];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


//var newAnchor2= cc.pathPoints.add();

//newAnchor2.anchor = [  (x + normx* yobun  + ratio*normx*(count) + normx*amari),  (y+ normy* yobun   + ratio*normy*(count) + normy*amari)];
//newAnchor2.leftDirection = newAnchor2.anchor;
//newAnchor2.rightDirection = newAnchor2.anchor;
//newAnchor2.pointType = PointType.CORNER;

yobun = ratio - amari; 



}

 if ( pObj2[j].closed){
	 
	  var x =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[1];

 

      var xx =  layOri.pathItems[j].pathPoints[0].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[0].anchor[1];

 





var normx = (xx-x)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
var normy = (yy-y)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));

var amari = (Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) - yobun )% ratio; 
var count = parseInt((Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy)) - yobun - amari)/ ratio); 


var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  x ,   y ];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


if(yobun>0) { 
  




//var newAnchor2= cc.pathPoints.add();

//newAnchor2.anchor = [  x +  normx* yobun , y + normy * yobun ];
//newAnchor2.leftDirection = newAnchor2.anchor;
//newAnchor2.rightDirection = newAnchor2.anchor;
//newAnchor2.pointType = PointType.CORNER;
}





for(w=1; w<count; w++){ 
   

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  (x + normx* yobun + ratio*normx*w),   (y + normy * yobun + ratio*normy*w)];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;





   

      //activeDocument.layers[i].pathItems[j].strokeWidth = e;


      
}

    

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [  (x + normx* yobun + ratio*normx*(count)),  (y + normy* yobun + ratio*normy*(count))];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


//var newAnchor2= cc.pathPoints.add();

//newAnchor2.anchor = [  (x + normx* yobun  + ratio*normx*(count) + normx*amari),  (y+ normy* yobun   + ratio*normy*(count) + normy*amari)];
//newAnchor2.leftDirection = newAnchor2.anchor;
//newAnchor2.rightDirection = newAnchor2.anchor;
//newAnchor2.pointType = PointType.CORNER;

yobun = ratio - amari; 


   
   
}

}



    
}