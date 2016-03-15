attribute vec4 vPosition;
varying vec3 vLighting;
varying vec4 gPosition;
varying vec4 lPosition;
    
uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat4 nMatrix;
    
void main() {
  gl_Position = pMatrix*mvMatrix*vPosition;
  gPosition = gl_Position;
  lPosition = vPosition;
} 
