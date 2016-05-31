function deg2rad(a) {
  return a * Math.PI / 180.0;
}

function rad2deg(a) {
  return a * 180.0 / Math.PI;
}

// Rotates an angle until it's in the range [-180, 180].
// a is in radians.
function normalize_angle(a) {
  while (a > Math.PI) a -= 2*Math.PI;
  while (a < -Math.PI) a += 2*Math.PI;
  return a;
}

// v is in (r, theta) coordinates
function vecPolar2Cartesian(v, d) {
  var vr = mult(normalized(d.p()), v[0]);
  var u = cross(normalized(d.p()), vec3(0, 0, -1));
  var vtheta = mult(u, v[1]);
  return add(vr, vtheta);
  
}

//----------------------------------------
// Equations 52-57
//----------------------------------------
// dxdt is an array of size 6 of the form
//   [ dr_dt, dtheta_dt, dphi_dt, dpr_dt, dptheta_dt, dpphi_dt ]
// function get_derivatives(d, dynamics) {
function get_derivatives(x, dynamics) {
  // var r = d.r;
  // var theta = d.theta;
  // var phi = d.phi;
  // var pr = d.pr;
  // var ptheta = d.ptheta;
  // var pphi = d.pphi;
  var r = x[0];
  var theta = x[1];
  var phi = x[2];
  var pr = x[3];
  var ptheta = x[4];
  var pphi = x[5];

  // Pre-computations
  var r2 = r * r;
  var r3 = r2 * r;
  var r4 = r3 * r;
  var r5 = r4 * r;
  var cos_phi = Math.cos(phi);
  var sin_phi = Math.sin(phi);
  var cos2 = Math.cos(phi-2*theta);
  var sin2 = Math.sin(phi-2*theta);

  var dxdt = [ 0, 0, 0, 0, 0, 0 ];
  if (dynamics == "bouncing") {
    dxdt[0] = pr;
    dxdt[3] = ptheta * ptheta / r3 -
      (1/(4*r4)) * (cos_phi + 3*cos2);
  } else {
    dxdt[0] = 0;
    dxdt[3] = 0;
  }
  dxdt[1] = ptheta / r2;
  dxdt[2] = 10 * pphi;
  dxdt[4] = (1/(2*r3)) * sin2;
  dxdt[5] = -(1/(12*r3)) * (sin_phi + 3*sin2);
  return dxdt;
}

// Gets the direction of the magnetic field at position p
function B_dir_pos(p) {
  var theta = Math.atan2(p[1], p[0]);
  var a = Math.atan2(3*Math.sin(2*theta), 1+3*Math.cos(2*theta));
  return vec3(Math.cos(a), Math.sin(a), 0);
}

// Gets the direction of the magnetic field at the position of dipole d.
function B_angle(d) {
  return Math.atan2(3*Math.sin(2*d.theta), 1+3*Math.cos(2*d.theta));
}

function get_beta(d) {
  return d.phi - B_angle(d);
}

// Force dipole d. Return value in the form
// (r_hat, theta_hat).
// Equation 59 of the paper.
function F(d, applyFriction) {
  var r = d.r;
  var theta = d.theta;
  var phi = d.phi;

  var r2 = r*r;
  var cr = -1 / (4 * r2 * r2);
  var ctheta = 1 / (2 * r2 * r2);

  // console.log("physics.F - add friction");
  return vecPolar2Cartesian(vec2(cr*(Math.cos(phi) + 3*Math.cos(phi-2*theta)),
                                 ctheta*Math.sin(phi-2*theta)), d);
}

// Torque on dipole d.
// Equation 72 of the paper.
function T(d, applyFriction) {
  var r = d.r;
  var theta = d.theta;
  var phi = d.phi;

  // console.log("physics.T - add friction");
  return (-1/(12*r*r*r)) * (Math.sin(phi) + 3*Math.sin(phi-2*theta));
}


// // Specific magnetic field computation with source moment at (1, 0, 0)
// // Computes the magnetic field at position p.
// // m points south to north
// // dipole is sphere
// // n spheres of diameter d. For each sphere, specify m orientation.
// // Torque on dipole will twist m.
// function B(p) {
//   var r = length(p);
//   if (r == 0) {
//     return 0;
//   }
//   const r2 = r*r;
//   const c = 1 / 6;
//   const mr = mult(p, 3 * p[0] / (r2*r2*r));
//   const mm = vec3(1.0 / (r2*r), 0, 0);
//   return mult(subtract(mr, mm), c);
// }

// // This force function is optimized and applies only when the
// // fixed dipole is at the origin with moment=(1,0,0).
// //
// // Force of dipole m_i on dipole m_j.
// // Equation 8 of the paper.
// // applyFriction also applies to eddy breaks
// function F(di, dj, applyFriction) {
//   const Rij = dj.p;
//   const r = length(dj.p);
//   const mj = dj.m;

//   const r2 = r*r;
//   const c = 1 / (2 * r2 * r2 * r);
//   const n1 = mult(mj, Rij[0]);
//   const n2 = vec3(dot(mj, Rij), 0, 0);
//   const n3 = mult(Rij, mj[0]);
//   const n4 = mult(Rij, 5 * Rij[0] * dot(mj, Rij) / r2);
//   var f = mult(add(n1, add(n2, subtract(n3, n4))), c);
//   const f_orig = f.slice(0);
//   if (applyFriction) {
//     // Friction
//     if (length(dj.v) > 0) {
//       // Table friction
//       var mu = mult(normalize(mult(dj.v, -1)), gamma);
//       f = add(f, mu);
//       // Eddy breaks
//       var B_mag = length(B(subtract(dj.p, di.p)));
//       var v_mag = length(dj.v);
//       var eddy_mag = eta * B_mag * B_mag * v_mag;
//       var eddy = mult(-eddy_mag, normalized(dj.v));
//       f = add(f, eddy);
//       // Magnet-magnet friction
//       if (mu_m != 0 && Math.abs(r-1) < 0.0000001) {
//         var r_hat = normalized(subtract(dj.p, di.p));
//         var omega = vec3(0, 0, dj.av);
//         var v_t = subtract(dj.v, mult(cross(omega, r_hat), 0.5));
//         var v_hat = normalized(v_t);
//         var F12 = F(di, dj, false);
//         var f_m = mult(v_hat, -mu_m * Math.abs(dot(F12, r_hat)));
//         logger.setDebugValue("f_m", f_m);
//         f = add(f, f_m);
//       }
//     }
//   }
//   return f;
// }

// // This torque function is optimized and applies only when the
// // fixed dipole is at the origin with moment=(1,0,0).
// //
// // Torque of dipole m_i on dipole m_j.
// // Equation 10 of the paper.
// // applyFriction applies to both friction and eddy breaks
// function T(di, dj, applyFriction) {
//   const Rij = dj.p;
//   const r = length(dj.p);
//   const mi = di.m;
//   const mj = dj.m;

//   const c = 1;
//   const r2 = r*r;
//   const cn1 = Rij[0] / (2 * r2 * r2 * r);
//   const n1 = mult(cross(mj, Rij), cn1);
//   const n2 = mult(cross(mj, mi), 1/(6 * Math.pow(r, 3)));
//   var t = mult(vec3c(c), subtract(n1, n2));
//   const t_orig = t;
//   if (applyFriction) {
//     if (Math.abs(dj.av) > 0) {
//       // Table friction tau_t
//       var mu = vec3(0, 0, (dj.av > 0 ? -gamma_star : gamma_star));
//       t = add(t, mu);
//       // Eddy breaks
//       var B_mag = length(B(subtract(dj.p, di.p)));
//       var v_mag = Math.abs(dj.av);
//       var eddy_mag = eta_star * B_mag * B_mag * v_mag;
//       var eddy = vec3(0, 0, (dj.av > 0) ? -eddy_mag : eddy_mag);
//       t = add(t, eddy);
//       // Magnet-magnet friction
//       if (mu_m != 0 && Math.abs(r-1) < 0.0000001) {
//         var r_hat = normalized(subtract(dj.p, di.p));
//         var omega = vec3(0, 0, dj.av);
//         var v_t = subtract(dj.v, mult(cross(omega, r_hat), 0.5));
//         var v_hat = normalized(v_t);
//         var F12 = F(di, dj, false);
//         var f_m = mult(v_hat, -mu_m * Math.abs(dot(F12, r_hat)));
//         var tau_m = mult(cross(mult(-1, r_hat), f_m), 0.5);
//         logger.setDebugValue("v_t", vecString(v_t, 2));
//         logger.setDebugValue("v_hat", vecString(v_hat, 2));
//         logger.setDebugValue("r_hat", vecString(r_hat, 2));
//         logger.setDebugValue("f_m", vecString(f_m, 2));
//         logger.setDebugValue("tau_m", vecString(tau_m, 2));
//         t = add(t, tau_m);
//       }
//     }

//     // Only update values if we're applying friction
//     logger.setDebugValue("tau", t_orig[2].toFixed(4));
//   }

//   return t;
// }
