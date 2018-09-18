#ifdef GL_ES
precision highp float;
#endif

uniform vec4 color;
varying vec4 fColor;

void main() {
  gl_FragColor = fColor;
  // gl_FragColor = color;
}
