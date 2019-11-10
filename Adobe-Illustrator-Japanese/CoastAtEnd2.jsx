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
var dlg = new Window('dialog', 'Coast At End 改'); 

dlg.location = [500,50];
var defaultValueA = 10;
var defaultValueB = 45;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Threshold:');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "mm"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,200,35], 'コースト*吐出なし航行*する長さ (mm)')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';

 dlg.alertBtnsPnl1 = dlg.add('group',undefined, 'Threshold:');
  (dlg.alertBtnsPnl1.titleEt = dlg.alertBtnsPnl1.add('edittext', [100,15,160,35], 0)).helpTip = "angle"; 
     dlg.alertBtnsPnl1.titleEt.text = defaultValueB; 
    (dlg.alertBtnsPnl1.titleSt = dlg.alertBtnsPnl1.add('statictext', [10,15,200,35], 'コーストを発生させる最小角度 (degree)')).helpTip = "..."; 
     dlg.alertBtnsPnl1.orientation='row';
	 
	 
    dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();


var ratio =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);
var threshold = parseFloat(   dlg.alertBtnsPnl1.titleEt.text);


     alert( n + " layers to  "+ pObj1.length +" paths "+ ratio + " ratio"); 
     
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ad = activeDocument;





for(i = n-1; i>=0; i--){



var layOri =  ad.layers[n-1];
  layOri.visible = false;  //現在のレイヤーを非表示
  
  
 var pObj2 = layOri.pathItems;
 var layObj = activeDocument.layers.add();
 layObj.name =   layOri.name;
 // app.activeDocument.activeLayer = layObj;
 var bottomLayer = layOri;
 //layObj.move(bottomLayer,ElementPlacement.PLACEAFTER);

 

 
   for (j=pObj2.length-1; j>-1; j--){
   


      for (k=0; k<pObj2[j].pathPoints.length-2; k++){
    
          
      var x =  layOri.pathItems[j].pathPoints[k].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[k].anchor[1];

      x = x/ 2.834645;
      y = y/ 2.834645;

      var xx =  layOri.pathItems[j].pathPoints[k+1].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[k+1].anchor[1];

      xx = xx/ 2.834645;
      yy = yy/ 2.834645;

　　　　　 var xxx =  layOri.pathItems[j].pathPoints[k+2].anchor[0]; 
      var yyy =  layOri.pathItems[j].pathPoints[k+2].anchor[1];

      xxx = xxx/ 2.834645;
      yyy = yyy/ 2.834645;

	  
	  var normx = (xx-x)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
      var normy = (yy-y)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));


      var ax = xx-x; 
	  var ay = yy-y; 
	  var bx = xxx-xx; 
	  var by = yyy-yy; 
	  
	  var cosdeg= (ax*bx + ay*by)/(Math.sqrt(ax*ax+ay*ay)*Math.sqrt(bx*bx+by*by));
	  
	 // alert(	 Math.abs(cosdeg) + " ---- " + Math.cos(threshold) );  
	  
	  // Coastをやる条件範囲
	  if (cosdeg>Math.cos(threshold)){
	//alert(	 Math.abs(cosdeg) + " ---- " + Math.cos(threshold) + " = No ");  
		 
	  // 何も変えない
      var cc = layObj.pathItems.add();
	  cc.filled = false;
      cc.stroked = true;
	  var color = new RGBColor();
      color.red = 255; 
      color.green = 0; 
      color.blue = 0; 
      cc.strokeColor = color; 
	  
	  
      var newAnchor1= cc.pathPoints.add();

      newAnchor1.anchor = [ 2.834645 * x,  2.834645 * y];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;


      var newAnchor2= cc.pathPoints.add();

      newAnchor2.anchor = [ 2.834645 * xx ,  2.834645 * yy ];
      newAnchor2.leftDirection = newAnchor2.anchor;
      newAnchor2.rightDirection = newAnchor2.anchor;
      newAnchor2.pointType = PointType.CORNER;


	  } else {
	
	//alert(	 Math.abs(cosdeg) + " ---- " + Math.cos(threshold) + " = Go ");  
	if( Math.abs(ratio*normx) < Math.abs(2.834645 *(xx-x)) && Math.abs(ratio*normy) < Math.abs(2.834645 *(yy-y))) {
	
      // Coast at Endをやる
	  
      var cc = layObj.pathItems.add();
	  cc.filled = false;
      cc.stroked = true;
	  var color = new RGBColor();
      color.red = 255; 
      color.green = 0; 
      color.blue = 0; 
      cc.strokeColor = color; 
  
     var newAnchor1= cc.pathPoints.add();

      newAnchor1.anchor = [ 2.834645 * x,  2.834645 * y];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;


      var newAnchor2= cc.pathPoints.add();

      newAnchor2.anchor = [ 2.834645 * xx - ratio*normx,  2.834645 * yy - ratio*normy];
      newAnchor2.leftDirection = newAnchor2.anchor;
      newAnchor2.rightDirection = newAnchor2.anchor;
      newAnchor2.pointType = PointType.CORNER;
	  
	  var dd = layObj.pathItems.add();
	  dd.filled = false;
      dd.stroked = true;
	  dd.strokeDashes = [ratio/4,ratio/4];
	  var color = new RGBColor();
      color.red = 0; 
      color.green = 255; 
      color.blue = 0; 
      dd.strokeColor = color; 
  
  /*
     var newAnchor1= dd.pathPoints.add();

      newAnchor1.anchor = [ 2.834645 * xx - ratio*normx,  2.834645 * yy - ratio*normy];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;


      var newAnchor2= dd.pathPoints.add();

      newAnchor2.anchor = [ 2.834645 * xx,  2.834645 * yy];
      newAnchor2.leftDirection = newAnchor2.anchor;
      newAnchor2.rightDirection = newAnchor2.anchor;
      newAnchor2.pointType = PointType.CORNER;
  */
	  }
	  }
      }



  if ( pObj2[j].closed){
	        
      var x =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[0]; 
      var y =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[1];

      x = x/ 2.834645;
     y = y/ 2.834645;

      var xx =  layOri.pathItems[j].pathPoints[0].anchor[0]; 
      var yy =  layOri.pathItems[j].pathPoints[0].anchor[1];

    xx = xx/ 2.834645;
    yy = yy/ 2.834645;

      var xxx =  layOri.pathItems[j].pathPoints[1].anchor[0]; 
      var yyy =  layOri.pathItems[j].pathPoints[1].anchor[1];

    xxx = xxx/ 2.834645;
    yyy = yyy/ 2.834645;


  var normx = (xx-x)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));
      var normy = (yy-y)/Math.sqrt((x-xx)*(x-xx)+ (y-yy)*(y-yy));


      var ax = xx-x; 
	  var ay = yy-y; 
	  var bx = xxx-xx; 
	  var by = yyy-yy; 
	  
	  var cosdeg= (ax*bx + ay*by)/(Math.sqrt(ax*ax+ay*ay)*Math.sqrt(bx*bx+by*by));
	  
	 // alert(	 Math.abs(cosdeg) + " ---- " + Math.cos(threshold) + " = No ");  
	  
	  // Coastをやる条件範囲
	  if (cosdeg>Math.cos(threshold)) {
		  
	  // 何も変えない
      var cc = layObj.pathItems.add();
	  cc.filled = false;
      cc.stroked = true;
	  var color = new RGBColor();
      color.red = 255; 
      color.green = 0; 
      color.blue = 0; 
      cc.strokeColor = color; 
	  
	  
      var newAnchor1= cc.pathPoints.add();

      newAnchor1.anchor = [ 2.834645 * x,  2.834645 * y];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;


      var newAnchor2= cc.pathPoints.add();

      newAnchor2.anchor = [ 2.834645 * xx ,  2.834645 * yy ];
      newAnchor2.leftDirection = newAnchor2.anchor;
      newAnchor2.rightDirection = newAnchor2.anchor;
      newAnchor2.pointType = PointType.CORNER;


	  } else {
	
	
	  if( Math.abs(ratio*normx) < Math.abs((2.834645 *(xx-x)) && Math.abs(ratio*normy) < Math.abs(2.834645 *(yy-y)))) {
      // Coast at Endをやる
	  
	  //	  alert(	 Math.abs(cosdeg) + " ---- " + Math.cos(threshold) + " = Go "); 
	  
      var cc = layObj.pathItems.add();
	  cc.filled = false;
      cc.stroked = true;
	  var color = new RGBColor();
      color.red = 255; 
      color.green = 0; 
      color.blue = 0; 
      cc.strokeColor = color; 
  
     var newAnchor1= cc.pathPoints.add();

      newAnchor1.anchor = [ 2.834645 * x,  2.834645 * y];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;


      var newAnchor2= cc.pathPoints.add();

      newAnchor2.anchor = [ 2.834645 * xx - ratio*normx,  2.834645 * yy - ratio*normy];
      newAnchor2.leftDirection = newAnchor2.anchor;
      newAnchor2.rightDirection = newAnchor2.anchor;
      newAnchor2.pointType = PointType.CORNER;
	  
	  var dd = layObj.pathItems.add();
	  dd.filled = false;
      dd.stroked = true;
	    dd.strokeDashes = [ratio/4,ratio/4];
	  var color = new RGBColor();
      color.red = 0; 
      color.green = 255; 
      color.blue = 0; 
      dd.strokeColor = color; 
    /*
     var newAnchor1= dd.pathPoints.add();

      newAnchor1.anchor = [ 2.834645 * xx - ratio*normx,  2.834645 * yy - ratio*normy];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;


      var newAnchor2= dd.pathPoints.add();

      newAnchor2.anchor = [ 2.834645 * xx,  2.834645 * yy];
      newAnchor2.leftDirection = newAnchor2.anchor;
      newAnchor2.rightDirection = newAnchor2.anchor;
      newAnchor2.pointType = PointType.CORNER;
    */
	  }
	  }
  }
    
   }
}
