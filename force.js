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

var logger = new Logger();

var elapsedTime = 0;
var animate = false;

var numEvents = 0;

var updateP = true;
var updateM = true;

var demos = new Object();

var canvas;
var canvasX, canvasY;
var canvasWidth, canvasHeight;

// Frustum width and height
var fw, fh;
var gl;

var fixedDipole;
var freeDipole;

var path;

var renderer;

var lineProgram;
var circleProgram;
var flatProgram;
var domainProgram;
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
var ELASTIC = "elastic";
var INELASTIC = "inelastic";
var eta, eta_star;

// What to render
var showB = true;
var showDomain = true;
var showCircles = true;
// var showOutlineMode = false;
var showPath = false;
var showAnimation = true;

var logAllEvents = true;

var DebugLabel = function(name, label) {
  this.name = name;
  this.label = label;
}

// Stack stuff
var matrixStack = new Array();
function pushMatrix() {
  matrixStack.push(mat4(mvMatrix));
}
function popMatrix() {
  mvMatrix = matrixStack.pop();
}

function updateForces(updateInitial) {
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

// function rk4(x, v, theta, omega, dt) {//, m) {
function rk4(dipole, dt) {//, m) {
  var x = dipole.p;
  var v = dipole.v;
  var theta = dipole.phi();
  var omega = dipole.av;

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
  // Find the distance a from the center of the fixed dipole
  // to the displacement line.
  //
  //        dx  ____ c1+dx
  //       ____/
  //   c1 /_________ c0
  //           R10

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
  var disc = qb*qb - 4*qa*qc; // discriminant
  if (disc < 0) return NaN;
  var qt0 = (-qb + Math.sqrt(disc)) / (2 * qa);
  var qt1 = (-qb - Math.sqrt(disc)) / (2 * qa);
  var qt = Math.min(qt0, qt1);
  if (qt < 0) {
    qt = Math.max(qt0, qt1);
  }
  return qt;
}

function isTouching(fixed, free) {
  // var EPSILON = 0.0000000001;
  var EPSILON = 0.00000001;
  return (length(subtract(fixed, free)) - D < EPSILON);
}

function sign(d) {
  var EPSILON = 0.000000000001;
  // if (Math.abs(d) < EPSILON) return 0;
  return (d < -EPSILON) ? -1 : (d > EPSILON) ? 1 : 0;
}

function isZeroCrossing(a, b) {
  // Return true if we cross zero or if we move from non-zero to zero.
  if (sign(a) == 0) return false;
  return (sign(a) == -sign(b)) || (sign(b) == 0);
}

function isNegativeZeroCrossing(a, b) {
  // Return true if we cross zero from positive to negative or from
  // zero to negative.
  return (sign(a) > 0 && sign(b) <= 0);
}

function updatePositions() {
  var oldFreeDipole = freeDipole.copy();

  var oldElapsedTime = elapsedTime;
  var dt = simSpeed * 1/10000;
  elapsedTime += dt;

  // 4th order runge-kutta
  var rk = rk4(freeDipole, dt);

  if (!updateP) {
    // Not updating position. Update only moment.
    freeDipole.updateFromRK(rk, updateP, updateM);
  } else {
    // Handle separately in case there are collisions.
    var touching = isTouching(fixedDipole.p, freeDipole.p);
    if (touching && collisionType == INELASTIC) {
      // "Sliding" case.
      // Spheres are touching and traveling towards each other.
      // Translate in the tangential direction.
      var tangent = normalize(cross(freeDipole.p, vec3(0, 0, 1)));
      var newv = mult(tangent, dot(rk.v, tangent));
      // newp_tangent is the new position if traveling
      // in the tangent direction
      var newp_tangent = add(freeDipole.p, mult(newv, dt));
      // Traveling in the tangent direction will pull freeDipole off of
      // fixedDipole, so pull freeDipole toward fixedDipole until they touch
      var u = mult(normalize(subtract(newp_tangent, fixedDipole.p)), D);
      var newp = add(fixedDipole.p, u);
      freeDipole.update(newp, newv, rk.theta, rk.omega, updateP, updateM);
    } else {
      // We're not touching or else we're traveling away from the fixed dipole
      var dx = subtract(rk.p, freeDipole.p);
      var qt = computeIntersection(fixedDipole.p, freeDipole.p, dx);

      if (qt < 0 || qt > 1 || isNaN(qt)) {
        // No collision
        freeDipole.updateFromRK(rk, updateP, updateM);
      } else {
        // A collision will occur in this time step.
        // Use binary search to find a really close hit.
        elapsedTime -= dt;
        var done = false;
        var iterations = 0;
        while (!done && iterations < 100) {
          dt /= 2;
          var newrk = rk4(freeDipole, dt);
          
          if (length(subtract(newrk.p, fixedDipole.p)) < D) {
            // Intersects. Don't update position, but rather cut the time
            // step in half and retry.
          } else {
            // No intersection. Update position and try again.
            // TODO: bug here: what if there are multiple zero crossings?
            freeDipole.updateFromRK(newrk, updateP, updateM);
            oldElapsedTime = elapsedTime;
            elapsedTime += dt;
          }
          done = isTouching(fixedDipole.p, freeDipole.p);
          ++iterations;
        }

        // At this point freeDipole is on the surface and still heading
        // toward fixedDipole.
        event("collision", freeDipole);

        if (collisionType == ELASTIC) {
          // specular reflection
          var normal = normalize(subtract(freeDipole.p, fixedDipole.p));
          var l = normalize(mult(freeDipole.v, -1));
          var refln = 2 * dot(l, normal);
          refln = mult(refln, normal);
          refln = normalize(subtract(refln, l));
          var newv = mult(refln, length(freeDipole.v));
          freeDipole.update(
            freeDipole.p, newv, freeDipole.phi(), freeDipole.av,
            updateP, updateM);
        } else {
          // inelastic collision - really should set v to something meaningful
          var newv = vec3(0, 0, 0);
          var newp = add(freeDipole.p, mult(dx, qt));
          freeDipole.update(
            newp, newv, rk.theta, rk.omega,
            updateP, updateM);
        }
      }
    }
  }

  updateDebug(freeDipole);

  // Log zero crossings
  if (isZeroCrossing(oldFreeDipole.theta(), freeDipole.theta())) {
    var logDipole = Dipole.interpolateZeroCrossing(
      oldFreeDipole, freeDipole, function(d) {return d.theta();});
    event("theta = 0", logDipole);
  }
  if (isZeroCrossing(oldFreeDipole.phi(), freeDipole.phi())) {
    var logDipole = Dipole.interpolateZeroCrossing(
      oldFreeDipole, freeDipole, function(d) {return d.phi();});
    event("phi = 0", logDipole);
  }
  if (isZeroCrossing(oldFreeDipole.beta(), freeDipole.beta())) {
    var logDipole = Dipole.interpolateZeroCrossing(
      oldFreeDipole, freeDipole, function(d) {return d.beta();});
    event("beta = 0", logDipole);
  }
  if (isNegativeZeroCrossing(oldFreeDipole.pr(), freeDipole.pr())) {
    var logDipole = Dipole.interpolateZeroCrossing(
      oldFreeDipole, freeDipole, function(d) {return d.pr();});
    event("pr = 0", logDipole);
  }
  if (isZeroCrossing(oldFreeDipole.ptheta(), freeDipole.ptheta())) {
    var logDipole = Dipole.interpolateZeroCrossing(
      oldFreeDipole, freeDipole, function(d) {return d.ptheta();});
    event("ptheta = 0", logDipole);
  }
  if (isZeroCrossing(oldFreeDipole.pphi(), freeDipole.pphi())) {
    var logDipole = Dipole.interpolateZeroCrossing(
      oldFreeDipole, freeDipole, function(d) {return d.pphi();});
    event("pphi = 0", logDipole);
  }
}

function event(eventType, dipole) {
  if (!logAllEvents && eventType != "collision")
    return;

  numEvents++;

  if (eventType == "collision") {
    plot.push(vec4(dipole.theta(), dipole.beta(), 0, 1));
  }
  logger.event(eventType, dipole);
}

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
  logger.stateChanged(dipole);
}

function render() {
  var success = renderer.doRender();
  if (!success) {
    requestAnimFrame(render);
  }
}

var ticks = 0;
var tickElapsedTime = 0;
var ticksPerUpdate = 10;
var loggedPoint = vec3(0, 0, 0);
function tick() {
  if (animate) {
    ticks++;
    requestAnimFrame(tick);
    var animSpeed = 500;

    var start = new Date().getTime();
    var once = true;
    // while (once || !showAnimation) {
    // while (once || !document.getElementById("showAnimation").checked) {
    once = false;
    for (var i = 0; i < animSpeed; ++i) {
      updatePositions();
      if (length(subtract(loggedPoint, freeDipole.p)) > 0.01) {
        path.push(vec4(freeDipole.p[0], freeDipole.p[1], 0, 1));
        loggedPoint = freeDipole.p;
      }
    }
    // }

    var stop = new Date().getTime();
    tickElapsedTime += (stop-start);
    if (ticks == ticksPerUpdate) {
      var stepsPerSec = (animSpeed*ticksPerUpdate / tickElapsedTime) * 1000;
      logger.setDebugValue("fps", (stepsPerSec / 500).toFixed(1));
      tickElapsedTime = 0;
      ticks = 0;
    }

    updateForces();
    render();
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
  document.getElementById("simSpeed").value = newSpeed.toPrecision(2);
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
  case "".charCodeAt(0):
    toggleUpdate();
    break;
  case " ".charCodeAt(0):
    toggleAnimate();
    break;
  case "N".charCodeAt(0):
    var nn = 1;
    if (e.shiftKey) {
      nn = 100;
    }
    for (var i = 0; i < nn; i++) {
      updatePositions();
      updateForces(false);
    }
    render();
    break;
  case "R".charCodeAt(0):
    reset();
    break;
  case "M".charCodeAt(0):
    showB = !showB;
    render();
    break;
  case "D".charCodeAt(0):
    showDomain = !showDomain;
    render();
    break;
  case "P".charCodeAt(0):
    showPath = !showPath;
    // showOutlineMode = !showOutlineMode;
    render();
    break;
  case "C".charCodeAt(0):
    // showCircles = !showCircles;
    logAllEvents = !logAllEvents;
    console.log("logAllEvents = " + logAllEvents);
    render();
    break;
  case "S".charCodeAt(0):
    // exportLog();
    logger.exportLog();
    break;
  case "V".charCodeAt(0):
    // loggerPanel.toggleVerbosePanel();
    logger.toggleVerbosePanel();
    render();
    break;
  case "O".charCodeAt(0):
    console.log("Open file");
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

function reset() {
  fixedDipole = new Dipole(vec3(0, 0, 0), vec3(1, 0, 0), true);

  var r = Number(document.getElementById("r").value);
  var theta = radians(Number(document.getElementById("theta").value));
  // var x = r*Math.cos(theta);
  // var y = r*Math.sin(theta);
  // var p = vec3(x*D, y*D, 0);
  var phi = radians(Number(document.getElementById("phi").value));
  // var m = vec3(Math.cos(phi), Math.sin(phi), 0);
  // freeDipole = new Dipole(p, m, false);

  var pr = Number(document.getElementById("pr").value);
  // freeDipole.set_pr(pr);
  var ptheta = Number(document.getElementById("ptheta").value);
  // freeDipole.set_ptheta(ptheta);
  var pphi = Number(document.getElementById("pphi").value);
  // freeDipole.set_pphi(pphi);

  // freeDipole.resetE0();

  freeDipole = createDipole(r, theta, phi, pr, ptheta, pphi);

  // Update debug values
  F(fixedDipole, freeDipole, true);
  T(fixedDipole, freeDipole, true);

  updateP = document.getElementById("updateP").checked;
  updateM = document.getElementById("updateM").checked;
  showPath = document.getElementById("showPath").checked;

  eta = Number(document.getElementById("eta").value);
  eta_star = Number(document.getElementById("eta_star").value);
  gamma = Number(document.getElementById("gamma").value);
  gamma_star = Number(document.getElementById("gamma_star").value);
  mu_m = Number(document.getElementById("mu_m").value);
  collisionType = document.getElementById("collisionType").value;
  simSpeed = Number(document.getElementById("simSpeed").value);

  // numCollisions = 0;
  numEvents = 0;

  plot.clear();
  path.clear();

  elapsedTime = 0;
  setAnimate(false);

  updateForces(true);

  // resetLog();
  logger.reset();
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

function showAnimationClicked() {
  showAnimation = document.getElementById("showAnimation").checked;
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
  collisionType = document.getElementById("collisionType").value;
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

  var demoName = document.getElementById("demos").value;
  setCookie("demo", demoName, 365);
}

//------------------------------------------------------------
// Cookies
//------------------------------------------------------------
function setCookie(cookieName, cookieValue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cookieName + "=" + cookieValue + "; " + expires;
}

function getCookie(cookieName) {
  var name = cookieName + "=";
  var ca = document.cookie.split(';');
  for(var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1);
    if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

function checkDemoCookie() {
  var demo = getCookie("demo");
  if (demo != "") {
    var demoSelect = document.getElementById("demos");
    for (var i = 0; i < demoSelect.length; ++i){
      if (demoSelect.options[i].value == demo){
        demoSelect.value = demo;
      }
    }
  } else {
    demo = document.getElementById("demos").value;
    setCookie("demo", demo, 365);
  }
}

// read event file
function handleEventFileSelect(evt) {
  var file = evt.target.files[0];
  var reader = new FileReader();
  reader.onload = function (e) {
    plot.clear();

    var text = e.target.result;
    var lines = text.split(/\r\n|\n/);
    var headers = lines[0].split(',');
    for (var i = 1; i < lines.length; ++i) {
      var tokens = lines[i].split(',');
      if (tokens[1] == "collision") {
        var j = 3;
        var r = Number(tokens[j++]);
        var theta = radians(Number(tokens[j++]));
        var phi = radians(Number(tokens[j++]));
        var pr = Number(tokens[j++]);
        var ptheta = Number(tokens[j++]);
        var pphi = Number(tokens[j++]);
        var dipole = createDipole(r, theta, phi, pr, ptheta, pphi);
        plot.push(vec4(dipole.theta(), dipole.beta(), 0, 1));
      }
    }

    console.log("Done reading");
    render();
  };
  reader.readAsText(file);
}

// main function
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

  document.getElementById('eventFile').addEventListener(
    'change', handleEventFileSelect, false);

  plot = new Plot();

  gl.viewport(0, 0, canvas.width, canvas.height);

  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //  Load shaders and initialize attribute buffers
  lineProgram = new LineProgram();
  circleProgram = new CircleProgram();
  flatProgram = new FlatProgram(gl);
  domainProgram = new DomainProgram(gl);
  sphereProgram = new SphereProgram();
  textureProgram = new TextureProgram();

  path = new Path(gl);
  renderer = new Renderer(gl);

  simSpeed = Number(document.getElementById("simSpeed").value);
  gamma_star = Number(document.getElementById("gamma_star").value);
  gamma = Number(document.getElementById("gamma").value);
  mu_m = Number(document.getElementById("mu_m").value);
  eta_star = Number(document.getElementById("eta_star").value);
  eta = Number(document.getElementById("eta").value);
  collisionType = document.getElementById("collisionType").value;

  // Demos
  demos.demo1 = { r:1.5, theta:0, phi:0, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:1, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:false };
  demos.demo2 = { r:1.5, theta:90, phi:180, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:1, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:false };
  demos.demo3 = { r:1.1, theta:45, phi:45, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:2, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:false };
  demos.demo4 = { r:1.1288129, theta:-21.59883, phi:0, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:20, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:true };
  demos.demo5 = { r:1.1, theta:80, phi:80, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:100, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:true };
  demos.demo6 = { r:1.5, theta:45, phi:0, pr:0, ptheta:0, pphi:0,
                  gamma:0.001, gamma_star:0.001, eta:0, eta_star:0, mu_m:0.1,
                  simSpeed:1, collisionType:"inelastic",
                  updateP:true, updateM:true, showPath:false };
  demos.demo7 = { r:1.5, theta:0, phi:90, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:100, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:true };
  demos.demo8 = { r:1.05, theta:135, phi:30, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:1, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:true };
  demos.demo9 = { r:1, theta:0, phi:180, pr:0, ptheta:0, pphi:0,
                  gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                  simSpeed:1, collisionType:"elastic",
                  updateP:true, updateM:true, showPath:false };
  demos.demo10 = { r:1, theta:90, phi:0, pr:0, ptheta:0, pphi:0,
                   gamma:0, gamma_star:0, eta:0, eta_star:0, mu_m:0,
                   simSpeed:1, collisionType:"elastic",
                   updateP:true, updateM:true, showPath:false };
  // demos.demo11 = { r:1.001, theta:0, phi:150, pr:0, ptheta:0, pphi:0,
  //                 gamma:0.12, gamma_star:0.03, eta:0, eta_star:0, mu_m:0.005,
  //                 collisionType:"elastic", updateP:true, updateM:true,
  //                 simSpeed:50,
  //                 showPath:false };

  checkDemoCookie();
  demoChanged();

  reset();
}
