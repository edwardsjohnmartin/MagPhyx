//------------------------------------------------------------
// Constructor
//------------------------------------------------------------
var Plot = function() {
  this.canvas = document.getElementById("gl-plot-canvas");

  this.gl = WebGLUtils.setupWebGL(this.canvas);
  if (!this.gl) { alert("WebGL isn't available"); }

  this.resize();

  this.gl.clearColor(1.0, 1.0, 1.0, 1.0);

  this.gl.disable(this.gl.DEPTH_TEST);

  this.points = new Points(this.gl);
  this.points.setBB(-Math.PI, Math.PI, -Math.PI, Math.PI);
  this.updateLabels();

  //  Load shaders and initialize attribute buffers
  this.program = new FlatProgram(this.gl);
}

//------------------------------------------------------------
// Update labels of the plot
//------------------------------------------------------------
Plot.prototype.updateLabels = function() {
  document.getElementById("xmin").innerHTML =
    degrees(this.points.minx).toFixed(0);
  document.getElementById("xmax").innerHTML =
    degrees(this.points.maxx).toFixed(0);
  document.getElementById("ymin").innerHTML =
    degrees(this.points.miny).toFixed(0);
  document.getElementById("ymax").innerHTML =
    degrees(this.points.maxy).toFixed(0);
  // if (this.n == 0) {
  //   document.getElementById("xmin").innerHTML = "&nbsp;";
  //   document.getElementById("xmax").innerHTML = "&nbsp;";
  //   document.getElementById("ymin").innerHTML = "&nbsp;";
  //   document.getElementById("ymax").innerHTML = "&nbsp;";
  // }
}

//------------------------------------------------------------
// resize
//------------------------------------------------------------
Plot.prototype.resize = function() {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = this.canvas.clientWidth;
  var displayHeight = this.canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  if (this.canvas.width  != displayWidth ||
      this.canvas.height != displayHeight) {
 
    // Make the canvas the same size
    this.canvas.width  = displayWidth;
    this.canvas.height = displayHeight;
  }

  // var rect = canvas.getBoundingClientRect();
  // canvasX = rect.left;
  // canvasY = rect.top;
  // canvasWidth = canvas.width;
  // canvasHeight = canvas.height;
  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
}

//------------------------------------------------------------
// render
//------------------------------------------------------------
Plot.prototype.render = function() {
  if (!this.program.initialized) return false;

  this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  pushMatrix();
  this.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
  // var pm = ortho(0, this.canvas.width, 0, this.canvas.height, 0, 2);
  var pm = ortho(-1, 1, -1, 1, 0, 2);
  var mvm = mat4();

  var rangex = this.points.maxx-this.points.minx;
  var rangey = this.points.maxy-this.points.miny;
  mvm = mult(mvm, scalem(1.8/rangex, 1.8/rangey, 1));

  this.updateLabels();

  this.gl.enableVertexAttribArray(this.program.vertexLoc);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.points.vertexBuffer);
  this.gl.vertexAttribPointer(this.program.vertexLoc, 4,
                              this.gl.FLOAT, false, 0, 0);

  this.gl.uniformMatrix4fv(this.program.mvMatrixLoc, false, flatten(mvm));
  this.gl.uniformMatrix4fv(this.program.pMatrixLoc, false, flatten(pm));
  this.gl.uniform4fv(this.program.colorLoc, flatten(black));

  if (this.points.n > 1) {
    this.gl.uniform1f(this.program.pointSize, 1);
    this.gl.drawArrays(this.gl.POINTS, 0, this.points.n-1);
  }

  if (this.points.n > 0) {
    this.gl.uniform1f(this.program.pointSize, 3);
    this.gl.drawArrays(this.gl.POINTS, this.points.n-1, 1);
  }
  // this.gl.uniform1f(this.program.pointSize, 1);
  // this.gl.drawArrays(this.gl.LINE_STRIP, 0, 2);

  popMatrix();

  return true;
}

//------------------------------------------------------------
// push a point
//------------------------------------------------------------
Plot.prototype.push = function(p) {
  this.points.push(p);
  this.updateLabels();
}

//------------------------------------------------------------
// clear all points
//------------------------------------------------------------
Plot.prototype.clear = function() {
  this.points.clear();
  this.updateLabels();
}
