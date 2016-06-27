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
// plot = 0: not a plot - physical space, or main window rendering
// plot = 1: theta-beta plot
uniform int plot;
    
float computeR(float theta) {
  float den;
  if (E < 0.0) {
    den = (pow(-12.0*E, 1.0/3.0));
  } else {
    den = -(pow(12.0*E, 1.0/3.0));
  }
  float r = pow(10.0+6.0*cos(2.0*theta), 1.0/6.0) / den;
  return r;
}

float computeBeta(float theta) {
  float r = computeR(theta);
  return acos(1.0/(r*r*r));
}

float test(float theta) {
  float r = computeR(theta);
  return ((r*r*r));
}

vec2 getXY(float theta) {
  float r;
  if (mode == 0) {
    r = 1.0;
  } else if (mode == 1) {
    r = (E<0.0)?computeR(theta):100000.0;
  } else {
    // mode == 2
    if (vPosition.y == 0.0) {
      r = 1.0;
    } else {
      // r = computeR(theta);
      r = (E<0.0)?computeR(theta):100000.0;
    }
  }
  float x = r * cos(theta);
  float y = r * sin(theta);
  return vec2(x, y);
}

vec2 getThetaBeta(float theta) {
  if (theta > M_PI) {
    // wrap so -180 < theta < 180
    theta = theta - 2.0*M_PI;
  }
  float beta = computeBeta(theta);
  float x = theta;
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
  if (y != y) {
    y = 0.0;
    if (mode == 2) {
      y = (vPosition.y == 0.0) ? M_PI : -M_PI;
    }
  }
  return vec2(x, y);
}

void main() {
  // The points are in a circle. First get the theta value for the point.
  float theta = vPosition.x;
  vec2 point;
  if (plot == 0) {
    point = getXY(theta);
  } else {
    point = getThetaBeta(theta);
  }

  gl_Position = pMatrix*mvMatrix*vec4(point.xy, 0.0, 1.0);
  gl_PointSize = pointSize;
} 
