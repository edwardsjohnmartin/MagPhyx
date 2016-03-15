precision mediump float;

varying vec4 fColor;
varying  vec2 fTexCoord;

uniform sampler2D texture;

void main() {
  float bias = 0.7;
  gl_FragColor = vec4(bias, bias, bias, 0.0) + texture2D( texture, fTexCoord );
  // gl_FragColor = texture2D( texture, fTexCoord );
  // gl_FragColor = fColor * texture2D( texture, fTexCoord );
  // gl_FragColor = vec4(1.0, 1.0, 0.3, 1.0) * texture2D( texture, fTexCoord );
  // gl_FragColor = texture2D( texture, fTexCoord );
}
