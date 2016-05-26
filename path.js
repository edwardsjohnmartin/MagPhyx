var Path = function(gl) {
  this.points = new Points(gl);
}

Path.prototype.clear = function() {
  this.points.clear();
}

Path.prototype.push = function(p) {
  this.points.push(p);
}

Path.prototype.render = function() {
  if (!flatProgram.initialized) return false;
  gl.useProgram(flatProgram.program);

  pushMatrix();
  var s = 1;///mesh2Obj;
  mvMatrix = mult(mvMatrix, scalem(s, s, 1));

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.points.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniform4fv(flatProgram.colorLoc, flatten(renderer.red));

  gl.drawArrays(gl.LINE_STRIP, 0, this.points.n);

  popMatrix();

  return true;
}

