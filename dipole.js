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

Dipole.prototype.updateFromRK = function(rk, updateP, updateM) {
  this.update(rk.p, rk.v, rk.theta, rk.omega);
}

Dipole.prototype.update = function(p, v, theta, omega, updateP, updateM) {
  if (updateP) {
    this.p = p;
    this.v = v;
  }
  if (updateM) {
    this.m = vec3(Math.cos(theta), Math.sin(theta), 0);
    this.av = omega;
  }

  // var old_theta = freeDipole.theta();

  // freeDipole.p = p;
  // freeDipole.v = v;

  // var new_theta = freeDipole.theta();
  // // if (sign(old_theta) != sign(new_theta)) {
  // //   event("theta = 0");
  // // }

  // var oldTheta = Math.atan2(freeDipole.m[1], freeDipole.m[0]);
  // var newTheta = rk.theta;
  // freeDipole.m = vec3(Math.cos(rk.theta), Math.sin(rk.theta));
  // freeDipole.av = rk.omega;

  // if (sign(oldTheta) != sign(newTheta)) {
  //   // event("phi = 0");
  //   debugValues.w_at_zero_crossing = freeDipole.av.toFixed(4);
  //   debugValues.time_at_zero_crossing = elapsedTime.toFixed(4);
  // }
}

Dipole.prototype.copy = function() {
  var d = new Dipole(this.p, this.m, this.fixed);
  d.v = this.v;
  d.av = this.av;
  d.F = this.F;
  d.T = this.T;
  d.F0 = this.F0;
  d.T0 = this.T0;
  d.E0 = this.E0;
  return d;
}

Dipole.prototype.interpolate = function(t, src, target) {
  this.p = add(src.p, mult(t, subtract(target.p, src.p)));
  this.m = add(src.m, mult(t, subtract(target.m, src.m)));
  this.v = add(src.v, mult(t, subtract(target.v, src.v)));
  this.av = src.av, t*(target.av-src.av);
  this.F = add(src.F, mult(t, subtract(target.F, src.F)));
  this.T = add(src.T, mult(t, subtract(target.T, src.T)));
}

Dipole.prototype.E = function() {
  var U_ = U(this);
  var T_ = Trans(this);
  var R_ = R(this);
  return U_ + T_ + R_;
}

Dipole.prototype.resetE0 = function() {
  this.E0 = this.E();
  // var U_ = U(this);
  // var T_ = Trans(this);
  // var R_ = R(this);
  // this.E0 = U_ + T_ + R_;
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

