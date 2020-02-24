String glines[];
String newlines[] = {};
int totallines; 
float ax = -10000.0000;
float ay = -10000.0000;
float bx = -10000.0000;
float by = -10000.0000;
float cx = -10000.0000;
float cy = -10000.0000;
String addline; 
int count=0;


float diff = 10.0000;


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
  if (glines != null){
   
   for (int i=0; i<totallines-1; i++){
     addline = glines[i]; 
     

     
     // process 1-st-line
     
     String[] gcodeone = glines[i].split(" ");
     
       if (gcodeone.length > 2){
       if (gcodeone[0].equals("G1") && gcodeone[1].charAt(0) == 'X' && gcodeone[2].charAt(0) == 'Y' ) {
        
         if (ax == -10000 ) { 
          
          int iii =  gcodeone[1].length(); 
          int iiii = gcodeone[2].length();
         ax = float(gcodeone[1].substring(1,iii-1));  
         ay = float(gcodeone[2].substring(1,iiii-1)); 
       
     }
          else { 
            
     
          String[] gcodetwo = glines[i+1].split(" ");
       if (gcodetwo.length > 3){
       if (gcodetwo[0].equals("G1") && gcodetwo[1].charAt(0) == 'X' && gcodetwo[2].charAt(0)  == 'Y') {
         
              ///first point (ax,ay) -> bx, by ni    
          bx = ax; 
          by = ay;   
          
          // ax, ay ha second point ni
          ax = float(gcodeone[1].substring(1,gcodeone[1].length()-1));  
          ay = float(gcodeone[2].substring(1,gcodeone[2].length()-1));
     
    
       
         
         // fist point ha cx cy
          cx = bx; cy = by; 
          // second point ha bx by 
          bx = ax; by = ay; 
          
         // third point ha ax ay
          ax = float(gcodetwo[1].substring(1,gcodetwo[1].length()-1));  
          ay = float(gcodetwo[2].substring(1,gcodetwo[2].length()-1)); 
       
   if (gcodeone.length > 3){
       if ( gcodeone[3].charAt(0) == 'E' && gcodetwo[3].charAt(0) == 'E')  {
        if (  float(gcodeone[3].substring(1,gcodeone[3].length()-1))>0 && float(gcodetwo[3].substring(1,gcodetwo[3].length()-1))>0 ) {
          
          float vecax = ax-bx; float vecay = ay-by; 
          float vecbx = bx-cx; float vecby = by-cy; 
          
          float costheta = (vecax*vecbx + vecay*vecby) / ( ( sqrt(vecax*vecax + vecay*vecay) * sqrt(vecbx*vecbx + vecby*vecby)));
          
              println("Found:"+count + " cos:"+costheta + " ----- ax:"+ax + " ay:"+ay + " :bx"+bx +" :by"+by + " :cx"+cx + " :cy"+cy);
          if (costheta < 0.76604444311 && costheta > -1) { 
          
         //  println("Found: "+ gcodeone[0] + " *** " + gcodeone[1].charAt(0) + " *** " + gcodeone[2].charAt(0) + " --- " + gcodetwo[0] + " *** " + gcodetwo[1].charAt(0) + " *** " + gcodetwo[2].charAt(0));      
          count = count +1; 
          println("match");
          println("");
          
          float normvecbx = (bx-cx)/sqrt((bx-cx)*(bx-cx)+(by-cy)*(by-cy)); 
          float normvecby = (by-cy)/sqrt((bx-cx)*(bx-cx)+(by-cy)*(by-cy));
          float veclength = sqrt((bx-cx)*(bx-cx)+(by-cy)*(by-cy));
          
          float modifiedlen = veclength - diff;
          
          
        if (modifiedlen > 0.0) {

          float dx = cx + normvecbx * modifiedlen; 
          float dy = cy + normvecby * modifiedlen;
          
          println("dx:"+dx+ " --- dy:"+dy+ "  veclength:"+ veclength+ "  diff:"+diff); 
          
          float nowe = float(gcodeone[3].substring(1,gcodeone[3].length()-1));
          
          float newe = nowe * ((veclength- diff) / veclength ); 
          println(" original E = "+nowe+ "  new E = "+newe);
          println();
          if (gcodeone.length == 5) { 
          addline = "G1 X"+dx +" Y"+dy+ " E"+newe + " F"+ float(gcodeone[4].substring(1,gcodeone[4].length()-1)); }
            if (gcodeone.length == 4) { 
          addline = "G1 X"+dx +" Y"+dy+ " E"+newe; }
          
          
                 newlines = (String[])append(newlines, ";modified");  
                 newlines = (String[])append(newlines, addline);         
           addline = "G1 X"+bx + " Y"+by;
           println("bx:"+bx+" by:"+by);
           
}}  }

  
  /// end else
  
        }
   }
        
       
             
          
       }
          }
       }
                   
        }
        
    
  }
       // println("addline: "+addline); 
                         newlines = (String[])append(newlines, addline);
}
    saveStrings("modified_"+year()+month()+day()+hour()+minute()+second()+".gcode", newlines);
        println("done.");
        exit();
  }
}
