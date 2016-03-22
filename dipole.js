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

// Dipole.prototype.interpolate = function(t, src, target) {
//   this.p = add(src.p, mult(t, subtract(target.p, src.p)));
//   this.m = add(src.m, mult(t, subtract(target.m, src.m)));
//   this.v = add(src.v, mult(t, subtract(target.v, src.v)));
//   this.av = src.av + t*(target.av-src.av);
// }

Dipole.interpolateZeroCrossing = function(src, target, f) {
  var EPSILON = 0.000000000001;
  var srcValue = f(src);
  var targetValue = f(target);
  var t = (-srcValue) / (targetValue - srcValue);
  if (Math.abs(targetValue - srcValue) < EPSILON) {
    t = 0;
  }
  var ret = src.copy();
  // ret.interpolate(t, src, target);

  var r = src.r() + t * (target.r() - src.r());
  var theta = src.theta() + t * (target.theta() - src.theta());
  var phi = src.phi() + t * (target.phi() - src.phi());
  var pr_ = src.pr() + t * (target.pr() - src.pr());
  var ptheta = src.ptheta() + t * (target.ptheta() - src.ptheta());
  var pphi = src.pphi() + t * (target.pphi() - src.pphi());

  var x = r*Math.cos(theta);
  var y = r*Math.sin(theta);

  // console.log("1t = " + t + " pr = " + pr_ + " " + target.pr() + " " + src.pr());
  ret.p = vec3(x*D, y*D, 0);
  // if (isNaN(ret.p[0])) {
  //   console.log(t);
  // }
  ret.m = vec3(Math.cos(phi), Math.sin(phi), 0);
  ret.set_pr(pr_);
  // console.log("2 " + ret.pr());
  ret.set_ptheta(ptheta);
  // console.log("2.5 " + ret.pr());
  ret.set_pphi(pphi);
  // console.log("3 " + ret.pr());

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

Dipole.prototype.set_dr = function(dr) {
  // if (isNaN(this.p[0])) {
  //   console.log(this.p + " " + this.v + " " + dr);
  // }
  var u = cross(normalized(this.p), vec3(0, 0, -1));
  if (length(this.v) > 0) {
    u = mult(u, dot(u, normalized(this.v)));
    this.v = add(u, mult(normalized(this.p), dr));
  }
}

Dipole.prototype.dtheta = function() {
  var u = normalized(cross(normalized(this.p), vec3(0, 0, -1)));
  return dot(this.v, u);
}

Dipole.prototype.set_dtheta = function(dtheta) {
  var u = normalized(cross(normalized(this.p), vec3(0, 0, -1)));
  u = mult(u, dtheta);
  // rv is the radial component of the velocity
  var rv = mult(normalized(this.p), dot(normalized(this.p), this.v));
  this.v = add(rv, u);
}

Dipole.prototype.dphi = function() {
  return this.av;
}

Dipole.prototype.set_dphi = function(dphi) {
  this.av = dphi;
}

Dipole.prototype.pr = function() {
  return this.dr();
}

Dipole.prototype.set_pr = function(pr) {
  this.set_dr(pr);
}

Dipole.prototype.ptheta = function() {
  var r_ = this.r();
  return this.dtheta() * r_ * r_;
}

Dipole.prototype.set_ptheta = function(ptheta) {
  var r_ = this.r();
  this.set_dtheta(ptheta / (r_*r_));
}

Dipole.prototype.pphi = function() {
  return this.dphi() / 10;
}

Dipole.prototype.set_pphi = function(pphi) {
  this.set_dphi(pphi * 10);
}

