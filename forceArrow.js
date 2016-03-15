var ForceArrow = function() {
  // Set up vertices, normals and texture coords
  var pointsArray = [];

  this.arrowWidth = 0.5;
  const aw = this.arrowWidth;
  pointsArray.push(vec4(0.0,    -0.1, 0.0, 1.0));
  pointsArray.push(vec4(1.0-aw, -0.1, 0.0, 1.0));
  pointsArray.push(vec4(1.0-aw,  0.1, 0.0, 1.0));
  pointsArray.push(vec4(0.0,     0.1, 0.0, 1.0));

  pointsArray.push(vec4(0.0, -0.4, 0.0, 1.0));
  pointsArray.push(vec4(aw,   0.0, 0.0, 1.0));
  pointsArray.push(vec4(0.0,  0.4, 0.0, 1.0));

  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
}

// mag - magnitude
// p - origin of arrow
// v - vector
// s - scale factor
// outsideCircle - whether to translate the arrow outside a circle
ForceArrow.prototype.render = function(p, v, s, color, outsideCircle, thin) {
  if (!flatProgram.initialized) return false;

  var thin = typeof thin !== 'undefined' ?  thin : 1;
  const mag = length(v);
  if (mag == 0) {
    return true;
  }

  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, forceArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniform4fv(flatProgram.colorLoc, flatten(color));

  pushMatrix();
  // get in position
  mvMatrix = mult(mvMatrix, translate(p[0], p[1], p[2]));
  // global scale
  // const gs = mesh2Obj / 2;
  mvMatrix = mult(mvMatrix, scalem(s, s, 1));
  // rotation
  mvMatrix = mult(mvMatrix, rotateZ(degrees(Math.atan2(v[1], v[0]))));
  // translate outside of circle
  if (outsideCircle) {
    mvMatrix = mult(mvMatrix, translate(1, 0, 0));
  }

  // const mag = length(v);
  if (mag > this.arrowWidth) {
    pushMatrix();
    // (1 - aw) * f = (mag - aw)
    // f = (mag - aw)/(1 - aw)
    const ls = (mag - this.arrowWidth) / (1.0 - this.arrowWidth);
    mvMatrix = mult(mvMatrix, scalem(ls, 1, 1));
    mvMatrix = mult(mvMatrix, scalem(1, thin, 1));
    gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    popMatrix();
  }

  pushMatrix();
  mvMatrix = mult(mvMatrix, translate(Math.max(0, mag-this.arrowWidth), 0, 0));
  mvMatrix = mult(mvMatrix, scalem(thin, thin, 1));
  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLES, 4, 3);
  popMatrix();

  popMatrix();

  return true;
}

