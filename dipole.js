var Dipole = function(r, theta, phi, pr, ptheta, pphi, copy) {
  this.r = r;
  this.theta = theta;
  this.phi = phi;
  this.pr = pr;
  this.ptheta = ptheta;
  this.pphi = pphi;

  if (copy == null) {
    this.E0 = get_E(this);
  } else {
    this.E0 = copy.E0;
  }
}

Dipole.prototype.copy = function() {
  var d = new Dipole(this.r, this.theta, this.phi,
                     this.pr, this.ptheta, this.pphi, this);
  return d;
}

Dipole.interpolateZeroCrossing = function(src, target, f) {
  var EPSILON = 0.000000000001;
  var srcValue = f(src);
  var targetValue = f(target);
  var t = (-srcValue) / (targetValue - srcValue);
  if (Math.abs(targetValue - srcValue) < EPSILON) {
    t = 0;
  }

  var r = src.r + t * (target.r - src.r);
  var theta = src.theta + t * (target.theta - src.theta);
  var phi = src.phi + t * (target.phi - src.phi);
  var pr = src.pr + t * (target.pr - src.pr);
  var ptheta = src.ptheta + t * (target.ptheta - src.ptheta);
  var pphi = src.pphi + t * (target.pphi - src.pphi);

  return new Dipole(r, theta, phi, pr, ptheta, pphi, src);
}

//-----------------------------------------------------------------------
// Convenience functions for rendering: position, moment vector, velocity
//-----------------------------------------------------------------------

Dipole.prototype.p = function() {
  return vec3(this.r*Math.cos(this.theta), this.r*Math.sin(this.theta), 0);
}

Dipole.prototype.m = function() {
  return vec3(Math.cos(this.phi), Math.sin(this.phi), 0);
}

Dipole.prototype.v = function() {
  var dr = this.pr;
  var dtheta = this.ptheta / (this.r*this.r);
  return vecPolar2Cartesian(vec2(dr, dtheta), this);
}

Dipole.prototype.av = function() {
  return this.pphi * 10;
}
