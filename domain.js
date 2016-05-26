var Domain = function(gl_) {
  // Set up vertices, normals and texture coords
  var pointsArray = [];
  const inc = 1;
  for (var i = 0; i <= 360; i += inc) {
    var theta = i * Math.PI / 180.0;
    // y=0 means inner ring
    // y=1 means outer ring
    pointsArray.push(vec4(theta, 0.0, 0.0, 1.0));
    pointsArray.push(vec4(theta, 1.0, 0.0, 1.0));
  }
  this.n = pointsArray.length;

  this.vertexBuffer = gl_.createBuffer();
  gl_.bindBuffer(gl_.ARRAY_BUFFER, this.vertexBuffer);
  gl_.bufferData(gl_.ARRAY_BUFFER, flatten(pointsArray), gl_.STATIC_DRAW);

  this.outlineColor = vec4(0, 0, 1, 1);
  this.fillColor = vec4(0.95, 0.95, 1.0, 1.0);
}

Domain.prototype.segments = function(theta) {
  var n = (theta/(2*Math.PI)) * 360 * 2;
  var ret = [];
  ret.push({ start:0, count:n });
  ret.push({ start:180*2-n, count:n*2 });
  ret.push({ start:361*2-n, count:(n+1) });
  return ret;
}

Domain.prototype.wrappedSegments = function(theta) {
  var n = (theta/(2*Math.PI)) * 360 * 2;
  var ret = [];
  ret.push({ start:0, count:n+4 });
  ret.push({ start:180*2-n, count:n });
  ret.push({ start:180*2+2, count:n+2 });
  ret.push({ start:361*2-n-2, count:(n+1) });
  return ret;
}
