// Dipole has properties p, r, theta
var Dipole = function(p, m, fixed) {
  this.p = p;
  // // The dipole position is stored in cylindrical coordinates (r, theta)
  // this.r = length(p);
  // if (this.r > 0) {
  //   this.theta = Math.atan2(p[1]/this.r, p[0]/this.r);
  // } else {
  //   this.theta = 0;
  // }

  // The dipole moment is stored in radians phi
  // this.phi = Math.atan2(m[1], m[0]);

  // // position
  // this.pInternal = p;
  // moment
  this.m = m;
  // velocity
  this.v = vec3(0, 0, 0);
  // angular velocity
  this.av = 0;
  // force
  this.F = vec3(0, 0, 0);
  // torque
  this.T = vec3(0, 0, 0);
  this.F0 = this.F;
  this.T0 = this.T;

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

Dipole.prototype.resetE0 = function() {
  var U_ = U(this);
  var T_ = Trans(this);
  var R_ = R(this);
  this.E0 = U_ + T_ + R_;
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

