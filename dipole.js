// // Angles are in radians.
// function createDipole(r, theta, phi, pr, ptheta, pphi) {
//   // var x = r*Math.cos(theta);
//   // var y = r*Math.sin(theta);
//   // var p = vec3(x*D, y*D, 0);
//   // var m = vec3(Math.cos(phi), Math.sin(phi), 0);
//   // // var dipole = new Dipole(p, m, pr, false);
//   var dipole = new Dipole(r, theta, phi, pr, ptheta, pphi);

//   // dipole.set_pr(pr);
//   // dipole.set_ptheta(ptheta);
//   // dipole.set_pphi(pphi);
//   dipole.resetE0();

//   return dipole;
// }

var Dipole = function(r, theta, phi, pr, ptheta, pphi) {
  this.r = r;
  this.theta = theta;
  this.phi = phi;
  this.pr = pr;
  this.ptheta = ptheta;
  this.pphi = pphi;

  this.E0 = this.E();
}

Dipole.prototype.updateFromRK = function(rk, updateP, updateM) {
  this.update(rk.p, rk.v, rk.theta, rk.omega, updateP, updateM);
}

Dipole.prototype.update = function(p, v, phi, omega, updateP, updateM) {
  if (updateP) {
    // this.p = p;
    this.r = length(p);
    this.theta = Math.atan2(p[1]/this.r, p[0]/this.r);
    this.v = v;
  }
  if (updateM) {
    this.m = vec3(Math.cos(phi), Math.sin(phi), 0);
    this.av = omega;
  }
}

Dipole.prototype.copy = function() {
  var d = new Dipole(this.r, this.theta, this.phi,
                     this.pr, this.ptheta, this.pphi);
  d.E0 = this.E0;
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
  var ret = src.copy();

  var r = src.r() + t * (target.r() - src.r());
  var theta = src.theta() + t * (target.theta() - src.theta());
  var phi = src.phi() + t * (target.phi() - src.phi());
  var pr_ = src.pr() + t * (target.pr() - src.pr());
  var ptheta = src.ptheta() + t * (target.ptheta() - src.ptheta());
  var pphi = src.pphi() + t * (target.pphi() - src.pphi());

  var x = r*Math.cos(theta);
  var y = r*Math.sin(theta);

  // ret.p = vec3(x*D, y*D, 0);
  ret.r = r;
  ret.theta = theta;
  ret.m = vec3(Math.cos(phi), Math.sin(phi), 0);
  ret.set_pr(pr_);
  ret.set_ptheta(ptheta);
  ret.set_pphi(pphi);

  return ret;
}

// Kinetic energy
Dipole.prototype.T = function() {
  return this.pr*this.pr/2 + (this.ptheta*this.ptheta)/(2*this.r*this.r) +
    5*this.pphi*this.pphi;
}

// Potential energy
Dipole.prototype.V = function() {
  return -(Math.cos(this.phi) +
           3*Math.cos(this.phi-2*this.theta))/(12*this.r*this.r*this.r);
}

Dipole.prototype.E = function() {
  return this.T() + this.V();
}

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

// Dipole.prototype.phi = function() {
//   return Math.atan2(this.m[1], this.m[0]);
// }

// Dipole.prototype.beta = function() {
//   var v = B(this.p());
//   var vtheta = Math.atan2(v[1], v[0]);
//   return this.phi() - vtheta;
// }

// Dipole.prototype.dr = function() {
//   // Get the radial component of the velocity vector
//   return dot(normalized(this.p), this.v);
// }

// Dipole.prototype.set_dr = function(dr) {
//   var u = cross(normalized(this.p), vec3(0, 0, -1));
//   if (length(this.v) > 0) {
//     u = mult(u, dot(u, normalized(this.v)));
//     this.v = add(u, mult(normalized(this.p), dr));
//   } else {
//     this.v = mult(normalized(this.p), dr);
//   }
// }

// Dipole.prototype.dtheta = function() {
//   var u = normalized(cross(normalized(this.p), vec3(0, 0, -1)));
//   return dot(this.v, u);
// }

// Dipole.prototype.set_dtheta = function(dtheta) {
//   var u = normalized(cross(normalized(this.p), vec3(0, 0, -1)));
//   u = mult(u, dtheta);
//   // rv is the radial component of the velocity
//   var rv = mult(normalized(this.p), dot(normalized(this.p), this.v));
//   this.v = add(rv, u);
// }

// Dipole.prototype.dphi = function() {
//   return this.av;
// }

// Dipole.prototype.set_dphi = function(dphi) {
//   this.av = dphi;
// }

// Dipole.prototype.pr = function() {
//   return this.dr();
// }

// Dipole.prototype.set_pr = function(pr) {
//   this.set_dr(pr);
// }

// Dipole.prototype.ptheta = function() {
//   var r_ = this.r();
//   return this.dtheta() * r_ * r_;
// }

// Dipole.prototype.set_ptheta = function(ptheta) {
//   var r_ = this.r();
//   this.set_dtheta(ptheta / (r_*r_));
// }

// Dipole.prototype.pphi = function() {
//   return this.dphi() / 10;
// }

// Dipole.prototype.set_pphi = function(pphi) {
//   this.set_dphi(pphi * 10);
// }

