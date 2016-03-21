// Dipole has properties p, r, theta
var Dipole = function(p, m, fixed) {
  // position
  this.p = p;
  // moment
  this.m = m;
  // velocity
  this.v = vec3(0, 0, 0);
  // angular velocity
  this.av = 0;

  if (p[0] == 0 && p[1] == 0) {
    this.E0 = 0;
  } else {
    var U_ = U(this);
    var T_ = Trans(this);
    var R_ = R(this);
    this.E0 = U_ + T_ + R_;
  }
  
  this.fixed = fixed;
}

Dipole.prototype.updateFromRK = function(rk, updateP, updateM) {
  this.update(rk.p, rk.v, rk.theta, rk.omega, updateP, updateM);
}

Dipole.prototype.update = function(p, v, phi, omega, updateP, updateM) {
  if (updateP) {
    this.p = p;
    this.v = v;
  }
  if (updateM) {
    this.m = vec3(Math.cos(phi), Math.sin(phi), 0);
    this.av = omega;
  }
}

Dipole.prototype.copy = function() {
  var d = new Dipole(this.p, this.m, this.fixed);
  d.v = this.v;
  d.av = this.av;
  d.E0 = this.E0;
  return d;
}

Dipole.prototype.interpolate = function(t, src, target) {
  this.p = add(src.p, mult(t, subtract(target.p, src.p)));
  this.m = add(src.m, mult(t, subtract(target.m, src.m)));
  this.v = add(src.v, mult(t, subtract(target.v, src.v)));
  this.av = src.av, t*(target.av-src.av);
}

Dipole.interpolateZeroCrossing = function(src, target, f) {
  var srcValue = f(src);
  var targetValue = f(target);
  var t = (-srcValue) / (targetValue - srcValue);
  var ret = src.copy();
  ret.interpolate(t, src, target);
  return ret;
}

Dipole.prototype.E = function() {
  var U_ = U(this);
  var T_ = Trans(this);
  var R_ = R(this);
  return U_ + T_ + R_;
}

Dipole.prototype.resetE0 = function() {
  this.E0 = this.E();
}

Dipole.prototype.r = function() {
  return length(this.p);
}

Dipole.prototype.theta = function() {
  var r = length(this.p);
  if (r > 0) {
    return Math.atan2(this.p[1]/r, this.p[0]/r);
  }
  return 0;
}

Dipole.prototype.phi = function() {
  return Math.atan2(this.m[1], this.m[0]);
}

Dipole.prototype.beta = function() {
  var v = B(this.p);
  var vtheta = Math.atan2(v[1], v[0]);
  return this.phi() - vtheta;
}

Dipole.prototype.dr = function() {
  // Get the radial component of the velocity vector
  return dot(normalized(this.p), this.v);
}

Dipole.prototype.dtheta = function() {
  var u = cross(normalized(this.p), vec3(0, 0, -1));
  return dot(u, this.v);
}

Dipole.prototype.dphi = function() {
  return this.av;
}

Dipole.prototype.pr = function() {
  return this.dr();
}

Dipole.prototype.ptheta = function() {
  var r_ = this.r();
  return this.dtheta() * r_ * r_;
}

Dipole.prototype.pphi = function() {
  return this.dphi() / 10;
}

Dipole.prototype.set_dr = function(dr) {
  var u = cross(normalized(this.p), vec3(0, 0, -1));
  u = mult(u, dot(u, this.v));
  this.v = add(u, mult(normalized(this.p), dr));
}

Dipole.prototype.set_dtheta = function(dtheta) {
  var u = cross(normalized(this.p), vec3(0, 0, -1));
  u = mult(u, dtheta);
  var rv = mult(this.p, dot(normalized(this.p), this.v));
  this.v = add(rv, u);
}

Dipole.prototype.set_dphi = function(dphi) {
  this.av = dphi;
}

Dipole.prototype.set_pr = function(pr) {
  this.set_dr(pr);
}

Dipole.prototype.set_ptheta = function(ptheta) {
  var r_ = this.r();
  this.set_dtheta(ptheta / (r_*r_));
}

Dipole.prototype.set_pphi = function(pphi) {
  this.set_dphi(pphi * 10);
}

