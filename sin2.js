var Sin2 = function() {
  // Set up vertices, normals and texture coords
  var pointsArray = [];
  const inc = 1;
  for (var i = 0; i <= 360; i += inc) {
    var theta = i * Math.PI / 180.0;
    var r = 0.5 * Math.pow(Math.sin(theta), 2);
    var x = r * Math.cos(theta);
    var y = r * Math.sin(theta);
    var z = 0.0;
    pointsArray.push(vec4(x, y, z, 1.0));
  }
  this.size = pointsArray.length;

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

