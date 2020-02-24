String glines[];
String newlines[] = {};
int totallines; 

float diff = 5.000;

float limitcos = 0;
//float limitcos=0.76604444311;

// cos 10 : 0.98480775301
// cos 20 : 0.93969262078
// cos 30 : 0.86602540378
// cos 40 : 0.76604444311
// cos 50 : 0.64278760968
// cos 60 : 

int minimumoff = 1; // if diff> length...

float ax = 0.0000;
float ay = 0.0000;


float bx = -10000.0000;
float by = -10000.0000;
float cx = -10000.0000;
float cy = -10000.0000;
String addline; 
int count=0;

int starting = 0;




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
     
     
     boolean p3 = addline.contains("; layer 3");
     //println(p3);
     
 if( p3 == true && starting == 0) { starting = 1; println ("start! from:"+ i);}
 
    String[] gcodeone = glines[i].split(" ");
    
 if (starting == 1 ) {
     
     // process 1-st-line
     
  
     
     
     
     
     
     
       if (gcodeone.length > 3){
       if (gcodeone[0].equals("G1") && gcodeone[1].charAt(0) == 'X' && gcodeone[2].charAt(0) == 'Y'  && gcodeone[3].charAt(0) == 'E') {
         
            String[] gcodetwo = glines[i+1].split(" ");  
            
       if (gcodetwo.length > 3){
       if (gcodetwo[0].equals("G1") && gcodetwo[1].charAt(0) == 'X' && gcodetwo[2].charAt(0) == 'Y'  && gcodetwo[3].charAt(0) == 'E') {   
         
         
          int iii =  gcodeone[1].length(); 
          int iiii = gcodeone[2].length();
         
         bx = float(gcodeone[1].substring(1,iii));  
         by = float(gcodeone[2].substring(1,iiii)); 
         
         
          int iiiii =  gcodetwo[1].length(); 
          int iiiiii = gcodetwo[2].length();
         
         cx = float(gcodetwo[1].substring(1,iiiii));  
         cy = float(gcodetwo[2].substring(1,iiiiii)); 
         
         
           if (  float(gcodeone[3].substring(1,gcodeone[3].length()))>0 && float(gcodetwo[3].substring(1,gcodetwo[3].length()))>0 ) {
          
          float vecax = bx-ax; float vecay = by-ay; 
          float vecbx = cx-bx; float vecby = cy-by; 
          
          float costheta = (vecax*vecbx + vecay*vecby) / ( ( sqrt(vecax*vecax + vecay*vecay) * sqrt(vecbx*vecbx + vecby*vecby)));
          
              println("Found:"+count + " cos:"+costheta + " ----- ax:"+ax + " ay:"+ay + " :bx"+bx +" :by"+by + " :cx"+cx + " :cy"+cy);
          if (costheta < limitcos && costheta > -1) { 
          
         //  println("Found: "+ gcodeone[0] + " *** " + gcodeone[1].charAt(0) + " *** " + gcodeone[2].charAt(0) + " --- " + gcodetwo[0] + " *** " + gcodetwo[1].charAt(0) + " *** " + gcodetwo[2].charAt(0));      
          count = count +1; 
          println("match");
          println("");
          
          float normvecbx = (bx-ax)/sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay)); 
          float normvecby = (by-ay)/sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
          float veclength = sqrt((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
          
          float modifiedlen = veclength - diff;
          
          
        if (modifiedlen > 0.0) {

          float dx = ax + normvecbx * modifiedlen; 
          float dy = ay + normvecby * modifiedlen;
          
          println("dx:"+dx+ " --- dy:"+dy+ "  veclength:"+ veclength+ "  diff:"+diff); 
          
          float nowe = float(gcodeone[3].substring(1,gcodeone[3].length()));
          
          float newe = nowe * ((veclength- diff) / veclength ); 
          println(" original E = "+nowe+ "  new E = "+newe);
          println();
          
          if (gcodeone.length == 5) { 
          addline = "G1 X"+dx +" Y"+dy+ " E"+newe + " F"+ int(gcodeone[4].substring(1,gcodeone[4].length())); }
            if (gcodeone.length == 4) { 
          addline = "G1 X"+dx +" Y"+dy+ " E"+newe; }
          
          
                 newlines = (String[])append(newlines, ";modified");  
                 newlines = (String[])append(newlines, addline);         
           addline = "G1 X"+bx + " Y"+by;
           println("bx:"+bx+" by:"+by);
         
        
        }
        
        if (  minimumoff == 1 && modifiedlen < 0.0 ) {
          
          println("mininum off");
                if (gcodeone.length == 5) { 
          addline = "G1 X"+bx +" Y"+by+ " E0  F"+ int(gcodeone[4].substring(1,gcodeone[4].length())); }
            if (gcodeone.length == 4) { 
          addline = "G1 X"+bx +" Y"+by+ " E0"; }
          
          
        }
        
        
          }
           }
       }
       }
       
       
       
       }
       
       
       
          
      
       
       
     }
     
 }
     
         newlines = (String[])append(newlines, addline);
         
       if (gcodeone.length > 3){
       if (gcodeone[0].equals("G1") && gcodeone[1].charAt(0) == 'X' && gcodeone[2].charAt(0) == 'Y' ) {
          ax = float(gcodeone[1].substring(1,gcodeone[1].length()));  
          ay = float(gcodeone[2].substring(1,gcodeone[2].length()));
       }
       } 
         
   }
   
      saveStrings(year()+month()+day()+hour()+minute()+second()+"_diff"+diff+"_min"+minimumoff+".gcode", newlines);
        println("done.");
        exit();
   
  }
   
    
        
  }

         
