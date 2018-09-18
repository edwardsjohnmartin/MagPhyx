attribute vec4 vPosition;

varying vec4 fColor;
    
uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform float pointSize;
uniform int numPoints;
uniform int numFade;

uniform vec4 color;
    
void main() {
  gl_Position = pMatrix*mvMatrix*vec4(vPosition.xyz, 1.0);
  gl_PointSize = pointSize;
  float alpha = 1.0;
  if (numFade > 0) {
    alpha = float(numFade)-(float(numPoints) - vPosition.w);
    alpha = alpha < 0.0 ? 0.0 : alpha/float(numFade);
    alpha = alpha*alpha;
  }
  fColor = color * vec4(1.0, 1.0, 1.0, alpha);
} 
