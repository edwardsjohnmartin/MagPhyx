var TorqueArrow = function() {
  this.r = 1.35;

  // Set up vertices, normals and texture coords
  var pointsArray = [];
  const inc = 1;
  const r1 = this.r - 0.1;
  const r2 = this.r + 0.1;
  for (var i = 0; i < 360; i += inc) {
    var theta = i * Math.PI / 180.0;
    var x = Math.cos(theta);
    var y = Math.sin(theta);
    var z = 0.0;

    pointsArray.push(vec4(r1*x, r1*y, z, 1.0));
    pointsArray.push(vec4(r2*x, r2*y, z, 1.0));
  }

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

