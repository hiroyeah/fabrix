String[] gcodes;
String[] colorscheme;
String[] newgcodes = {};
int check= 0;
int layernum = 0;
int layercount = 0;
float percent = 0;
float percentb = -1;

 int i=0;
 int n,m;

void setup() {
  
 size(640, 480); 
  
    selectInput("材料混合ファイルをCSVで選択してください　　Select CSV file to process:", "fileSelectedB"); 
 
    selectInput("G-CODEファイルを選択してください　Select g-code file to process:", "fileSelectedA");


   textAlign(CENTER);
   textSize(24); 
   fill(100,100,100);
  
}


void draw() {

 
 if (gcodes != null && colorscheme != null) { 
   
    n = gcodes.length; 
    m = colorscheme.length;
 
for (i=0; i<n; i++){



   percent = 100* i/n; 
   
  // background(255,255,255);
  // text(i +   " / " + n +" .... " + str(int(percent))+"%", 200, 200);

   
   println(i +   " / " + n +" .... " + str(int(percent))+"%");
 

   String[] list = split(gcodes[i], ' ');
 if (list.length > 1 &&  list[0].equals(";") == true ) {  
   

 if (list[1].equals("layer") == true ){ 
   

   String[] listl = split(list[2],','); 
   
   layernum = int(listl[0]); 
   
 if (layernum>0){
       layercount++;
       
  if (layernum <= colorscheme.length) {
    
   
    
      if (layernum==1) {
     newgcodes= append(newgcodes, "modbus s1 f6 a40004 v1");  // t1を自動運転ON
     newgcodes= append(newgcodes ,"modbus s1 f6 a40014 v1");  // t2を自動運転ON
        newgcodes = append(newgcodes, ";for auto-start"); 

   }

    
   String sss = colorscheme[layernum-1];
   String[] ssss = split(sss,',');
   
   
   newgcodes = append(newgcodes, "modbus s1 f6 a40002 v" + ssss[0]);
   newgcodes = append(newgcodes, "modbus s1 f6 a40012 v" + ssss[1]);
      newgcodes = append(newgcodes, "; for layernumber"+str(layernum)); 
      
      if (layernum==1) {
   newgcodes = append(newgcodes, "modbus s1 f6 a40000 v1");  // t1をON
   newgcodes = append(newgcodes, "modbus s1 f6 a40010 v1");  // t2をON
           newgcodes = append(newgcodes, "; for material-pumping start ");
     }
   

 }
 }
 }
    
     

 
 


 }

 newgcodes = append(newgcodes, gcodes[i]);
 
 if ( i == n - 1 ) {
 
 newgcodes= append(newgcodes, "modbus s1 f6 a40000 v0");  // t1を停止
 newgcodes= append(newgcodes ,"modbus s1 f6 a40010 v0");  // t2を停止
 newgcodes= append(newgcodes, "modbus s1 f6 a40004 v0");  // t1を自動運転ON
 newgcodes= append(newgcodes ,"modbus s1 f6 a40014 v0");  // t2を自動運転ON
 
 
 saveStrings("combined_gcode.gco", newgcodes);
 println("layernum: "+layercount + " colorscheme lines"+m);
 println("save Done--- find 'combined_gcode.gco' ");
 exit();
}

}

 }


}

void fileSelectedA(File selection1) {
  if (selection1 == null) {
    println("Window was closed or the user hit cancel.");
  } else {
    println("User selected " + selection1.getAbsolutePath());
      gcodes= loadStrings(selection1.getAbsolutePath());

  }
}

void fileSelectedB(File selection2) {
  if (selection2 == null) {
    println("Window was closed or the user hit cancel.");
  } else {
    println("User selected " + selection2.getAbsolutePath());
      colorscheme= loadStrings(selection2.getAbsolutePath());


  }
}
