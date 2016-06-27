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

  this.domain = new Domain(this.gl);

  //  Load shaders and initialize attribute buffers
  this.program = new FlatProgram(this.gl);
  this.domainProgram = new DomainProgram(this.gl);

  this.anim_n = -1;
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

  this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
}

Plot.prototype.renderDomain = function(pm, mvm) {
  var prog = this.domainProgram;

  if (!prog.initialized) return false;

  //--------------------------------
  // Render the domain shells
  //--------------------------------
  this.gl.useProgram(prog.program);

  this.gl.enableVertexAttribArray(prog.vertexLoc);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.domain.vertexBuffer);
  this.gl.vertexAttribPointer(prog.vertexLoc, 4, this.gl.FLOAT, false, 0, 0);

  this.gl.uniformMatrix4fv(prog.pMatrixLoc, false, flatten(pm));
  this.gl.uniformMatrix4fv(prog.mvMatrixLoc, false, flatten(mvm));

  var E_ = get_E(freeDipole);

  var n = this.domain.n;
  var segments = [ { start:0, count:n/2-2 }, // top boundary
                   { start:n/2+2, count:n/2-2 }]; // bottom boundary
  var unboundedSegments = [];
  // n is determined from the equation for r_c in the paper by solving
  // for theta at r = 1.0.
  if (E_ < -1/6 || (E_ > 1/6 && E_ < 1/3)) {
    // Equation in domain boundaries section of paper
    var cos = 24 * E_ * E_ - 5/3;
    var theta_c = Math.acos(cos) / 2;
    segments = this.domain.wrappedSegments(theta_c, E_ < 0);
    unboundedSegments = this.domain.unboundedSegments(theta_c, E_ < 0);
  }

  this.gl.uniform1f(prog.ELoc, E_);
  this.gl.uniform1i(prog.plotLoc, 1);

  // fill
  this.gl.uniform1i(prog.modeLoc, 2);
  this.gl.uniform4fv(prog.colorLoc, flatten(this.domain.fillColor));
  for (var i = 0; i < segments.length; ++i) {
    var segment = segments[i];
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, segment.start, segment.count);
  }
  for (var i = 0; i < unboundedSegments.length; ++i) {
    var segment = unboundedSegments[i];
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, segment.start, segment.count);
  }
  // outline
  if (E_ < 1/3) {
    this.gl.uniform4fv(prog.colorLoc, flatten(this.domain.outlineColor));
    for (var mode = 0; mode < 2; ++mode) {
      this.gl.uniform1i(prog.modeLoc, mode);
      for (var i = 0; i < segments.length; ++i) {
        var segment = segments[i];
        this.gl.drawArrays(this.gl.LINE_STRIP, segment.start, segment.count);
      }
    }
  }

  return true;
}

//------------------------------------------------------------
// render
//------------------------------------------------------------
Plot.prototype.renderPoints = function(pm, mvm) {
  var prog = this.program;
  if (!prog.initialized) return false;

  this.gl.useProgram(prog.program);

  this.gl.enableVertexAttribArray(prog.vertexLoc);
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.points.vertexBuffer);
  this.gl.vertexAttribPointer(prog.vertexLoc, 4,
                              this.gl.FLOAT, false, 0, 0);

  this.gl.uniformMatrix4fv(prog.mvMatrixLoc, false, flatten(mvm));
  this.gl.uniformMatrix4fv(prog.pMatrixLoc, false, flatten(pm));
  this.gl.uniform4fv(prog.colorLoc, flatten(renderer.black));

  if (this.points.n > 0) {
    if (this.points.n > 1) {
      this.gl.uniform1f(prog.pointSize, 1);
      if (this.anim_n > -1) {
        this.gl.drawArrays(this.gl.POINTS, 0, this.anim_n);
        this.anim_n++;
        if (this.anim_n >= this.points.n-1) {
          this.anim_n = -1;
        }
      } else {
        this.gl.drawArrays(this.gl.POINTS, 0, this.points.n-1);
      }
    }

    this.gl.uniform1f(prog.pointSize, 3);
    if (this.anim_n == -1) {
      this.gl.drawArrays(this.gl.POINTS, this.points.n-1, 1);
    }
  }

  return true;
}

Plot.prototype.toggleAnimate = function() {
  if (this.anim_n == -1) {
    this.anim_n = 1;
  } else {
    this.anim_n = -1;
  }
  this.render();
}

Plot.prototype.tick = function() {
  if (this.anim_n > -1) {
    var that = this;
    requestAnimationFrame(function() { that.tick() });
    this.render();
  }
}

Plot.prototype.render = function() {
  this.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
  var pm = ortho(-1, 1, -1, 1, 0, 2);
  var mvm = mat4();

  var rangex = this.points.maxx-this.points.minx;
  var rangey = this.points.maxy-this.points.miny;
  // mvm = mult(mvm, scalem(1.8/rangex, 1.8/rangey, 1));
  mvm = mult(mvm, scalem(2/rangex, 2/rangey, 1));

  if (!this.renderDomain(pm, mvm)) return false;
  if (!this.renderPoints(pm, mvm)) return false;
  this.updateLabels();

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
