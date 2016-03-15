var BArrow = function() {
  // Set up vertices, normals and texture coords
  var pointsArray = [];

  this.arrowWidth = 0.5;
  const aw = this.arrowWidth;
  pointsArray.push(vec4(0.0, -0.4, 0.0, 1.0));
  pointsArray.push(vec4(aw,   0.0, 0.0, 1.0));
  pointsArray.push(vec4(aw*0.3,  0.0, 0.0, 1.0));
  pointsArray.push(vec4(0.0,  0.4, 0.0, 1.0));

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}
