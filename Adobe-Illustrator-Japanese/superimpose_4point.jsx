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


// 倍数
var num = 1;

shell=1;
function setTextO() {
shell = 1;
    }
function setTextP() {
shell = 2;
    }
function setTextQ() {
shell = 3;
    }

//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx
var dlg = new Window('dialog', 'Ratio (X-Y distance to E)'); 

dlg.location = [500,50];
var defaultValueA = 1;

 dlg.alertBtnsPnl0 = dlg.add('group',undefined, 'Number of [pattern] layer [pattern1, pattern2..]');

    (dlg.alertBtnsPnl0.titleEt = dlg.alertBtnsPnl0.add('edittext', [100,15,160,35], 0)).helpTip = "layers"; 
     dlg.alertBtnsPnl0.titleEt.text = defaultValueA; 
    (dlg.alertBtnsPnl0.titleSt = dlg.alertBtnsPnl0.add('statictext', [10,15,300,35], 'The number of PatternLayers 1 or 2 or 3?')).helpTip = "..."; 
     dlg.alertBtnsPnl0.orientation='row';

       
	(dlg.dimsPnl3 = dlg.add('panel', undefined, 'Shell')).helpTip = "Shell"; 
	dlg.dimsPnl3.orientation='row';
	(dlg.dimsPnl3.selectO = dlg.dimsPnl3.add('radiobutton', [45,115,180,135], 'keep' )).helpTip = ""; 
	(dlg.dimsPnl3.selectP = dlg.dimsPnl3.add('radiobutton', [45,140,180,160], 'remove' )).helpTip = "";
	(dlg.dimsPnl3.selectQ = dlg.dimsPnl3.add('radiobutton', [45,140,180,160], 'overwrite' )).helpTip = "";

	dlg.dimsPnl3.selectO.value = true; 

	dlg.dimsPnl3.selectO.onClick= setTextO;
	dlg.dimsPnl3.selectP.onClick= setTextP;
	dlg.dimsPnl3.selectQ.onClick= setTextQ;

    dlg.btnPnl = dlg.add('group', undefined, 'Do It!'); 
    dlg.btnPnl.orientation='row';
    dlg.btnPnl.buildBtn2 = dlg.btnPnl.add('button', [125,15,225,35], 'OK', {name:'ok'}); 


    dlg.show();


var num =  parseFloat(   dlg.alertBtnsPnl0.titleEt.text);



     alert("The number of pattern layers = "+num); 
     
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var ad = activeDocument;
var n = activeDocument.layers.length; 


for (mmm=0; mmm<num; mmm++){
     //Patternレイヤーを順番に処理していく
   
       var layPat = ad.layers["pattern"+(mmm+1)];
       var pObj3 = layPat.pathItems;
   
   
  
   

　　 //Patternレイヤの中のアイテムを順番に処理していく
         for (l=pObj3.length-1; l>-1; l--){
			 
			 
			//  pObj3[l].strokeColor.blue = 255;
   
     //Patternレイヤの中のアイテムのパスの端部を順番に処理していく
      for (m=0; m<pObj3[l].pathPoints.length-1; m++){
     
          
      var ax =  layPat.pathItems[l].pathPoints[m].anchor[0]; 
      var ay =  layPat.pathItems[l].pathPoints[m].anchor[1];

      var bx =  layPat.pathItems[l].pathPoints[m+1].anchor[0]; 
      var by =  layPat.pathItems[l].pathPoints[m+1].anchor[1];



//////////////////////////////////////////////////////////
// Shellレイヤー
//////////////////////////////////////////////////////////


for(i = 0; i<n; i++){

    /// パターンレイヤーが2の場合
	if(num==2 && mmm==0 && (i % 2) == 1) {continue;} 
    if(num==2 && mmm==1 && (i % 2) == 0) {continue;} 

	// パターンレイヤーが3の場合
	if(num==3 && mmm==0 && (i % 3) == 1) {continue;} 
	if(num==3 && mmm==0 && (i % 3) == 2) {continue;} 
	if(num==3 && mmm==1 && (i % 3) == 0) {continue;} 
	if(num==3 && mmm==1 && (i % 3) == 2) {continue;} 
	if(num==3 && mmm==2 && (i % 3) == 0) {continue;} 
	if(num==3 && mmm==2 && (i % 3) == 1) {continue;} 
				

	
	
	
if(ad.layers[i].visible == false) continue; 
if(ad.layers[i].name.substring(0,7) == 'pattern') {
continue; 
}




  var layOri =  ad.layers[i];
  var pObj2 = layOri.pathItems;


// LayOriは最外殻を表すレイヤー
// pObj2はそのなかのパスアイテム集


   var crossx= [];
   var crossy= [];

// アイテム数分
   for (j=0; j<pObj2.length; j++){

	

 var color = new RGBColor();
 color.red =0; 
 color.green =255;
 color.blue =0;
   
  // alert(pObj2[j].strokeColor.green );
   if (pObj2[j].strokeColor.green == 255) { 
  // alert("here");
continue;
}

if(shell==3){
 var color = new RGBColor();
 color.red =50; 
 color.green =200;
 color.blue =50;
 pObj2[j].strokeColor = color;
 pObj2[j].strokeWidth = 2;

}

   //////////////////////////////////////////////////////////
      for (k=0; k<pObj2[j].pathPoints.length-1; k++){
		  




     
          
      var cx =  layOri.pathItems[j].pathPoints[k].anchor[0]; 
      var cy =  layOri.pathItems[j].pathPoints[k].anchor[1];

      var dx =  layOri.pathItems[j].pathPoints[k+1].anchor[0]; 
      var dy =  layOri.pathItems[j].pathPoints[k+1].anchor[1];


        //合成
   //  交差判定
    var ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
    var tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
    var tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
    var td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);

    if( tc * td < 0 && ta * tb < 0 && pObj2[j].strokeColor.green != 255) { 
    // 交差している

    var d = (bx - ax)*(dy - cy) - (by - ay)*(dx - cx);
    if (d != 0) {
    
    var u = ((cx - ax)*(dy - cy) - (cy - ay)*(dx - cx))/d;
    var v = ((cx - ax)*(by - ay) - (cy - ay)*(bx - ax))/d;
    

    if (u < 0.0 || u > 1.0){
        alert("ありえないのですが・・・");
    }
    if (v < 0.0 || v > 1.0){
           alert("ありえないのですが・・・");
    }

    intersecx = ax + u * (bx - ax);
    intersecy = ay + u * (by - ay);

crossx.push(intersecx); 
crossy.push(intersecy);

}
}

//////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////
if(pObj2[j].closed){
     


      var cx =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[0]; 
      var cy =  layOri.pathItems[j].pathPoints[pObj2[j].pathPoints.length-1].anchor[1];

      var dx =  layOri.pathItems[j].pathPoints[0].anchor[0]; 
      var dy =  layOri.pathItems[j].pathPoints[0].anchor[1];


        //合成
   //  交差判定
    var ta = (cx - dx) * (ay - cy) + (cy - dy) * (cx - ax);
    var tb = (cx - dx) * (by - cy) + (cy - dy) * (cx - bx);
    var tc = (ax - bx) * (cy - ay) + (ay - by) * (ax - cx);
    var td = (ax - bx) * (dy - ay) + (ay - by) * (ax - dx);

    if( tc * td <= 0 && ta * tb <= 0 && pObj2[j].strokeColor.green != 255) { 
    // 交差している

    var d = (bx - ax)*(dy - cy) - (by - ay)*(dx - cx);
    if (d != 0) {
    
    var u = ((cx - ax)*(dy - cy) - (cy - ay)*(dx - cx))/d;
    var v = ((cx - ax)*(by - ay) - (cy - ay)*(bx - ax))/d;
    

    if (u < 0.0 || u > 1.0){
        alert("ありえないのですが・・・");
    }
    if (v < 0.0 || v > 1.0){
           alert("ありえないのですが・・・");
    }

    intersecx = ax + u * (bx - ax);
    intersecy = ay + u * (by - ay);

crossx.push(intersecx); 
crossy.push(intersecy);

}
}
}
//////////////////////////////////////////////////////////

if (shell == 2 && mmm == num-1 && l==0){
pObj2[j].remove(); 
}


	  
   	  

   
}
   }



///////////////
//交点があった
////////////////
if(crossx.length>0){

//alert(layPat.name + " --- " +layOri.name + "... Layer:"+i+ " ... Item:"+j+ " .... Anchor:"+k);




//重複を消す
clean(crossx,crossy);


//距離の近いほうから順にソート
sort(crossx,crossy,ax,ay);



// 数値をテキストで添える
/*
for(i=0; i<crossx.length; i++){



var coordinateText1 = layOri.textFrames.add();
coordinateText1.contents =i;

coordinateText1.position=[crossx[i],crossy[i]];
coordinateText1.textRange.characterAttributes.size= 20;
var texColor = new RGBColor();
texColor.red   = 255;
texColor.green = 140;
texColor.blue  = 140;
coordinateText1.textRange.characterAttributes.fillColor = texColor;
coordinateText1.characters.stroked = true;
coordinateText1.characters.strokeColor = texColor;
coordinateText1.fillColor = texColor;


}
*/




for (w=0; w<crossx.length-1; w++){
	


//かならず2の倍数
if (w % 2 == 0){
     var cc = pObj2.add();
cc.strokeWidth = 2;

 var color = new RGBColor();
 color.red =0; 
 color.green =255;
 color.blue =0;
cc.strokeColor = color; 

var newAnchor1= cc.pathPoints.add();

newAnchor1.anchor = [crossx[w],crossy[w]];
newAnchor1.leftDirection = newAnchor1.anchor;
newAnchor1.rightDirection = newAnchor1.anchor;
newAnchor1.pointType = PointType.CORNER;


var newAnchor2= cc.pathPoints.add();

newAnchor2.anchor = [crossx[w+1],crossy[w+1]];
newAnchor2.leftDirection = newAnchor2.anchor;
newAnchor2.rightDirection = newAnchor2.anchor;
newAnchor2.pointType = PointType.CORNER;


/*
 var newPoint = activeDocument.pathItems.ellipse(crossy[w],crossx[w],10,10,false,false);
 var color = new RGBColor();
 color.red =0; 
 color.green =255;
 color.blue =255;
 
  newPoint.fillColor = color;
  newPoint.filled =true;
  newPoint.strokeColor = color;
  newPoint.stroked =true; 
  newPoint.strokeWidth = 5;
  
   var newPoint = activeDocument.pathItems.ellipse(crossy[w+1],crossx[w+1],10,10,false,false);
 var color = new RGBColor();
 color.red =0; 
 color.green =255;
 color.blue =255;
 
  newPoint.fillColor = color;
  newPoint.filled =true;
  newPoint.strokeColor = color;
  newPoint.stroked =true; 
  newPoint.strokeWidth = 5;
  */
  


}
}


}
//アイテム数分
//レイヤー分
///////////////
//交点があった
////////////////


//////////////////////////////////////////////////////////
// Shellレイヤーおわり
//////////////////////////////////////////////////////////


}
}

    //Patternレイヤーを順番に処理していく


	  }
	  
	  //	    pObj3[l].strokeColor.blue = 0;
		 }

	
		 


function sort(a, b, c, d){

var i;
var j;
    // 最後の要素を除いて、すべての要素を並べ替えます
    for(i=0;i<a.length-1;i++){

      // 下から上に順番に比較します
      for(j=a.length-1;j>i;j--){

	// 上の方が大きいときは互いに入れ替えます
	if(distance(a[j],b[j],c,d)<distance(a[j-1],b[j-1],c,d)){
	  var t=a[j];
	  a[j]=a[j-1];
	  a[j-1]=t; 
	  var tt=b[j];
	  b[j]=b[j-1];
	  b[j-1]=tt;
	  
	}
      }
    }

return a,b;
  }


function clean(a, b){
	
	   var newcrossx= [];
	   var newcrossy= [];
	   
var i;
var j;
    // 最後の要素を除いて、すべての要素を並べ替えます
    for(i=0;i<a.length-1;i++){
     
var check=0;
	 for(j=i+1;j<a.length-1;j++){
		 
		 if (a[i]==a[j] && b[i]==b[j]){ 
	     check=1; 
         break;		 
		 }
      }
	  
	 if (check==0) {  
	  
newcrossx.push(a[i]); 
newcrossy.push(b[i]);
    }
	}
	
	a = newcrossx;
	b = newcrossy;
	
return a,b;
  }



function distance(a,b,c,d) {

var i;
i = Math.sqrt((a-c)*(a-c)+(d-b)*(d-b));
return i;

}


