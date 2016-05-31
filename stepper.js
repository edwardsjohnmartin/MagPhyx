var Stepper = function(freeDipole, h, dynamics) {
  this.d = freeDipole.copy();
  this.h = h;
  this.t = 0;
  this.dynamics = dynamics;

  this.d0 = freeDipole.copy();
  this.h0 = h;
  this.t0 = 0;
}

Stepper.prototype.step = function() {
  this.d0 = this.d.copy();
  this.h0 = this.h;
  this.t0 = this.t;

  this.d = this.rk4();
  this.t = this.t + this.h;
}

Stepper.prototype.stepHalf = function() {
  this.h = this.h / 2;
  this.step();
}

// Back up one step 
Stepper.prototype.undo = function() {
  this.d = this.d0;
  this.t = this.t0;
  this.h = this.h0;
}

function rk4Add(x, k, f) {
  var ret = [ 0, 0, 0, 0, 0, 0 ];
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = x[i] + f * k[i];
  }
  return ret;
}

Stepper.prototype.rk4 = function() {
  var x = [ this.d.r, this.d.theta, this.d.phi,
            this.d.pr, this.d.ptheta, this.d.pphi ];
  var k1 = get_derivatives(x, this.dynamics);
  var k2 = get_derivatives(rk4Add(x, k1, this.h/2), this.dynamics);
  var k3 = get_derivatives(rk4Add(x, k2, this.h/2), this.dynamics);
  var k4 = get_derivatives(rk4Add(x, k3, this.h), this.dynamics);

  var ret = [ 0, 0, 0, 0, 0, 0 ];
  for (var i = 0; i < x.length; ++i) {
    ret[i] = x[i] + (this.h/6.0) * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]);
  }

  return new Dipole(ret[0], ret[1], ret[2], ret[3], ret[4], ret[5]);
}
