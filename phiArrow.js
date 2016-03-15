var PhiArrow = function() {
  // Set up vertices, normals and texture coords
  var pointsArray = [];

  pointsArray.push(vec4( 0.0,  0.2, 0.0, 1.0));
  pointsArray.push(vec4(-0.5,  0.2, 0.0, 1.0));
  pointsArray.push(vec4(-0.5, -0.2, 0.0, 1.0));
  pointsArray.push(vec4( 0.0, -0.2, 0.0, 1.0));
  this.numBasePoints = 4;

  pointsArray.push(vec4( 0.0, -0.2, 0.0, 1.0));
  pointsArray.push(vec4( 0.0, -0.55, 0.0, 1.0));
  pointsArray.push(vec4( 0.6,  0.0, 0.0, 1.0));
  pointsArray.push(vec4( 0.0,  0.55, 0.0, 1.0));
  pointsArray.push(vec4( 0.0,  0.2, 0.0, 1.0));
  this.numHeadPoints = 5;

  this.n = 9;

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

