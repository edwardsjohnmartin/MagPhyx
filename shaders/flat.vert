attribute vec4 vPosition;

varying vec4 fColor;
    
uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform float pointSize;

uniform vec4 color;
    
void main() {
  gl_Position = pMatrix*mvMatrix*vPosition;
  gl_PointSize = pointSize;
  fColor = color;
} 
