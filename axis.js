var Axis = function() {
  var pointsArray = [];
  var colorsArray = [];
  pointsArray.push(vec4(0.0, 0.0, 0.0, 1.0));
  pointsArray.push(vec4(1.0, 0.0, 0.0, 1.0));
  colorsArray.push(vec4(1.0, 0.0, 0.0, 1.0));
  colorsArray.push(vec4(1.0, 0.0, 0.0, 1.0));

  pointsArray.push(vec4(0.0, 0.0, 0.0, 1.0));
  pointsArray.push(vec4(0.0, 1.0, 0.0, 1.0));
  colorsArray.push(vec4(0.0, 1.0, 0.0, 1.0));
  colorsArray.push(vec4(0.0, 1.0, 0.0, 1.0));

  pointsArray.push(vec4(0.0, 0.0, 0.0, 1.0));
  pointsArray.push(vec4(0.0, 0.0, 1.0, 1.0));
  colorsArray.push(vec4(0.0, 0.0, 1.0, 1.0));
  colorsArray.push(vec4(0.0, 0.0, 1.0, 1.0));

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  this.colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  this.numPoints = pointsArray.length;
}

