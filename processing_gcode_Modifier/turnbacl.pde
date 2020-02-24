String glines[];
String newlines[] = {};
int totallines; 

FloatList keepx;
FloatList keepy;
FloatList keepe;

String addline; 
String modifyline;

int count=0;

int starting = 0;
float ax,ay;

String keeplines[];
String reverselines[];
float    pree = 0.0;
        float newe;

void setup() {
  selectInput("Select a file to process:", "fileSelected");
}

void fileSelected(File selection) {
  if (selection == null) {
    println("Window was closed or the user hit cancel.");
  } else {
    println("User selected " + selection.getAbsolutePath());
      glines = loadStrings(selection);
          totallines = glines.length;
   //println(totallines);
 //        for(String val:lines){
 //   println(val);
//  
//         }
  }
}
  
void draw(){
  
  
  /// starting = 0; nothing happes
  /// starting = 1; "layer " found.. searching the first origin point
  /// starting = 2; first origin point found and keep ... searching turnback lines 
  /// starting = 3; integrated and write, back to starting = 0  
  
  if (glines != null){
   
   for (int i=0; i<totallines-1; i++){
     addline = glines[i]; 
     
   
     boolean p3 = addline.contains("; layer");
     if( p3 == true && starting == 0) { starting = 1; } 
   
  
         String[] gcodeone = glines[i].split(" ");
         if (gcodeone.length > 3){
         if (gcodeone[0].equals("G1") && gcodeone[1].charAt(0) == 'X' && gcodeone[2].charAt(0) == 'Y'  ) {
           
           if (starting == 0) {
             newlines = (String[])append(newlines,  addline);
           }
           
           else if (starting == 1) {
  
         
         ax = float(gcodeone[1].substring(1,gcodeone[1].length()));  
         ay = float(gcodeone[2].substring(1,gcodeone[2].length())); 
         starting = 2;

keepx = new FloatList();
keepy = new FloatList();
keepe = new FloatList();
        pree = 0.0;
          
           } else if( starting ==2 ) {
             
             
             keepx.append( float(gcodeone[1].substring(1,gcodeone[1].length())));
             keepy.append( float(gcodeone[2].substring(1,gcodeone[2].length())));
             float cale = float(gcodeone[3].substring(1,gcodeone[3].length())) - pree;
             keepe.append( cale );
             
                 println("cale:"+cale+" pree:+"+pree+ " keepe:"+keepe);
                 
             pree = float(gcodeone[3].substring(1,gcodeone[3].length()));
             
         
             
             if (float(gcodeone[1].substring(1,gcodeone[1].length()))== ax && float(gcodeone[2].substring(1,gcodeone[2].length())) ==ay){  
             starting =3; 
           
           
            newlines = (String[])append(newlines, "; turnback start");
            for (int l=0; l<keepx.size()-1; l++){
       
      
              
              if( l==0) { 
                  newe = 0; 
                  modifyline = "G1 X"+keepx.get(keepx.size()-2-l)+" Y"+keepy.get(keepy.size()-2-l)+" E"+newe + " F10000";
              } else {
                  newe =  newe + keepe.get(keepe.size()-1-l); 
                 modifyline = "G1 X"+keepx.get(keepx.size()-2-l)+" Y"+keepy.get(keepy.size()-2-l)+" E"+newe + " F4000";
            }
              
         
                newlines = (String[])append(newlines, modifyline );
                
            }
                 newe =  newe + keepe.get(0);
                 modifyline = "G1 X"+keepx.get(keepx.size()-1)+" Y"+keepy.get(keepy.size()-1)+" E"+newe+ " F4000";
                newlines = (String[])append(newlines, modifyline );
       
             starting = 0;
             ax = 0; ay = 0; 
             
                  newlines = (String[])append(newlines, "; turnback end");
              }
             
             
             
           }
         } else {
                 newlines = (String[])append(newlines,  addline);
         }
         } else {
                 newlines = (String[])append(newlines,  addline);
         }
   }
         
                saveStrings("turnback_"+year()+month()+day()+hour()+minute()+second()+".gcode", newlines);
        println("done.");
        exit();
   }
}

           
           
 
