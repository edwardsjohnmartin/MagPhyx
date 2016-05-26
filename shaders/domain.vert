#define M_PI 3.1415926535897932384626433832795

attribute vec4 vPosition;
    
uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform float pointSize;
uniform float E;
// mode = 0: inner
// mode = 1: outer
// mode = 2: annulus fill
uniform int mode;
// plot = 0: not a plot
// plot = 1: theta-beta plot
uniform int plot;
    
float computeR(float alpha) {
  float r = pow(10.0+6.0*cos(2.0*alpha), 1.0/6.0) / (pow(-12.0*E, 1.0/3.0));
  if (E >= 0.0) {
    r = 10000.0;
  }
  return r;
}

float computeBeta(float alpha) {
  if (E >= 0.0) {
    return 10000.0;
  }
  
  float r = computeR(alpha);
  return acos(1.0/(r*r*r));
}

vec2 getXY(float alpha) {
  float r;
  if (mode == 0) {
    r = 1.0;
  } else if (mode == 1) {
    r = computeR(alpha);
  } else {
    // mode == 2
    if (vPosition.y == 0.0) {
      r = 1.0;
    } else {
      r = computeR(alpha);
    }
  }
  float x = r * cos(alpha);
  float y = r * sin(alpha);
  return vec2(x, y);
}

vec2 getThetaBeta(float alpha) {
  float x = alpha;
  if (alpha > M_PI) {
    // wrap
    x = alpha - 2.0*M_PI;
  }
  float beta = computeBeta(alpha);
  float y;
  if (mode == 0) {
    y = beta;
  } else if (mode == 1) {
    y = -beta;
  } else {
    // mode == 2
    if (vPosition.y == 0.0) {
      y = beta;
    } else {
      y = -beta;
    }
  }
  if (y != y) y = 0.0;
  return vec2(x, y);
}

void main() {
  // The points are in a circle. First get the alpha value for the point.
  float alpha = vPosition.x;
  vec2 point;
  if (plot == 0) {
    point = getXY(alpha);
  } else {
    point = getThetaBeta(alpha);
  }

  gl_Position = pMatrix*mvMatrix*vec4(point.xy, 0.0, 1.0);
  gl_PointSize = pointSize;
} 
