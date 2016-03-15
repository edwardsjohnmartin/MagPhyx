"use strict";

// diameter
var D = 1;
var radius = D/2;
// frustum height. Frustum width will be computed using the height
// and aspect ratio of the viewport. The frustum will be centered
// at the origin.
var frustumDim = D*6;

// Mesh models (circle, force arrows) are based on a circle radius
// of one. These must be scaled to match the diameter.
var mesh2Obj = D/2;
// Scale factor for the dipole field texture
var fieldTexCoord2Obj = D * 13.0;

var log = "";
// var LOG_COLLISION = "collision";
// var LOG_INITIAL = "initial";

var elapsedTime = 0;
var animate = false;

// var numCollisions = 0;
var numEvents = 0;

var updateP = true;
var updateM = true;

var demos = new Object();

var red = vec4(1, 0, 0, 1);
var green = vec4(0, 1, 0, 1);
var darkGreen = vec4(0, 0.7, 0.2, 1);
var blue = vec4(0, 0, 1, 1);
var cyan = vec4(0, 1, 1, 1);
var darkMagenta = vec4(0.8, 0, 0.8, 1);
var yellow = vec4(1, 1, 0, 1);
var orange = vec4(0.8, 0.6, 0.0);
var burntOrange = vec4(0.81, 0.33, 0.0);
var gray = vec4(.5, .5, .5, 1);
var lightGray = vec4(0.8, 0.8, 0.8, 1);
var black = vec4(0, 0, 0, 1);
var white = vec4(1, 1, 1, 1);

var Fcolor = orange;
var Tcolor = orange;
var FnetColor = vec4(1.0, 0.6, 0.6, 1.0);
var TnetColor = vec4(0.6, 0.6, 1.0, 1.0);
var vcolor = darkGreen;
var wcolor = darkGreen;
var Bgray = gray;
var Bcolor = lightGray;

var canvas;
var canvasX, canvasY;
var canvasWidth, canvasHeight;

// Frustum width and height
var fw, fh;
var gl;

var axis;
var floor;
var arrow;
var segment;
var sphere;
var circle;
var phiArrow;
var path;
var sin2;
var forceArrow;
var bArrow;
var torqueArrow;
var square;
// var dipoles = new Array();
var fixedDipole;
var freeDipole;

var lineProgram;
var circleProgram;
var flatProgram;
var sphereProgram;
var textureProgram;

var plot;

var texture;

var aspect = 1.0;

var mvMatrix, pMatrix, nMatrix;

// Interaction
var mouseDown = false;
var mouseDownPos;
var mousePos;
var button = 0;
var rotVec = vec3(1, 0, 0);
var rotAngle = 0;
var rotMatrix = mat4(1.0);
var zoom = .8;
var downZoom = 1;
var LEFT_BUTTON = 0;
var RIGHT_BUTTON = 2;

var simSpeed;
var gamma, gamma_star;
var mu_m;
var collisionType;
var ELASTIC = 0;
var INELASTIC = 1;
var eta, eta_star;

// What to render
var showB = true;
var showCircles = true;
// var showOutlineMode = false;
var showPath = false;

// var logEntries = [ "t", "num_collisions", "r", "theta", "phi", "pr", "ptheta",
//                    "pphi", "U", "T", "R", "E", "dE" ];
var logEntries = [ "t", "num_events", "r", "theta", "phi", "pr", "ptheta",
                   "pphi", "E", "dE" ];
var logEntrySet = new Set(logEntries);

var showDebug = true;
var verboseDebug = false;
var debugValues = new Object();
var DebugLabel = function(name, label) {
  this.name = name;
  this.label = label;
}

var id2label = new Object();
id2label["theta"] = "&theta;";
id2label["phi"] = "&phi;";
id2label["pr"] = "p<sub>r</sub>";
id2label["ptheta"] = "p<sub>&theta;</sub>";
id2label["pphi"] = "p<sub>&phi;</sub>";
id2label["dE"] = "&Delta;E";
// id2label["num_collisions"] = "n";
id2label["num_events"] = "n";
id2label["v_at_collision"] = "v<sub>coll</sub>";
id2label["t_at_collision"] = "t<sub>coll</sub>";
id2label["time_at_zero_crossing"] = "t<sub>zero</sub>";
id2label["w_at_zero_crossing"] = "&omega;<sub>zero</sub>";
id2label["theta_range"] = "&theta; range";
id2label["phi_range"] = "&phi; range";
id2label["t_eddy_mag"] = "|&tau;<sub>eddy</sub>|";
id2label["f_eddy_mag"] = "|F<sub>eddy</sub>|";
id2label["U"] = "U";
id2label["T"] = "T";
id2label["R"] = "R";
id2label["E"] = "E";
id2label["w"] = "&omega;";
id2label["v_mag"] = "|v|";
id2label["m"] = "m (&deg;)";
id2label["B_mag"] = "|B|";
id2label["tau"] = "|&tau;|";
id2label["tau_net"] = "|&tau;<sub>net</sub>|";
id2label["F"] = "F";
id2label["F_mag"] = "|F|";
id2label["F_mag_net"] = "|F<sub>net</sub>|";
id2label["elapsed_time"] = "t";
id2label["time_step"] = "&Delta;t";

var id2logLabel = new Object();
id2logLabel["num_events"] = "n";
id2logLabel["elapsed_time"] = "t";

// var labeled = new Set();
// for (var i = 0; i < debugLabels.length; ++i) {
//   var label = debugLabels[i];
//   labeled.add(label.name);
// }

// Stack stuff
var matrixStack = new Array();
function pushMatrix() {
  matrixStack.push(mat4(mvMatrix));
}
function popMatrix() {
  mvMatrix = matrixStack.pop();
}

function renderAxis() {
  if (!lineProgram.initialized) return;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, axis.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, axis.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, axis.numPoints);
};

function renderFloor() {
  if (!lineProgram.initialized) return false;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, floor.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, floor.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, floor.numPoints);

  return true;
};

function renderArrow() {
  if (!lineProgram.initialized) return false;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, arrow.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, arrow.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, arrow.numPoints);

  return true;
};

function renderSegment() {
  if (!lineProgram.initialized) return false;
  gl.useProgram(lineProgram.program);

  gl.enableVertexAttribArray(lineProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, segment.vertexBuffer);
  gl.vertexAttribPointer(lineProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(lineProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, segment.colorBuffer);
  gl.vertexAttribPointer(lineProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(lineProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(lineProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.LINES, 0, segment.numPoints);

  return true;
};

function renderSphere() {
  if (!sphereProgram.initialized) return false;
  gl.useProgram(sphereProgram.program);

  gl.enableVertexAttribArray(sphereProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, sphere.vertexBuffer);
  gl.vertexAttribPointer(sphereProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(sphereProgram.normalLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, sphere.normalBuffer);
  gl.vertexAttribPointer(sphereProgram.normalLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(sphereProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, sphere.colorBuffer);
  gl.vertexAttribPointer(sphereProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(sphereProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(sphereProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(sphereProgram.nMatrixLoc, false, flatten(nMatrix));

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indexBuffer);
  gl.drawElements(gl.TRIANGLES, sphere.numIndices, gl.UNSIGNED_SHORT, 0);

  return true;
};

function getFreeDipoleColor() {
  var U_ = U(freeDipole);
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

function renderCircle(fixed) {
  if (!circleProgram.initialized) return;
  gl.useProgram(circleProgram.program);

  gl.enableVertexAttribArray(circleProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, circle.vertexBuffer);
  gl.vertexAttribPointer(circleProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(circleProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(circleProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(circleProgram.nMatrixLoc, false, flatten(nMatrix));

  // Circle
  if (fixed) {
    gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
  } else {
    var color = getFreeDipoleColor();
    gl.uniform4fv(circleProgram.colorLoc, flatten(color));
  }
  gl.drawArrays(gl.TRIANGLE_FAN, 0, circle.numCirclePoints);

  // Arrow base and triangle
  gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(0.2, 0.2, 0.2, 1.0)));
  gl.drawArrays(gl.TRIANGLE_FAN,
                circle.numCirclePoints, 4);
  gl.drawArrays(gl.TRIANGLES, circle.numCirclePoints + 4, 3);

  return true;
};

function renderCircleOutline(fixed) {
  if (!circleProgram.initialized) return;
  gl.useProgram(circleProgram.program);

  gl.enableVertexAttribArray(circleProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, circle.vertexBuffer);
  gl.vertexAttribPointer(circleProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(circleProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(circleProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniformMatrix4fv(circleProgram.nMatrixLoc, false, flatten(nMatrix));

  // Circle
  if (fixed) {
    gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)));
  } else {
    var color = getFreeDipoleColor();
    gl.uniform4fv(circleProgram.colorLoc, flatten(color));
  }
  gl.drawArrays(gl.LINE_LOOP, 1, circle.numCirclePoints-1);

  // Arrow base and triangle
  gl.bindBuffer(gl.ARRAY_BUFFER, phiArrow.vertexBuffer);
  gl.vertexAttribPointer(circleProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniform4fv(circleProgram.colorLoc, flatten(vec4(0.2, 0.2, 0.2, 1.0)));
  // gl.drawArrays(gl.LINE_STRIP,
  //               0, phiArrow.numBasePoints);
  gl.drawArrays(gl.LINE_LOOP, 0, phiArrow.n);//phiArrow.numBasePoints, phiArrow.numHeadPoints);

  return true;
};

function renderForceArrow(dipole, f, color, thin) {
  var mag = 4 * Math.pow(length(f), 1/4);
  f = mult(normalize(f), mag);
  return forceArrow.render(dipole.p, f, mesh2Obj, color, true, thin);
};

function renderTorqueArrow(dipole, t, color, thin) {
  if (!flatProgram.initialized) return false;

  var p = dipole.p;

  if (length(t) == 0) {
    return true;
  }

  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, torqueArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.uniform4fv(flatProgram.colorLoc, flatten(color));

  var mag = 0.5 * Math.pow(length(t), 1/3);
  var deg = Math.min(358, 360 * mag);

  pushMatrix();
  // get in position
  mvMatrix = mult(mvMatrix, translate(p[0], p[1], p[2]));
  // global scale
  var gs = mesh2Obj;
  mvMatrix = mult(mvMatrix, scalem(gs, gs, 1));

  if (t[2] < 0) {
    mvMatrix = mult(mvMatrix, scalem(1, -1, 1));
  }

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 1 + Math.floor(deg) * 2 + 6);

  gl.bindBuffer(gl.ARRAY_BUFFER, forceArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);
  mvMatrix = mult(mvMatrix, rotateZ(deg));
  mvMatrix = mult(mvMatrix, translate(torqueArrow.r, 0, 0));
  mvMatrix = mult(mvMatrix, rotateZ(90));
  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLES, 4, 3);

  popMatrix();

  return true;
};

// Angular velocity - w
function renderAVArrow(dipole, w, color) {
  if (!flatProgram.initialized) return false;

  var p = dipole.p;

  if (w == 0) {
    return true;
  }

  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, torqueArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  nMatrix = normalMatrix(mvMatrix, false);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.uniform4fv(flatProgram.colorLoc, flatten(color));

  var mag = 0.5 * Math.abs(w);
  var deg = Math.min(330, 360 * mag);

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

  gl.bindBuffer(gl.ARRAY_BUFFER, forceArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);
  mvMatrix = mult(mvMatrix, rotateZ(deg));
  mvMatrix = mult(mvMatrix, translate(torqueArrow.r, 0, 0));
  mvMatrix = mult(mvMatrix, rotateZ(90));
  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.drawArrays(gl.TRIANGLES, 4, 3);

  popMatrix();

  return true;
};

function renderB() {
  if (!flatProgram.initialized) return false;
  //--------------------------------
  // Render the magnetic field lines
  //--------------------------------
  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, sin2.vertexBuffer);
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

    gl.uniform4fv(flatProgram.colorLoc, flatten(Bgray));

    gl.drawArrays(gl.LINE_STRIP, 0, sin2.size);
    popMatrix();
  }

  // //--------------------------------
  // // Render the direction arrows
  // //--------------------------------
  gl.useProgram(flatProgram.program);

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  // gl.bindBuffer(gl.ARRAY_BUFFER, forceArrow.vertexBuffer);
  gl.bindBuffer(gl.ARRAY_BUFFER, bArrow.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniform4fv(flatProgram.colorLoc, flatten(Bgray));

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
          renderBArrow(p, gs);
        }
      }
    } else {
      count++;
      renderBArrow(vec3(0, s, 0), gs);
      renderBArrow(vec3(0, -s, 0), gs);
    }
  }

  return true;
};

function renderBArrow(p, gs) {
  if (!flatProgram.initialized) return false;

  // var v = B(fixedDipole.m, p);
  var v = B(p);

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
                  translate(Math.max(-forceArrow.arrowWidth/2), 0, 0));

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  popMatrix();

  return true;
}

function renderTexture() {
  if (!textureProgram.initialized) return false;

  gl.useProgram(textureProgram.program);

  gl.enableVertexAttribArray(textureProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, square.vBuffer);
  gl.vertexAttribPointer(textureProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(textureProgram.colorLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, square.cBuffer);
  gl.vertexAttribPointer(textureProgram.colorLoc, 4, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(textureProgram.texCoordLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, square.tBuffer);
  gl.vertexAttribPointer(textureProgram.texCoordLoc, 2, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(textureProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(textureProgram.pMatrixLoc, false, flatten(pMatrix));

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, square.numVertices);

  return true;
};

function updateForces(updateInitial) {
  freeDipole.F = F(fixedDipole, freeDipole, true);
  freeDipole.T = T(fixedDipole, freeDipole, true);
  if (updateInitial) {
    freeDipole.F0 = freeDipole.F;
    freeDipole.T0 = freeDipole.T;
    freeDipole.fixed = false;
    // freeDipole.v = vec3(0, 0, 0);
    // freeDipole.av = 0;
    animate = false;
  }

  // for (var j = 0; j < dipoles.length; ++j) {
  //   dipoles[j].F = vec3(0, 0, 0);
  //   dipoles[j].T = vec3(0, 0, 0);
  //   for (var i = 0; i < dipoles.length; ++i) {
  //     if (i != j) {
  //       // dipoles[j].F = add(dipoles[j].F, F(i, j));
  //       dipoles[j].F = add(dipoles[j].F,
  //                          F(dipoles[i], dipoles[j], true));
  //       dipoles[j].T = add(dipoles[j].T,
  //                          T(dipoles[i], dipoles[j], true));
  //       // dipoles[j].T = dipoles[j].T + T(dipoles[i], dipoles[j]);
  //     }
  //   }
  //   if (updateInitial) {
  //     dipoles[j].F0 = dipoles[j].F;
  //     dipoles[j].T0 = dipoles[j].T;
  //     dipoles[j].fixed = false;
  //     dipoles[j].v = vec3(0, 0, 0);
  //     dipoles[j].av = 0;
  //     animate = false;
  //   }
  // }

  updateDebug(freeDipole);
}

// Computes the acceleration of a free dipole at position p with moment m
function a(p, v, theta, dt) {
  var m = vec3(Math.cos(theta), Math.sin(theta), 0);
  var dipole = new Dipole(p, m, false);
  dipole.v = v;
  return F(fixedDipole, dipole, true);
}

// Angular acceleration from the torque
function alpha(p, v, theta, alphaValue, dt) {
  var m = vec3(Math.cos(theta), Math.sin(theta), 0);
  var dipole = new Dipole(p, m, false);
  dipole.av = alphaValue;
  var t = mult(T(fixedDipole, dipole, true), 10);
  var ret = length(t) * ((t[2] < 0) ? -1 : 1);
  return ret;
}

function rk4(x, v, theta, omega, dt, m) {
  // Returns final (position, velocity) tuple after
  // time dt has passed.

  // x: initial position (number-like object)
  // v: initial velocity (number-like object)
  // a: acceleration
  // theta: initial moment
  // omega: initial angular velocity
  // alpha: angular acceleration
  // dt: timestep (number)
  var x1 = x;
  var v1 = v;
  var theta1 = theta;
  var omega1 = omega;
  var a1 = a(x1, v1, theta1, 0);
  var alpha1 = alpha(x1, v1, theta1, omega1, 0);

  var x2 = add(x, mult(v1, 0.5*dt));
  var v2 = add(v, mult(a1, 0.5*dt));
  var theta2 = theta + omega1 * 0.5*dt;
  var omega2 = omega + alpha1 * 0.5*dt;
  var a2 = a(x2, v2, theta2, dt/2.0);
  var alpha2 = alpha(x2, v2, theta2, omega2, dt/2.0);

  var x3 = add(x, mult(v2, 0.5*dt));
  var v3 = add(v, mult(a2, 0.5*dt));
  var theta3 = theta + omega2 * 0.5*dt;
  var omega3 = omega + alpha2 * 0.5*dt;
  var a3 = a(x3, v3, theta3, dt/2.0);
  var alpha3 = alpha(x3, v3, theta3, omega3, dt/2.0);

  var x4 = add(x, mult(v3, dt));
  var v4 = add(v, mult(a3, dt));
  var theta4 = theta + omega3 * dt;
  var omega4 = omega + alpha3 * dt;
  var a4 = a(x4, v4, theta4, dt);
  var alpha4 = alpha(x4, v4, theta4, omega4, dt);

  var xf =
    add(x, mult(dt/6.0, add(v1, add(mult(2, v2), add(mult(2, v3), v4)))));
  var vf =
    add(v, mult(dt/6.0, add(a1, add(mult(2, a2), add(mult(2, a3), a4)))));
  var thetaf = theta + (dt/6.0) * (omega1 + 2*omega2 + 2*omega3 + omega4);
  var omegaf = omega + (dt/6.0) * (alpha1 + 2*alpha2 + 2*alpha3 + alpha4);

  var ret = new Object();
  ret.p = xf;
  ret.v = vf;
  ret.theta = thetaf;
  ret.omega = omegaf;
  return ret;
}

// Given a sphere c1 and translation dx, and given that c1 is not
// intersecting c0, return the t parameter at which c1 will intersect c0.
function computeIntersection(c0, c1, dx) {
  // Change dx such that dipole runs into other dipole.
  var x0 = c0[0];
  var y0 = c0[1];
  var x1 = c1[0];
  var y1 = c1[1];
  var xw = dx[0];
  var yw = dx[1];
  // a, b and c for quadratic equation
  var qa = xw*xw + yw*yw;
  var qb = 2 * (x1*xw-x0*xw) + 2 * (y1*yw-y0*yw);
  var qc = x1*x1-2*x1*x0+x0*x0 + y1*y1-2*y1*y0+y0*y0 - D*D;
  var qt0 = (-qb + Math.sqrt(qb*qb - 4*qa*qc)) / (2 * qa);
  var qt1 = (-qb - Math.sqrt(qb*qb - 4*qa*qc)) / (2 * qa);
  var qt = Math.min(qt0, qt1);
  if (qt < 0) {
    qt = Math.max(qt0, qt1);
  }
  return qt;
}

function isTouching(p0, p1) {
  var EPSILON = 0.0000000001;
  return (Math.abs(length(subtract(p0, p1)) - D) < EPSILON);
}

function updateMoment(rk) {
  var oldTheta = Math.atan2(freeDipole.m[1], freeDipole.m[0]);
  var newTheta = rk.theta;
  freeDipole.m = vec3(Math.cos(rk.theta), Math.sin(rk.theta));
  freeDipole.av = rk.omega;

  if ((oldTheta < 0 && newTheta > 0) ||
      (oldTheta > 0 && newTheta < 0)) {
    // debugValues.w_at_zero_crossing = freeDipole.av.toFixed(4);
    // debugValues.time_at_zero_crossing = elapsedTime.toFixed(4);
  }
}

function updatePosition(p, v) {
  freeDipole.p = p;
  freeDipole.v = v;
}

// Assumes forces are up-to-date.
function updatePositions() {
  var dt = simSpeed * 1/10000;
  elapsedTime += dt;

  // 4th order runge-kutta
  var rk = rk4(freeDipole.p, freeDipole.v,
               Math.atan2(freeDipole.m[1], freeDipole.m[0]), freeDipole.av,
               dt, freeDipole.m);

  //----------------------------------------
  // torque
  //----------------------------------------

  if (updateM) {
    updateMoment(rk);
  }

  //----------------------------------------
  // force
  //----------------------------------------

  if (updateP && !freeDipole.fixed) {
    var c0 = fixedDipole.p;
    var c1 = freeDipole.p;

    var R01 = subtract(c1, c0);
    var R10 = subtract(c0, c1);
    // var touching = Math.abs(length(R01) - D) < 0.00000001;
    var touching = isTouching(c0, c1);

    var dx = subtract(rk.p, freeDipole.p);

    if (!touching || dot(rk.v, mult(R01, -1)) < 0) {
      // We're not touching or we're traveling away from the fixed dipole

      // Find the distance a from the center of the fixed dipole
      // to the displacement line.
      //
      //        dx  ____ c1+dx
      //       ____/
      //   c1 /_________ c0
      //           R10

      // dist will be the closest approach of c1 to c0.
      // If the shadow of R10 onto dx (using dot product) is either negative
      var dist;
      var shadow = dot(R10, dx) / length(dx);
      if (shadow > length(dx)) {
        // c1 won't pass c0, so find the ending point of c1.
        // dist = length(subtract(c0, add(c1, dx)));
        dist = length(subtract(c0, rk.p));
      } else if (shadow < 0) {
        // c1 is traveling away from c0, so find the ending point
        dist = length(subtract(c0, rk.p));
      } else {
        // c1 will pass c0, so find the distance at closest approach
        dist = length(cross(R10, dx)) / length(dx);
      }

      if (dist < D) {
        // c1 will collide with c0. 
        var qt = computeIntersection(c0, c1, dx);
        if (collisionType == ELASTIC) {
          elapsedTime -= dt;
          var half = 0.5 * simSpeed * 1/10000;
          var done = false;
          dt = half;
          var iterations = 0;
          // Binary search for a really close hit
          while (!done && iterations < 100) {
            var theta = Math.atan2(freeDipole.m[1], freeDipole.m[0]);
            var newrk = rk4(
              freeDipole.p, freeDipole.v,
              theta, freeDipole.av,
              dt, freeDipole.m);
            
            half /= 2;
            if (length(subtract(newrk.p, fixedDipole.p)) < D) {
              // intersects
              dt -= half;
            } else {
              // no intersection
              updateMoment(newrk);
              updatePosition(newrk.p, newrk.v);
              elapsedTime += dt;
              dt = half;
            }
            done = isTouching(c0, freeDipole.p);
            ++iterations;
          }

          // specular reflection
          var normal = normalize(subtract(freeDipole.p, fixedDipole.p));
          var l = normalize(mult(freeDipole.v, -1));
          var refln = 2 * dot(l, normal);
          refln = mult(refln, normal);
          refln = normalize(subtract(refln, l));
          var newv = mult(refln, length(freeDipole.v));
          // Fire event BEFORE the position and vector are updated so
          // we get velocity values before the collision
          event();
          updatePosition(freeDipole.p, newv);
        } else {
          // inelastic collision - really should set v to something meaningful
          var newv = vec3(0, 0, 0);
          var newp = add(freeDipole.p, mult(dx, qt));
          // Fire event BEFORE the position and vector are updated so
          // we get velocity values before the collision
          event();
          updatePosition(newp, newv);
        }
        // debugValues.v_at_collision = length(rk.v).toFixed(5);
        // debugValues.t_at_collision = elapsedTime.toFixed(5);
        // numCollisions++;
        // debugValues.num_collisions = numCollisions;
      } else {
        // no collision
          // event();
        updatePosition(rk.p, rk.v);
      }
    } else {
      // already touching
      var tangent = normalize(cross(R01, vec3(0, 0, 1)));
      var newv = mult(tangent, dot(rk.v, tangent));
      // newp_tangent is the new position if traveling
      // in the tangent direction
      var newp_tangent = add(freeDipole.p, mult(newv, dt));
      // Traveling in the tangent direction will pull c1 off of c0,
      // so pull c1 toward c0 until they touch
      var u = mult(normalize(subtract(newp_tangent, fixedDipole.p)), D);
      var newp = add(fixedDipole.p, u);
      updatePosition(newp, newv);
      // event();
    }
  }

  updateDebug(freeDipole);
}

function event() {
  numEvents++;
  debugValues.num_events = numEvents;

  plot.push(vec4(freeDipole.theta(), freeDipole.phi(), 0, 1));
  updateLog();
}

function resetLog() {
  log = "";
  for (var i = 0; i < logEntries.length; i++) {
    var property = logEntries[i];
    var label = getLogLabel(property);
    log += label + ",";
  }
  log += "\n";

  // log = "event, t, r, theta, alpha, dr/dt, d(theta)/dt, d(alpha)/dt, |v|, U, T, R, E\n";
  // log = "event, t, x, y, alpha, dx/dt, dy/dt, d(alpha)/dt, |v|, U, T, R, E\n";
  // updateLog(LOG_INITIAL);
}

function updateLog(event) {
  for (var i = 0; i < logEntries.length; i++) {
    var property = logEntries[i];
    var value = "";
    if (debugValues.hasOwnProperty(property)) {
      value = debugValues[property];
    }
    log += value + ",";
  }
  log += "\n";

  // var dipole = freeDipole;
  // var rvec = subtract(dipole.p, fixedDipole.p);
  // // Number of digits
  // var m = 6;

  // var U_ = U(dipole);
  // var T_ = Trans(dipole);
  // var R_ = R(dipole);
  // var E_ = U_ + T_ + R_;

  // var p = dipole.p;
  // var v = dipole.v;
  // var r = length(rvec);
  // // d(theta)/dt = (x/r^2)dy/dt – (y/r^2)dx/dt
  // var dTheta = p[0]/(r*r) * v[1] - p[1]/(r*r) * v[0];

  // // event, t, x, y, alpha, dx/dt, dy/dt, d(alpha)/dt, |v|, U, T, R, E

  // // event
  // log += event + ",";
  // // t
  // log += elapsedTime.toFixed(m) + ",";
  // // x
  // log += p[0].toFixed(m) + ",";
  // // y
  // log += p[1].toFixed(m) + ",";
  // // // r
  // // log += r.toFixed(m) + ",";
  // // // theta - angle of position vector
  // // log += Math.atan2(p[1], p[0]).toFixed(m) + ",";
  // // alpha
  // log += Math.atan2(dipole.m[1], dipole.m[0]).toFixed(m) + ",";
  // // // dr/dt
  // // log += "\"" + ??? + "\","
  // // // d(theta)/dt
  // // log += "\"" + dTheta + "\",";
  // // dx/dt
  // log += v[0].toFixed(m) + ","
  // // dy/dt
  // log += v[1].toFixed(m) + ","
  // // d(alpha)/dt
  // log += dipole.av.toFixed(m) + ","
  // // |v|
  // log += length(dipole.v).toFixed(m) + ","
  // // U
  // log += U_.toFixed(m) + ","
  // // T
  // log += T_.toFixed(m) + ",";
  // // R
  // log += R_.toFixed(m) + ",";
  // // E
  // log += E_.toFixed(m);

  // log += "\n";
}

function exportLog() {
  window.open('data:text/csv;charset=utf-8,' + escape(log));
}

// var button = document.getElementById('b');
// button.addEventListener('click', exportToCsv);

function vecString(v, fixed) {
  return v.map(function(n) { return n.toFixed(fixed) });
}

function U(dipole) {
  // return -dot(dipole.m, B(fixedDipole.m, dipole.p));
  return -dot(dipole.m, B(dipole.p));
}

function Trans(dipole) {
  return Math.pow(length(dipole.v), 2) / 2;
}

function R(dipole) {
  return (dipole.av * dipole.av) / 20;
}

function updateDebug(dipole) {
  // Potential energy
  // var U_ = -dot(dipole.m, B(fixedDipole.m, dipole.p));
  var U_ = U(dipole);//-dot(dipole.m, B(fixedDipole.m, dipole.p));
  // Translational kinetic energy
  var T_ = Trans(dipole);
  // Rotational kinetic energy
  var R_ = R(dipole);
  // Total energy
  var E_ = U_ + T_ + R_;
  // debugValues.U = U_.toFixed(4);
  // debugValues.T = T_.toFixed(4);
  // debugValues.R = R_.toFixed(4);
  debugValues.E = E_.toFixed(8);
  debugValues.dE = (E_-dipole.E0).toFixed(8);

  // debugValues.v = dipole.v.map(function(n) { return n.toFixed(2) });
  // debugValues.w = dipole.av.toFixed(4);
  // debugValues.m = degrees(Math.atan2(dipole.m[1], dipole.m[0])).toFixed(4);

  debugValues.r = dipole.r().toFixed(4);
  debugValues.theta = degrees(dipole.theta()).toFixed(4);
  debugValues.phi = degrees(dipole.phi()).toFixed(4);

  debugValues.pr = dipole.pr().toFixed(4);
  debugValues.ptheta = dipole.ptheta().toFixed(4);
  debugValues.pphi = dipole.pphi().toFixed(4);

  debugValues.t = elapsedTime.toFixed(4);
  // debugValues.num_collisions = numCollisions;
}

var ticks = 0;
var tickElapsedTime = 0;
var ticksPerUpdate = 10;
function tick() {
  // if (!freeDipole.fixed && animate) {
  if (animate) {
    ticks++;
    requestAnimFrame(tick);
    // var animSpeed = document.getElementById("animSpeed").value;
    var animSpeed = 500;

    var start = new Date().getTime();
    // for (var i = 0; !freeDipole.fixed && i < animSpeed; ++i) {
    for (var i = 0; i < animSpeed; ++i) {
      updatePositions();
    }

    var stop = new Date().getTime();
    tickElapsedTime += (stop-start);
    if (ticks == ticksPerUpdate) {
      var stepsPerSec = (animSpeed*ticksPerUpdate / tickElapsedTime) * 1000;
      debugValues.fps = (stepsPerSec / 500).toFixed(1);
      tickElapsedTime = 0;
      ticks = 0;
    }

    path.push(vec4(freeDipole.p[0], freeDipole.p[1], 0, 1));
    updateForces();
    render();
  }
}

function renderCircles() {
  pushMatrix();
  var s = mesh2Obj;
  var success = true;
  var dipoles = [ fixedDipole, freeDipole ];
  for (var i = 0; i < dipoles.length; i++) { 
    pushMatrix();
    mvMatrix = mult(mvMatrix, translate(dipoles[i].p));
    var phi = Math.acos(dot(vec3(1, 0, 0), dipoles[i].m));
    if (phi != 0) {
      var axis = cross(vec3(1, 0, 0), dipoles[i].m);
      mvMatrix = mult(mvMatrix, rotate(degrees(phi), axis));
    }
    mvMatrix = mult(mvMatrix, scalem(s, s, 1));
    success = success && renderCircle(i == 0);
    popMatrix();
  }
  popMatrix();

  return success;
}

function renderCircleOutlines() {
  pushMatrix();
  var s = mesh2Obj;
  var success = true;
  var dipoles = [ fixedDipole, freeDipole ];
  for (var i = 0; i < dipoles.length; i++) { 
    pushMatrix();
    mvMatrix = mult(mvMatrix, translate(dipoles[i].p));
    var phi = Math.acos(dot(vec3(1, 0, 0), dipoles[i].m));
    if (phi != 0) {
      var axis = cross(vec3(1, 0, 0), dipoles[i].m);
      mvMatrix = mult(mvMatrix, rotate(degrees(phi), axis));
    }
    mvMatrix = mult(mvMatrix, scalem(s, s, 1));
    if (i == 0) {
      success = success && renderCircle(i == 0);
    } else {
      success = success && renderCircleOutline(i == 0);
    }
    popMatrix();
  }
  popMatrix();

  return success;
}

function renderMagneticField(origin) {
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
      // var v = B(fixedDipole.m, p);
      // var v = BSum(dipoles, p);
      // var v = B(fixedDipole.m, subtract(p, fixedDipole.p));
      var v = B(subtract(p, fixedDipole.p));
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

function renderPath() {
  if (!flatProgram.initialized) return false;
  gl.useProgram(flatProgram.program);

  pushMatrix();
  var s = 1;///mesh2Obj;
  mvMatrix = mult(mvMatrix, scalem(s, s, 1));

  gl.enableVertexAttribArray(flatProgram.vertexLoc);
  gl.bindBuffer(gl.ARRAY_BUFFER, path.vertexBuffer);
  gl.vertexAttribPointer(flatProgram.vertexLoc, 4, gl.FLOAT, false, 0, 0);

  gl.uniformMatrix4fv(flatProgram.mvMatrixLoc, false, flatten(mvMatrix));
  gl.uniformMatrix4fv(flatProgram.pMatrixLoc, false, flatten(pMatrix));
  gl.uniform4fv(flatProgram.colorLoc, flatten(red));

  gl.drawArrays(gl.LINE_STRIP, 0, path.n);

  popMatrix();

  return true;
}

function getLabel(property) {
  var label = property;
  if (id2label.hasOwnProperty(property)) {
    label = id2label[property];
  }
  return label;
}

function getLogLabel(property) {
  var label = property;
  if (id2logLabel.hasOwnProperty(property)) {
    label = id2logLabel[property];
  }
  return label;
}

function renderDebug() {
  var debug = document.getElementById("debug");
  var html = "";
  if (showDebug) {
    html = "<table border=\"0\">";
    var first = true;
    // Render debug values that don't have a custom label
    for (var property in debugValues) {
      if (debugValues.hasOwnProperty(property)) {
        // var label = property;
        // if (!labeled.has(property)) {
        //   html += "<tr>";
        //   html += "<td>" + label + ":</td>";
        //   html += "<td>" + debugValues[property] + "</td>";
        //   html += "</tr>";
        // }
        if (!logEntrySet.has(property) && verboseDebug) {
          var label = getLabel(property);
          html += "<tr>";
          html += "<td>" + label + ":</td>";
          html += "<td>" + debugValues[property] + "</td>";
          html += "</tr>";
        }
      }
    }
    // for (var i = 0; i < debugLabels.length; i++) {
    //   var label = debugLabels[i].label;
    //   var property = debugLabels[i].name;
    //   var value = "";
    //   if (debugValues.hasOwnProperty(property)) {
    //     value = debugValues[property];
    //   }
    //   html += "<tr>";
    //   html += "<td>" + label + ":</td>";
    //   html += "<td>" + value + "</td>";
    //   html += "</tr>";
    // }
    for (var i = 0; i < logEntries.length; i++) {
      // var property = debugLabels[i].name;
      // var label = debugLabels[i].label;
      var property = logEntries[i];
      var label = getLabel(property);
      var value = "";
      if (debugValues.hasOwnProperty(property)) {
        value = debugValues[property];
      }
      html += "<tr>";
      html += "<td>" + label + ":</td>";
      html += "<td>" + value + "</td>";
      html += "</tr>";
    }
  }
  debug.innerHTML = html;
}

function render() {
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

  if (showB) {// && !showOutlineMode) {
    success = success && renderB();
  }

  if (showPath) {
    renderPath();
  }

  if (showCircles) {
    // if (showOutlineMode) {
    if (showPath) {
      success = success && renderCircleOutlines();
    } else {
      success = success && renderCircles();
    }
  }
  // if (showB && !showOutlineMode) {
  //   success = success && renderMagneticField(freeDipole.p);
  // }

  var dipole = freeDipole;

  // if (!showOutlineMode) {
  if (!showPath) {
    // force
    var f = F(fixedDipole, freeDipole, false);
    success = success && renderForceArrow(
      dipole, f, Fcolor, 1.0);
    // render force after friction
    // f = F(fixedDipole, freeDipole, true);
    // success = success && renderForceArrow(dipole, f, FnetColor, 0.5);

    // torque
    var t = T(fixedDipole, freeDipole, false);
    success = success && renderTorqueArrow(dipole, t, Tcolor, 1.0);
    // Render torque after friction
    // var tp = T(fixedDipole, freeDipole, true);
    // success = success && renderTorqueArrow(dipole, tp, TnetColor, 0.5);

    // render velocity arrow
    var vl = length(dipole.v) * 100;
    var vs = mult(normalized(dipole.v), Math.pow(vl, 1/2));
    // console.log(dipole.v);
    success = success && forceArrow.render(dipole.p, vs,
                                           mesh2Obj/2, vcolor, false);

    // render angular velocity arrow
    var ws = Math.pow(Math.abs(dipole.av), 1/2) * (dipole.av<0?-1:1);
    success = success && renderAVArrow(dipole, ws, wcolor);
    // success = success && renderAVArrow(dipole, dipole.av, wcolor);

    // render B at dipole
    var B1 = B(dipole.p);
    success = success && forceArrow.render(
      dipole.p, mult(normalize(B1), 3.1*mesh2Obj), 1/3.7, Bcolor, false);
  }

  plot.render();

  renderDebug();

  if (!success) {
    requestAnimFrame(render);
  }
}

function setAnimate(a) {
  animate = a;
  if (animate) {
    document.getElementById("play").innerHTML =
      "<font size=\"6\"><i class=\"fa fa-pause\"></i>";
    tick();
  } else {
    document.getElementById("play").innerHTML =
      "<font size=\"6\"><i class=\"fa fa-play\"></i>";
  }
}

function toggleAnimate() {
  setAnimate(!animate);
}

function zoomIn() {
  zoom = zoom * 0.9;
  render();
}

function zoomOut() {
  zoom = zoom * 1.1;
  render();
}

function adjustSimSpeed(factor) {
  var newSpeed = simSpeed * factor;
  // for (var i = 0; i < 5; ++i) {
  //   if (newSpeed > 
  // }
  document.getElementById("simSpeed").value = newSpeed.toPrecision(2);
  // document.getElementById("simSpeed").value = newSpeed.toFixed(1);
  // var fixed = 2;
  // while (Number(document.getElementById("simSpeed").value) == simSpeed) {
  //   document.getElementById("simSpeed").value = (simSpeed * factor).toFixed(fixed);
  // }
  simSpeedChanged();
}

function keyDown(e) {
  if (e.target != document.body) {
    if (e.target.type != "button") {
      return;
    }
    // switch(e.keyCode) {
    //   case " ".charCodeAt(0):
    //   return;
    // }
  }

  switch (e.keyCode) {
  case 37:
    // left arrow
    break;
  case 38:
    // up arrow
    adjustSimSpeed(1.2);
    break;
  case 39:
    // right arrow
    break;
  case 40:
    // down arrow
    adjustSimSpeed(0.8);
    break;
  case 189:
    // -
    zoomOut();
    break;
  case 187:
    // +
    zoomIn();
    break;
  case " ".charCodeAt(0):
    toggleAnimate();
    break;
  case "N".charCodeAt(0):
    updatePositions();
    updateForces(false);
    render();
    break;
  case "D".charCodeAt(0):
    showDebug = !showDebug;
    render();
    break;
  case "R".charCodeAt(0):
    reset();
    // updateForces(true);
    // render();
    break;
  case "M".charCodeAt(0):
    showB = !showB;
    render();
    break;
  case "P".charCodeAt(0):
    showPath = !showPath;
    // showOutlineMode = !showOutlineMode;
    render();
    break;
  case "C".charCodeAt(0):
    showCircles = !showCircles;
    render();
    break;
  case "S".charCodeAt(0):
    exportLog();
    break;
  case "V".charCodeAt(0):
    verboseDebug = !verboseDebug;
    render();
    break;
  // default:
  //   console.log("Unrecognized key press: " + e.keyCode);
  //   break;
  }

  // requestAnimFrame(render);
}

//------------------------------------------------------------
// Mouse handlers
//------------------------------------------------------------
function onMouseClick(e) {
  var p = win2obj(vec2(e.clientX, e.clientY));
  if (length(subtract(p, mouseDownPos)) < 0.01) {
    // addPoint(p);
    if (e.shiftKey) {
      rotatePoint(p, freeDipole);
    } else {
      movePoint(p, freeDipole);
    }
  }
}

function removeFocus() {
  document.activeElement.blur();
}

var zooming;
function onMouseDown(e) {
  mouseDown = true;
  mouseDownPos = win2obj(vec2(e.clientX, e.clientY));
  button = e.button;
  // if (button == RIGHT_BUTTON) {
  // zooming = false;
  // if (e.shiftKey) {
  //   zooming = true;
  //   downZoom = zoom;
  // }
  if (e.shiftKey) {
    rotatePoint(mouseDownPos, freeDipole);
  } else {
    movePoint(mouseDownPos, freeDipole);
  }
}

function onMouseUp() {
  if (mouseDown) {
    mouseDown = false;
    // if (button == LEFT_BUTTON) {
    if (!zooming) {
      rotMatrix = mult(rotate(rotAngle*180.0/Math.PI, rotVec), rotMatrix);
      rotAngle = 0;
    }
  }
}

function onMouseMove(e) {
  mousePos = win2obj(vec2(e.clientX, e.clientY));

  if (mouseDown && mouseDownPos != mousePos) {
    if (e.shiftKey) {
      rotatePoint(mousePos, freeDipole);
    } else {
      movePoint(mousePos, freeDipole);
    }

    // arcball
    // if (!zooming) {
    //   var down_v = mapMouse(mouseDownPos);
    //   var v = mapMouse(mousePos);
    //   rotVec = normalize(cross(down_v, v));
    //   rotAngle = Math.acos(dot(down_v, v) / length(v));
    // } else {
    //   var factor = 2;
    //   zoom = downZoom * Math.pow(factor, mousePos[1] - mouseDownPos[1]);
    // }
    // render();
  }
}

function mapMouse(p) {
  var x = p[0];
  var y = p[1];
  if (x*x + y*y > 1) {
    var len = Math.sqrt(x*x + y*y);
    x = x/len;
    y = y/len;
  }
  var z = Math.sqrt(Math.max(0.0, 1 - x*x - y*y));
  return vec3(x, y, z);
}

function win2obj(p) {
  var x = fw * (p[0]-canvasX) / canvasWidth;
  var y = fh * (canvasHeight-(p[1]-canvasY)) / canvasHeight;
  x = x - fw/2;
  y = y - fh/2;
  return vec2(x, y);
}

function rotatePoint(mousePos, dipole) {
  var p = vec3(mousePos[0], mousePos[1], 0.0);
  var v = subtract(p, dipole.p);
  var phi = degrees(Math.atan2(v[1], v[0]));
  document.getElementById("phi").value = phi;
  reset();
}

function movePoint(p, dipole) {
  var v = subtract(vec3(p[0], p[1], 0), fixedDipole.p);
  if (length(v) < D) {
    p = add(fixedDipole.p, mult(normalize(v), D));
  }
  // document.getElementById("x").value = p[0];
  // document.getElementById("y").value = p[1];
  document.getElementById("r").value = length(p);
  document.getElementById("theta").value = degrees(Math.atan2(p[1], p[0]));
  reset();
}

function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth  = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;
 
  // Check if the canvas is not the same size.
  if (canvas.width  != displayWidth ||
      canvas.height != displayHeight) {
 
    // Make the canvas the same size
    canvas.width  = displayWidth;
    canvas.height = displayHeight;
  }

  var rect = canvas.getBoundingClientRect();
  canvasX = rect.left;
  canvasY = rect.top;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;
  gl.viewport(0, 0, canvas.width, canvas.height);

  plot.resize();
}

// function configureTexture(image) {
//   if (!textureProgram.initialized) {
//     window.setTimeout(configureTexture, 1000/60, image);
//     return;
//   }

//   texture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, texture);
//   gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
//                 gl.RGB, gl.UNSIGNED_BYTE, image);
//   gl.generateMipmap(gl.TEXTURE_2D);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
//                    gl.NEAREST_MIPMAP_LINEAR);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

//   gl.uniform1i(gl.getUniformLocation(textureProgram.program, "texture"), 0);
// }

function reset() {
  fixedDipole = new Dipole(vec3(0, 0, 0), vec3(1, 0, 0), true);

  var r = Number(document.getElementById("r").value);
  var theta = radians(Number(document.getElementById("theta").value));
  var x = r*Math.cos(theta);
  var y = r*Math.sin(theta);
  var p = vec3(x*D, y*D, 0);
  var phi = radians(Number(document.getElementById("phi").value));
  var m = vec3(Math.cos(phi), Math.sin(phi), 0);
  freeDipole = new Dipole(p, m, false);

  var pr = Number(document.getElementById("pr").value);
  freeDipole.set_pr(pr);
  var ptheta = Number(document.getElementById("ptheta").value);
  freeDipole.set_ptheta(ptheta);
  var pphi = Number(document.getElementById("pphi").value);
  freeDipole.set_pphi(pphi);

  freeDipole.resetE0();

  updateP = document.getElementById("updateP").checked;
  updateM = document.getElementById("updateM").checked;
  showPath = document.getElementById("showPath").checked;

  eta = Number(document.getElementById("eta").value);
  eta_star = Number(document.getElementById("eta_star").value);
  gamma = Number(document.getElementById("gamma").value);
  gamma_star = Number(document.getElementById("gamma_star").value);
  mu_m = Number(document.getElementById("mu_m").value);
  collisionType = Number(document.getElementById("collisionType").value);

  // numCollisions = 0;
  numEvents = 0;

  plot.clear();
  path.clear();

  elapsedTime = 0;
  setAnimate(false);

  updateForces(true);

  resetLog();
  render();
}

function r0Changed() {
  reset();
}

function theta0Changed() {
  reset();
}

function phi0Changed() {
  reset();
}

function pr0Changed() {
  reset();
}

function ptheta0Changed() {
  reset();
}

function pphi0Changed() {
  reset();
}

function resetClicked() {
  reset();
  // updateForces(true);
  // render();
}

function transRotClicked() {
  updateP = document.getElementById("updateP").checked;
  updateM = document.getElementById("updateM").checked;
}

function showPathClicked() {
  showPath = document.getElementById("showPath").checked;
  render();
}

function eta_starChanged() {
  eta_star = Number(document.getElementById("eta_star").value);
}

function etaChanged() {
  eta = Number(document.getElementById("eta").value);
}

function gamma_starChanged() {
  gamma_star = Number(document.getElementById("gamma_star").value);
}

function gammaChanged() {
  gamma = Number(document.getElementById("gamma").value);
}

function mu_mChanged() {
  mu_m = Number(document.getElementById("mu_m").value);
}

function collisionTypeChanged() {
  collisionType = Number(document.getElementById("collisionType").value);
}

function simSpeedChanged() {
  simSpeed = Number(document.getElementById("simSpeed").value);
}

function demoChanged() {
  var demo = demos[document.getElementById("demos").value];
  Object.getOwnPropertyNames(demo).forEach(function(setting, idx, array) {
    document.getElementById(setting).value = demo[setting];
    document.getElementById(setting).checked = demo[setting];
  });
  reset();
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  document.onkeydown = keyDown;
  canvas.onclick = onMouseClick;
  canvas.onmousedown = onMouseDown;
  canvas.onmouseup = onMouseUp;
  canvas.onmousemove = onMouseMove;

  var rect = canvas.getBoundingClientRect();
  canvasX = rect.left;
  canvasY = rect.top;
  canvasWidth = canvas.width;
  canvasHeight = canvas.height;

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  plot = new Plot();

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  lineProgram = new LineProgram();
  circleProgram = new CircleProgram();
  flatProgram = new FlatProgram(gl);
  sphereProgram = new SphereProgram();
  textureProgram = new TextureProgram();

  // var image = document.getElementById("dipoleFieldImage");
  // configureTexture(image);

  axis = new Axis();
  floor = new Floor();
  arrow = new Arrow();
  segment = new Segment();
  sphere = new Sphere(1, 200, 200);
  square = new Square();
  circle = new Circle();
  phiArrow = new PhiArrow();
  path = new Points(gl);
  sin2 = new Sin2();
  forceArrow = new ForceArrow();
  bArrow = new BArrow();
  torqueArrow = new TorqueArrow();

  simSpeed = Number(document.getElementById("simSpeed").value);
  gamma_star = Number(document.getElementById("gamma_star").value);
  gamma = Number(document.getElementById("gamma").value);
  mu_m = Number(document.getElementById("mu_m").value);
  eta_star = Number(document.getElementById("eta_star").value);
  eta = Number(document.getElementById("eta").value);
  collisionType = Number(document.getElementById("collisionType").value);

  demos.default = { r:1.1, theta:45, phi:0, pr:0, ptheta:0, pphi:0,
                    gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                    collisionType:"0", updateP:true, updateM:true,
                    showPath:false };
  demos.volvo = { r:1, theta:145, phi:30, pr:0, ptheta:0.3, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  collisionType:"0", updateP:true, updateM:true, 
                  showPath:true };
  demos.saab = { r:1.1, theta:90, phi:62, pr:0, ptheta:0, pphi:0,
                 gamma:0.005, gamma_star:0.005, eta:0, eta_star:0, mu_m:0,
                 collisionType:"1", updateP:true, updateM:true,
                 showPath:false };
  demos.hyundai = { r:1.04, theta:-162, phi:30, pr:0, ptheta:0, pphi:0,
                 gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                 collisionType:"0", updateP:true, updateM:true,
                 showPath:false };
  demoChanged();

  reset();
}
