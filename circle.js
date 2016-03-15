var Circle = function() {
  // Set up vertices, normals and texture coords
  var pointsArray = [];
  pointsArray.push(vec4(0.0, 0.0, 0.0, 1.0));
  const inc = 5;
  for (var i = 0; i <= 360; i += inc) {
    var theta = i * Math.PI / 180.0;
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var z = 0.0;
    pointsArray.push(vec4(x, y, z, 1.0));
  }
  this.numCirclePoints = pointsArray.length;

  pointsArray.push(vec4(-0.5, -0.2, 0.0, 1.0));
  pointsArray.push(vec4( 0.2, -0.2, 0.0, 1.0));
  pointsArray.push(vec4( 0.2,  0.2, 0.0, 1.0));
  pointsArray.push(vec4(-0.5,  0.2, 0.0, 1.0));
  this.numBasePoints = 4;

  pointsArray.push(vec4( 0.0, -0.55, 0.0, 1.0));
  pointsArray.push(vec4( 0.6,  0.0, 0.0, 1.0));
  pointsArray.push(vec4( 0.0,  0.55, 0.0, 1.0));
  this.numTrianglePoints = 3;

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

