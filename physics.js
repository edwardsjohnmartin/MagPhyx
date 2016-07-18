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

function sq(x) {
  return x*x;
}

//----------------------------------------
// Equations 52-57
//----------------------------------------
// dxdt is an array of size 6 of the form
//   [ dr_dt, dtheta_dt, dphi_dt, dpr_dt, dptheta_dt, dpphi_dt ]
function get_derivatives(x, verbose) {
  var r = x[0];
  var theta = x[1];
  var phi = x[2];
  var pr = x[3];
  var ptheta = x[4];
  var pphi = x[5];
  var d = new Dipole(r, theta, phi, pr, ptheta, pphi);

  // Pre-computations
  var r2 = r * r;
  var r3 = r2 * r;
  var r4 = r3 * r;
  var r5 = r4 * r;
  var cos_phi = Math.cos(phi);
  var sin_phi = Math.sin(phi);
  var cos2 = Math.cos(phi-2*theta);
  var sin2 = Math.sin(phi-2*theta);
  // Interaction energy - caused by magnetic forces
  var U = -(cos_phi + 3*cos2)/(12*r3);
  // Force and torque friction. Only uses the first two terms. The last
  // term (F_fr_1 and T_fr_1) is taken care of only when r==1. The first
  // two terms have not yet been implemented.
  var F_fr = 0;
  var T_fr = 0;

  // Apply magnetic forces and momenta
  var dr = pr;
  var dtheta = ptheta / r2;
  var dphi = 10 * pphi;
  // var dpr = ptheta * ptheta / r3 + 3*U/r;
  var dpr = sq(ptheta) / r3 + 3*U/r;
  if (dpr > -1e-5) {
    console.log(dpr + " " + sq(ptheta) + " " + U + " " + r);
    animate = false;
  }
  var dptheta = (1/(2*r3)) * sin2;
  var dpphi = -(1/(12*r3)) * (sin_phi + 3*sin2);

  // Apply friction forces
  var dpr = dpr - F_fr*pr;
  var dptheta = dptheta - F_fr*ptheta;
  var dpphi = dpphi - T_fr*pphi;

  if (r == 1 && pr == 0) {
    // In contact and sliding. Apply sphere-sphere frictional forces.

    // F_N is the magnitude of the normal force of the fixed sphere on the
    // free sphere.
    // var F_N = Math.max(0, -3*U - sq(ptheta));
    var F_N = -3*U - sq(ptheta);
    // if (F_N < -1e-8) {
    //   F_N = 0;
    // }
    // Tangential speed at point of contact with fixed sphere
    var v_t = Math.pow(sq(pr)+sq(ptheta-5*pphi), 0.5);
    // Sphere-sphere frictional force
    var F_fr_1 = mu_m*F_N/v_t;
    var T_fr_1 = 5*mu_m*F_N/(2*v_t);
    if (v_t == 0) {
      F_fr_1 = 0;
      T_fr_1 = 0;
    }
    // if (Math.abs(dpr + F_N) < 1e-12) {
    //   dpr = 0;
    // } else {
    //   console.log(dpr + " " + F_N + " " + r + " " + r3);
      dpr = dpr + F_N;
    // }
    dptheta = dptheta - F_fr_1*ptheta + (v_t==0?0:(5*mu_m*F_N*r*pphi)/v_t);
    dpphi = dpphi - T_fr_1*pphi + (v_t==0?0:(mu_m*F_N*ptheta)/(2*v_t));
  }
  
  // Debug output and return
  var dxdt = [ dr, dtheta, dphi, dpr, dptheta, dpphi ];
  for (var i = 0; i < 6; ++i) {
    if (dxdt[i] != dxdt[i]) {
      console.log("NaN " + i);
    }
  }
  // verbose = true;
  if (verbose) {
    console.log("get_derivatives: " +
                dxdt[0] + " " + dxdt[1] + " " + dxdt[2] + " " +
                dxdt[3] + " " + dxdt[4] + " " + dxdt[5]);
  }
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
  return normalize_angle(d.phi - B_angle(d));
}

// Kinetic energy
function get_T(d) {
  return d.pr*d.pr/2 + (d.ptheta*d.ptheta)/(2*d.r*d.r) +
    5*d.pphi*d.pphi;
}

// Potential energy
function get_U(d) {
  return -(Math.cos(d.phi) +
           3*Math.cos(d.phi-2*d.theta))/(12*d.r*d.r*d.r);
}

// Total energy
function get_E(d) {
  return get_T(d) + get_U(d);
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
