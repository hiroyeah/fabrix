var pitch = 1;
for (var i=0;i<app.activeDocument.layers.length;i=i+1){
	for (var k=0;k<app.activeDocument.layers[i].pathItems.length;k=k+1){
  for (var j=0;j<app.activeDocument.layers[i].pathItems[k].pathPoints.length;j=j+pitch) {
	var coordinateText1 = app.activeDocument.layers[i].textFrames.add();
    coordinateText1.contents = j;
	coordinateText1.position= [app.activeDocument.layers[i].pathItems[k].pathPoints[j].anchor[0], app.activeDocument.layers[i].pathItems[k].pathPoints[j].anchor[1]]; 
    coordinateText1.textRange.characterAttributes.size= 10;
		  }
		  }
}

		  