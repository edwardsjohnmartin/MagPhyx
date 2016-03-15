#ifdef GL_ES
precision highp float;
#endif
    
varying vec4 fColor;
    
void main() {
  gl_FragColor = fColor;
}
