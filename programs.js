var LineProgram = function() {
  this.initialized = false;
  const prog = this;
  initShadersNew(
    gl, "shaders/line.vert", "shaders/line.frag", function(program) {
      prog.initialized = true;
      prog.program = program;
      gl.useProgram(prog.program);

      prog.vertexLoc = gl.getAttribLocation(prog.program, "vPosition");
      prog.colorLoc = gl.getAttribLocation(prog.program, "vColor");

      prog.mvMatrixLoc = gl.getUniformLocation(prog.program, "mvMatrix");
      prog.pMatrixLoc = gl.getUniformLocation(prog.program, "pMatrix");
      prog.nMatrixLoc = gl.getUniformLocation(prog.program, "nMatrix");
    });
}

var SphereProgram = function() {
  this.initialized = false;
  const prog = this;
  initShadersNew(
    gl, "shaders/sphere.vert", "shaders/sphere.frag", function(program) {
      prog.initialized = true;
      prog.program = program;
      gl.useProgram(prog.program);

      prog.vertexLoc = gl.getAttribLocation(prog.program, "vPosition");
      prog.normalLoc = gl.getAttribLocation(prog.program, "vNormal");
      prog.colorLoc = gl.getAttribLocation(prog.program, "vColor");

      prog.mvMatrixLoc = gl.getUniformLocation(prog.program, "mvMatrix");
      prog.pMatrixLoc = gl.getUniformLocation(prog.program, "pMatrix");
      prog.nMatrixLoc = gl.getUniformLocation(prog.program, "nMatrix");
    });
}

var CircleProgram = function() {
  this.initialized = false;
  const prog = this;
  initShadersNew(
    gl, "shaders/circle.vert", "shaders/circle.frag", function(program) {
      prog.initialized = true;
      prog.program = program;
      gl.useProgram(prog.program);

      prog.vertexLoc = gl.getAttribLocation(prog.program, "vPosition");
      prog.normalLoc = gl.getAttribLocation(prog.program, "vNormal");
      prog.colorLoc = gl.getAttribLocation(prog.program, "vColor");

      prog.mvMatrixLoc = gl.getUniformLocation(prog.program, "mvMatrix");
      prog.pMatrixLoc = gl.getUniformLocation(prog.program, "pMatrix");
      prog.nMatrixLoc = gl.getUniformLocation(prog.program, "nMatrix");

      prog.colorLoc = gl.getUniformLocation(prog.program, "color");
    });
}

var FlatProgram = function(gl) {
  this.initialized = false;
  const prog = this;
  initShadersNew(
    gl, "shaders/flat.vert", "shaders/flat.frag", function(program) {
      prog.initialized = true;
      prog.program = program;
      gl.useProgram(prog.program);

      prog.vertexLoc = gl.getAttribLocation(prog.program, "vPosition");

      prog.mvMatrixLoc = gl.getUniformLocation(prog.program, "mvMatrix");
      prog.pMatrixLoc = gl.getUniformLocation(prog.program, "pMatrix");

      prog.pointSize = gl.getUniformLocation(prog.program, "pointSize");
      prog.colorLoc = gl.getUniformLocation(prog.program, "color");

      gl.uniform1f(prog.pointSize, 1.0);
    });
}

var TextureProgram = function() {
  this.initialized = false;
  const prog = this;
  initShadersNew(
    gl, "shaders/flat.vert", "shaders/flat.frag", function(program) {
      prog.initialized = true;
      prog.program = program;
      gl.useProgram(prog.program);

      prog.vertexLoc = gl.getAttribLocation(prog.program, "vPosition");
      prog.colorLoc = gl.getAttribLocation(prog.program, "vColor");
      prog.texCoordLoc = gl.getAttribLocation(prog.program, "vTexCoord");

      prog.mvMatrixLoc = gl.getUniformLocation(prog.program, "mvMatrix");
      prog.pMatrixLoc = gl.getUniformLocation(prog.program, "pMatrix");
      prog.nMatrixLoc = gl.getUniformLocation(prog.program, "nMatrix");
    });
}
