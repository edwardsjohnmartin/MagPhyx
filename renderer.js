var Renderer = function(gl) {
  this.red = vec4(1, 0, 0, 1);
  this.green = vec4(0, 1, 0, 1);
  this.darkGreen = vec4(0, 0.7, 0.2, 1);
  this.blue = vec4(0, 0, 1, 1);
  this.cyan = vec4(0, 1, 1, 1);
  this.darkMagenta = vec4(0.8, 0, 0.8, 1);
  this.yellow = vec4(1, 1, 0, 1);
  this.orange = vec4(0.8, 0.6, 0.0);
  this.burntOrange = vec4(0.81, 0.33, 0.0);
  this.gray = vec4(.5, .5, .5, 1);
  this.lightGray = vec4(0.8, 0.8, 0.8, 1);
  this.black = vec4(0, 0, 0, 1);
  this.white = vec4(1, 1, 1, 1);

  this.Fcolor = this.orange;
  this.Tcolor = this.orange;
  this.FnetColor = vec4(1.0, 0.6, 0.6, 1.0);
  this.TnetColor = vec4(0.6, 0.6, 1.0, 1.0);
  this.vcolor = this.darkGreen;
  this.wcolor = this.darkGreen;
  this.Bgray = this.gray;
  this.Bcolor = this.lightGray;

  this.axis = new Axis();
  this.floor = new Floor();
  this.arrow = new Arrow();
  this.segment = new Segment();
  this.sphere = new Sphere(1, 200, 200);
  this.square = new Square();
  this.circle = new Circle();
  this.phiArrow = new PhiArrow();
  // path = new Points(gl);
  // path = new Path(gl);
  this.sin2 = new Sin2();
  this.domain = new Domain(gl);
  this.forceArrow = new ForceArrow();
  this.bArrow = new BArrow();
  this.torqueArrow = new TorqueArrow();
}

Renderer.prototype.renderAxis = function() {
  if (!lineProgram.initialized) return;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.axis.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.axis.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, this.axis.numPoints);
}

Renderer.prototype.renderFloor = function() {
  if (!lineProgram.initialized) return false;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.floor.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.floor.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, this.floor.numPoints);

  return true;
}

Renderer.prototype.renderArrow = function() {
  if (!lineProgram.initialized) return false;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.arrow.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.arrow.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, this.arrow.numPoints);

  return true;
}

Renderer.prototype.renderSegment = function() {
  if (!lineProgram.initialized) return false;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.segment.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.segment.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, this.segment.numPoints);

  return true;
}

Renderer.prototype.renderSphere = function() {
  if (!sphereProgram.initialized) return false;
  gl.useProgram(sphereProgram.program);

  gl.enableVertexAttribArray(sphereProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.vertexBuffer);
  gl.vertexAttribPointer(sphereProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(sphereProgram.normalLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.normalBuffer);
  gl.vertexAttribPointer(sphereProgram.normalLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(sphereProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.colorBuffer);
  gl.vertexAttribPointer(sphereProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(sphereProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(sphereProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(sphereProgram.nMatrixLoc, false, flatten(nMatrix));

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphere.indexBuffer);
  gl.drawElements(gl.TRIANGLES, this.sphere.numIndices, gl.UNSIGNED_SHORT, 0);

  return true;
}

Renderer.prototype.getFreeDipoleColor = function() {
  var U_ = get_U(freeDipole);
  var color;
  var min = 1/5;
  var max = 3/4;
  if (U_ > 0) {
    // Range of U is from -1/3 to 0. Convert to [min, max].
    var u = Math.pow(Math.abs(U_) * 6, 1/2) * (max-min) + min;
    color = vec4(1.0, 1.0-u, 1.0-u, 1.0);
  } else {
    // Range of U is from -1/3 to 0. Convert to [min, max].
    var u = Math.pow(Math.abs(U_) * 3, 1/2) * (max-min) + min;
    color = vec4(1.0-u, 1.0-u, 1.0, 1.0);
  }
  return color;
}

Renderer.prototype.renderCircle = function(fixed) {
  if (!circleProgram.initialized) return;
  gl.useProgram(circleProgram.program);

  gl.enableVertexAttribArray(circleProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.circle.vertexBuffer);
  gl.vertexAttribPointer(circleProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(circleProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(circleProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(circleProgram.nMatrixLoc, false, flatten(nMatrix));

  // Circle
  if (fixed) {
    gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
  } else {
    var color = this.getFreeDipoleColor();
    gl.uniform4fv(circleProgram.colorLoc, flatten(color));
  }
  gl.drawArrays(gl.TRIANGLE_FAN, 0, this.circle.numCirclePoints);

  // Arrow base and triangle
  gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(0.2, 0.2, 0.2, 1.0)));
  gl.drawArrays(gl.TRIANGLE_FAN,
                this.circle.numCirclePoints, 4);
  gl.drawArrays(gl.TRIANGLES, this.circle.numCirclePoints + 4, 3);

  return true;
}

Renderer.prototype.renderCircleOutline = function(fixed) {
  if (!circleProgram.initialized) return;
  gl.useProgram(circleProgram.program);

  gl.enableVertexAttribArray(circleProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.circle.vertexBuffer);
  gl.vertexAttribPointer(circleProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(circleProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(circleProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(circleProgram.nMatrixLoc, false, flatten(nMatrix));

  // Circle
  if (fixed) {
    gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
  } else {
    var color = this.getFreeDipoleColor();
    gl.uniform4fv(circleProgram.colorLoc, flatten(color));
  }
  gl.drawArrays(gl.LINE_LOOP, 1, this.circle.numCirclePoints-1);

  // Arrow base and triangle
  gl.bindBuffer(gl.ARRAY_BUFFER, this.phiArrow.vertexBuffer);
  gl.vertexAttribPointer(circleProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(0.2, 0.2, 0.2, 1.0)));
  // gl.drawArrays(gl.LINE_STRIP,
  //               0, this.phiArrow.numBasePoints);
  gl.drawArrays(gl.LINE_LOOP, 0, this.phiArrow.n);//this.phiArrow.numBasePoints, this.phiArrow.numHeadPoints);

  return true;
}

Renderer.prototype.renderForceArrow = function(dipole, f, color, thin) {
  var mag = 4 * Math.pow(length(f), 1/4);
  f = mult(normalize(f), mag);
  return this.forceArrow.render(dipole.p(), f, mesh2Obj, color, true, thin);
}

Renderer.prototype.renderTorqueArrow = function(dipole, t, color, thin) {
  if (!flatProgram.initialized) return false;

  var p = dipole.p();

  // console.log(t);
  // if (length(t) < 0.0000001) {
  if (Math.abs(t) < 0.0000001) {
    return true;
  }

  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.torqueArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.uniform4fv(flatProgram.colorLoc, flatten(color));

  // var mag = 0.5 * Math.pow(length(t), 1/3);
  var mag = 0.5 * Math.pow(Math.abs(t), 1/3);
  var deg = Math.min(358, 360 * mag);

  pushMatrix();
  // get in position
  mvMatrix = mult(mvMatrix, translate(p[0], p[1], p[2]));
  // global scale
  var gs = mesh2Obj;
  mvMatrix = mult(mvMatrix, scalem(gs, gs, 1));

  // if (t[2] < 0) {
  if (t < 0) {
    mvMatrix = mult(mvMatrix, scalem(1, -1, 1));
  }

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1 + Math.floor(deg) * 2 + 6);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.forceArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);
  mvMatrix = mult(mvMatrix, rotateZ(deg));
  mvMatrix = mult(mvMatrix, translate(this.torqueArrow.r, 0, 0));
  mvMatrix = mult(mvMatrix, rotateZ(90));
  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLES, 4, 3);

  popMatrix();

  return true;
}

// Angular velocity - w
Renderer.prototype.renderAVArrow = function(dipole, w, color) {
  if (!flatProgram.initialized) return false;

  var p = dipole.p();

  if (w == 0) {
    return true;
  }

  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.torqueArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.uniform4fv(flatProgram.colorLoc, flatten(color));

  var mag = 0.5 * Math.abs(w);
  var deg = Math.min(330, 360 * mag);
  if (deg < 5) return true;

  pushMatrix();
  // get in position
  mvMatrix = mult(mvMatrix, translate(p[0], p[1], p[2]));
  // global scale
  var gs = mesh2Obj * 0.5;
  mvMatrix = mult(mvMatrix, scalem(gs, gs, 1));

  if (w < 0) {
    mvMatrix = mult(mvMatrix, scalem(1, -1, 1));
  }

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1 + Math.floor(deg) * 2 + 6);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.forceArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);
  mvMatrix = mult(mvMatrix, rotateZ(deg));
  mvMatrix = mult(mvMatrix, translate(this.torqueArrow.r, 0, 0));
  mvMatrix = mult(mvMatrix, rotateZ(90));
  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLES, 4, 3);

  popMatrix();

  return true;
}

Renderer.prototype.renderB = function() {
  if (!flatProgram.initialized) return false;
  //--------------------------------
  // Render the magnetic field lines
  //--------------------------------
  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.sin2.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  // How many diameter units from origin to top of viewport?
  var k = fh/2;
  var i = Math.log(k) / Math.log(2);
  // console.log("fh = " + fh);
  // console.log("k = " + k);
  var inc = 1.5;
  var exp = 1.5;
  var start = 0.7;
  var end = 1024 * zoom;

  // s is the distance from the center in factors of D.
  var myinc = inc;
  // for (var s = start; s <= end; s *= inc) {
  for (var s = start; s <= end; s *= myinc) {
    myinc *= 1.2;
    // for (var s = start; s <= end; s = Math.pow(s+1, 1.5)) {
    pushMatrix();
    mvMatrix = mult(mvMatrix, scalem(s*2, s*2, 1));
    gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));
    gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));

    gl.uniform4fv(flatProgram.colorLoc, flatten(this.Bgray));

    gl.drawArrays(gl.LINE_STRIP, 0, this.sin2.size);
    popMatrix();
  }

  // //--------------------------------
  // // Render the direction arrows
  // //--------------------------------
  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  // gl.bindBuffer(gl.ARRAY_BUFFER, this.forceArrow.vertexBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.bArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniform4fv(flatProgram.colorLoc, flatten(this.Bgray));

  // var gs = 0.2 * zoom;
  var gs = 0.3 * zoom;

  // s is the distance from the center in factors of D.
  var count = 0;
  // for (var s = start; s <= end; s *= inc) {
  // for (var s = start; s <= end; s = Math.pow(s+1, 1.5)) {
  myinc = inc;
  for (var s = start; s <= end; s *= myinc) {
    myinc *= 1.2;
    if (s > k) {
      // The angle at which the field line intersects y=k.
      // The intersection point is s*sin^3(theta)
      var ytheta = Math.asin(Math.pow(k/s, 1/3));
      // The angle at which the field line intersects y=k/2
      var ytheta2 = Math.asin(Math.pow(k/(2*s), 1/3));
      // var theta = ytheta2;
      // var theta = ytheta;
      var theta = ytheta / 1.4;

      var curx = s*Math.sin(ytheta)*Math.sin(ytheta)*Math.cos(ytheta);
      if (curx > fw/2) {
        // The angle at which the field line intersects x=fw/2
        // The equation for this is cos^3(theta) - cos(theta) = -fw/s
        // which doesn't appear to have a solution using acos. So solve
        // using a binary search. Start the search at ytheta.
        var curTheta = ytheta;
        var dTheta = ytheta;
        // var x = fw/4;
        var x = fw/2;
        while (Math.abs(curx-x) > 0.01) {
          dTheta /= 2;
          if (curx > x) {
            curTheta -= dTheta;
          } else {
            curTheta += dTheta;
          }
          curx = s*Math.sin(curTheta)*Math.sin(curTheta)*Math.cos(curTheta);
        }
        theta = curTheta;
        var cury = s*Math.sin(theta)*Math.sin(theta)*Math.sin(theta);
        // The angle at which the field line intersects y=cury/2
        theta = Math.asin(Math.pow(cury/(2*s), 1/3));
      }
      // theta /= 1.4;
      // theta *= theta;
      // theta = Math.pow(theta, 1.5);

      for (var d = -1; d <= 1; d += 2) {
        for (var j = 0; j < 2; ++j) {
          var phi = theta;
          if (j == 0) {
            phi = Math.PI - phi;
          }
          phi *= d;
          var r = s * Math.pow(Math.sin(phi), 2);
          var p = vec3(r*Math.cos(phi), r*Math.sin(phi), 0);
          this.renderBArrow(p, gs);
        }
      }
    } else {
      count++;
      this.renderBArrow(vec3(0, s, 0), gs);
      this.renderBArrow(vec3(0, -s, 0), gs);
    }
  }

  return true;
}

Renderer.prototype.renderDomain = function() {
  if (!domainProgram.initialized) return false;

  //--------------------------------
  // Render the domain shells
  //--------------------------------
  gl.useProgram(domainProgram.program);

  gl.enableVertexAttribArray(domainProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.domain.vertexBuffer);
  gl.vertexAttribPointer(domainProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  pushMatrix();
  gl.uniformMatrix4fv(domainProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(domainProgram.mvMatrixLoc, false, flatten(mvMatrix));

  var E_ = get_E(freeDipole);

  // n is determined from the equation for r_c in the paper by solving
  // for theta at r = 1.0.
  // var n = domain.n;
  var segments = [ { start:0, count:this.domain.n } ];
  var cos = (144*E_*E_-10)/6;
  if (E_ < 0 && cos >= -1 && cos <= 1) {
  // if (cos >= -1 && cos <= 1) {
    var theta = Math.acos(cos) / 2;
    segments = this.domain.segments(theta);
  }

  gl.uniform1f(domainProgram.ELoc, E_);
  gl.uniform1i(domainProgram.plotLoc, 0);

  // fill
  gl.uniform1i(domainProgram.modeLoc, 2);
  gl.uniform4fv(domainProgram.colorLoc,
                // flatten(vec4(0.95, 0.95, 1.0, 1.0)));
                flatten(this.domain.fillColor));
  for (var i = 0; i < segments.length; ++i) {
    var segment = segments[i];
    gl.drawArrays(gl.TRIANGLE_STRIP, segment.start, segment.count);
  }
  // outline
  // gl.uniform4fv(domainProgram.colorLoc, flatten(blue));
  gl.uniform4fv(domainProgram.colorLoc, flatten(this.domain.outlineColor));
  for (var mode = 0; mode < 2; ++mode) {
    gl.uniform1i(domainProgram.modeLoc, mode);
    for (var i = 0; i < segments.length; ++i) {
      var segment = segments[i];
      gl.drawArrays(gl.LINE_STRIP, segment.start, segment.count);
    }
  }

  popMatrix();

  return true;
}

Renderer.prototype.renderBArrow = function(p, gs) {
  if (!flatProgram.initialized) return false;

  // var v = B(fixedDipole.m(), p);
  var v = B_dir_pos(p);

  pushMatrix();
  // get in position
  mvMatrix = mult(mvMatrix, translate(p[0], p[1], p[2]));
  // rotation
  mvMatrix = mult(mvMatrix, rotateZ(degrees(Math.atan2(v[1], v[0]))));
  // global scale
  // mvMatrix = mult(mvMatrix, scalem(gs, gs/1.4, 1));
  mvMatrix = mult(mvMatrix, scalem(gs, gs/2.8, 1));
  // move triangle to origin
  mvMatrix = mult(mvMatrix,
                  translate(Math.max(-this.forceArrow.arrowWidth/2), 0, 0));

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  popMatrix();

  return true;
}

Renderer.prototype.renderTexture = function() {
  if (!textureProgram.initialized) return false;

  gl.useProgram(textureProgram.program);

  gl.enableVertexAttribArray(textureProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.square.vBuffer);
  gl.vertexAttribPointer(textureProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(textureProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.square.cBuffer);
  gl.vertexAttribPointer(textureProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(textureProgram.texCoordLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.square.tBuffer);
  gl.vertexAttribPointer(textureProgram.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(textureProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(textureProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.square.numVertices);

  return true;
}

Renderer.prototype.renderCircles = function() {
  pushMatrix();
  var s = mesh2Obj;
  var success = true;
  var positions = [ vec3(0,0,0), freeDipole.p() ];
  var moments = [ vec3(1,0,0), freeDipole.m() ];
  for (var i = 0; i < positions.length; i++) { 
    pushMatrix();
    mvMatrix = mult(mvMatrix, translate(positions[i]));
    var phi = Math.acos(dot(vec3(1, 0, 0), moments[i]));
    if (phi != 0) {
      var axis = cross(vec3(1, 0, 0), moments[i]);
      mvMatrix = mult(mvMatrix, rotate(degrees(phi), axis));
    }
    mvMatrix = mult(mvMatrix, scalem(s, s, 1));
    success = success && this.renderCircle(i == 0);
    popMatrix();
  }
  popMatrix();

  return success;
}

Renderer.prototype.renderFreeDipoleOutline = function(freeDipole) {
  pushMatrix();
  let s = mesh2Obj;
  let success = true;
  let positions = [ vec3(0,0,0), freeDipole.p() ];
  let moments = [ vec3(1,0,0), freeDipole.m() ];
  for (let i = 0; i < positions.length; i++) { 
    pushMatrix();
    mvMatrix = mult(mvMatrix, translate(positions[i]));
    let phi = Math.acos(dot(vec3(1, 0, 0), moments[i]));
    if (phi != 0) {
      let axis = cross(vec3(1, 0, 0), moments[i]);
      mvMatrix = mult(mvMatrix, rotate(degrees(phi), axis));
    }
    mvMatrix = mult(mvMatrix, scalem(s, s, 1));
    if (i == 0) {
      success = success && this.renderCircle(i == 0);
    } else {
      success = success && this.renderCircleOutline(i == 0);
    }
    popMatrix();
  }
  popMatrix();

  return success;
}

Renderer.prototype.renderCircleOutlines = function() {
  success = this.renderFreeDipoleOutline(freeDipole);
  if (success) {
    success = this.renderFreeDipoleOutline(freeDipole2);
  }
  return success;
}

Renderer.prototype.renderMagneticField = function(origin) {
  var success = true;
  // Render magnetic field
  pushMatrix();
  var sf = 0.05;
  var inc = 0.08;
  var ystart = -1.0;// + (inc*100 % origin[1]*100)/100;
  var xstart = -1.0;
  var yend = 1.0;
  var xend = 1.0;
  for (var y = ystart; y < yend; y += inc) {
    for (var x = xstart; x < xend; x += inc) {
      var p = vec3(x, y, 0);
      // var v = B(subtract(p, fixedDipole.p()));
      var v = B_dir_pos(p);
      if (v != 0) {
        pushMatrix();
        mvMatrix = mult(mvMatrix, translate(p));
        var vnorm = normalize(v);
        var phi = Math.acos(dot(vec3(1, 0, 0), vnorm));
        if (phi != 0) {
          var axis = cross(vec3(1, 0, 0), vnorm);
          mvMatrix = mult(mvMatrix, rotate(degrees(phi), axis));
        }
        mvMatrix = mult(mvMatrix, scalem(sf, sf, sf));
        success = success && renderArrow();
        popMatrix();
      }
    }
  }
  popMatrix();
  return success;
}

Renderer.prototype.doRender = function() {
  resize(canvas);
  aspect = canvas.width/canvas.height;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  var at = vec3(0.0, 0.0, 0.0);
  var up = vec3(0.0, 1.0, 0.0);
  var eye = vec3(0, 0, 1);

  if (canvas.width > canvas.height) {
    fh = frustumDim;
    fw = (fh*canvas.width)/canvas.height;
  } else {
    fw = frustumDim;
    fh = (fw*canvas.height)/canvas.width;
  }
  fw *= zoom;
  fh *= zoom;
  pMatrix = ortho(0-fw/2, fw/2, 0-fh/2, fh/2, 0, 2);

  mvMatrix = lookAt(eye, at , up);  
  if (rotAngle != 0) {
    mvMatrix = mult(mvMatrix, rotate(rotAngle*180.0/Math.PI, rotVec));
  }
  mvMatrix = mult(mvMatrix, rotMatrix);

  gl.disable(gl.DEPTH_TEST);

  var success = true;

  if (showDomain) {
    success = success && this.renderDomain();
  }

  if (showB) {
    success = success && this.renderB();
  }

  if (showPath) {
    path2.render();
    path.render();
  }

  if (showCircles) {
    if (showPath) {
      success = success && this.renderCircleOutlines();
    } else {
      success = success && this.renderCircles();
    }
  }

  var dipole = freeDipole;

  if (!showPath) {
    // force
    var f = F(freeDipole, false);
    success = success && this.renderForceArrow(
      dipole, f, this.Fcolor, 1.0);

    // torque
    var t = T(freeDipole, false);
    success = success && this.renderTorqueArrow(dipole, t, this.Tcolor, 1.0);

    // render velocity arrow
    var vl = length(dipole.v()) * 100;
    var vs = mult(normalized(dipole.v()), Math.pow(vl, 1/2));
    success = success && this.forceArrow.render(dipole.p(), vs,
                                                mesh2Obj/2, this.vcolor, false);

    // render angular velocity arrow
    var ws = Math.pow(Math.abs(dipole.av()), 1/2) * (dipole.av()<0?-1:1);
    success = success && this.renderAVArrow(dipole, ws, this.wcolor);

    // render B at dipole
    // var B1 = B(dipole.p());
    var B1 = B_dir_pos(dipole.p());
    success = success && this.forceArrow.render(
      dipole.p(), mult(normalize(B1), 3.1*mesh2Obj), 1/3.7, this.Bcolor, false);
  }

  plot.render();

  logger.renderPanel();

  return success;
}

