var Square = function() {

  //  2           3
  //   *---------*
  //   |         |
  //   |         |
  //   |         |
  //   *---------*
  //  0           1

  var vertices = [
    vec4(-0.5, -0.5,  0.0, 1.0),
    vec4( 0.5, -0.5,  0.0, 1.0),
    vec4(-0.5, 0.5,  0.0, 1.0),
    vec4( 0.5,  0.5,  0.0, 1.0),
  ];

  this.numVertices = vertices.length;

  var vertexColors = [
    vec4(1.0, 1.0, 1.0, 1.0),  // white
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
  ];

  var texCoords = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1),
    vec2(1, 1),
  ];

  this.vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  // gl.vertexAttribPointer(program.vertexLoc, 4, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(program.vertexLoc);

  this.cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW);

  // gl.vertexAttribPointer(program.colorLoc, 4, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(program.colorLoc);

  this.tBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.tBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoords), gl.STATIC_DRAW);

  // gl.vertexAttribPointer(program.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(program.texCoordLoc);
}

