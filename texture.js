var Program = function() {
  this.program = initShaders(gl, "vshader", "fshader");
  gl.useProgram(this.program);

  this.vertexLoc = gl.getAttribLocation(this.program, "vPosition");
  this.colorLoc = gl.getAttribLocation(this.program, "vColor");
  this.texCoordLoc = gl.getAttribLocation(this.program, "vTexCoord");

  this.mvMatrixLoc = gl.getUniformLocation(this.program, "mvMatrix");
  this.pMatrixLoc = gl.getUniformLocation(this.program, "pMatrix");
  this.nMatrixLoc = gl.getUniformLocation(this.program, "nMatrix");
}

