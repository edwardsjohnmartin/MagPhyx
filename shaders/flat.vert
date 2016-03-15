attribute vec4 vPosition;
    
uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform float pointSize;
    
void main() {
  gl_Position = pMatrix*mvMatrix*vPosition;
  gl_PointSize = pointSize;
} 
