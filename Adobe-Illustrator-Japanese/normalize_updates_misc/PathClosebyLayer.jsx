///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
//
// Coast at End = 0の、完全に閉じたパスを用意したとして、さらにその始点と終点を、「レイヤーごと」に完全につなぎ合わせる
// 
// 
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////






//レイヤーの総数を数える
var n = activeDocument.layers.length; 
var ns = activeDocument.layers[0].layers.length; 
//パスの総数を求める
var pObj1 = activeDocument.pathItems; 

// 初期パネル
// Reference: https://github.com/nvkelso/illustrator-scripts/blob/master/other-authors/jwundes/SelectPathsBySize.jsx



     alert( n + " layers to  "+ pObj1.length +" paths ");
	 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

for (var i=0;i<app.activeDocument.pathItems.length;i++)  
{	
    var newAnchor1= app.activeDocument.pathItems[i].pathPoints.add();
      newAnchor1.anchor = [ app.activeDocument.pathItems[i].pathPoints[0].anchor[0],  app.activeDocument.pathItems[i].pathPoints[0].anchor[1] ];
      newAnchor1.leftDirection = newAnchor1.anchor;
      newAnchor1.rightDirection = newAnchor1.anchor;
      newAnchor1.pointType = PointType.CORNER;
	  
	  
  if (app.activeDocument.pathItems[i].closed==false)  
  app.activeDocument.pathItems[i].closed=true ; 
}


