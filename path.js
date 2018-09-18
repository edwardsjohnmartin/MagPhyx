var Path = function(gl, color) {
  this.points = new Points(gl);
  this.color = color;
}

Path.prototype.clear = function() {
  this.points.clear();
}

Path.prototype.push = function(p) {
  this.points.push(p);
}

Path.prototype.render = function() {
  if (!pathProgram.initialized) return false;

  if (this.points.n == 0) return true;

  gl.useProgram(pathProgram.program);

  pushMatrix();
  var s = 1;///mesh2Obj;
  mvMatrix = mult(mvMatrix, scalem(s, s, 1));

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  gl.enableVertexAttribArray(pathProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.points.vertexBuffer);
  gl.vertexAttribPointer(pathProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(pathProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(pathProgram.pMatrixLoc, false, flatten(pMatrix));
  // gl.uniform4fv(pathProgram.colorLoc, flatten(renderer.red));
  gl.uniform4fv(pathProgram.colorLoc, flatten(this.color));
  gl.uniform1i(pathProgram.numPointsLoc, this.points.n);
  gl.uniform1i(pathProgram.numFadeLoc, numFadePath);

  gl.drawArrays(gl.LINE_STRIP, 0, this.points.n);

  gl.disable(gl.BLEND);
  popMatrix();

  return true;
}

