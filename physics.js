// Specific magnetic field computation with source moment at (1, 0, 0)
// Computes the magnetic field at position p.
// m points south to north
// dipole is sphere
// n spheres of diameter d. For each sphere, specify m orientation.
// Torque on dipole will twist m.
function B(p) {
  var r = length(p);
  if (r == 0) {
    return 0;
  }
  const r2 = r*r;
  const c = 1 / 6;
  const mr = mult(p, 3 * p[0] / (r2*r2*r));
  const mm = vec3(1.0 / (r2*r), 0, 0);
  return mult(subtract(mr, mm), c);
}

// This force function is optimized and applies only when the
// fixed dipole is at the origin with moment=(1,0,0).
//
// Force of dipole m_i on dipole m_j.
// Equation 8 of the paper.
// applyFriction also applies to eddy breaks
function F(di, dj, applyFriction) {
  const Rij = dj.p;
  const r = length(dj.p);
  const mj = dj.m;

  const r2 = r*r;
  const c = 1 / (2 * r2 * r2 * r);
  const n1 = mult(mj, Rij[0]);
  const n2 = vec3(dot(mj, Rij), 0, 0);
  const n3 = mult(Rij, mj[0]);
  const n4 = mult(Rij, 5 * Rij[0] * dot(mj, Rij) / r2);
  var f = mult(add(n1, add(n2, subtract(n3, n4))), c);
  const f_orig = f.slice(0);
  if (applyFriction) {
    // Friction
    if (length(dj.v) > 0) {
      // Table friction
      var mu = mult(normalize(mult(dj.v, -1)), gamma);
      f = add(f, mu);
      // Eddy breaks
      var B_mag = length(B(subtract(dj.p, di.p)));
      var v_mag = length(dj.v);
      var eddy_mag = eta * B_mag * B_mag * v_mag;
      var eddy = mult(-eddy_mag, normalized(dj.v));
      f = add(f, eddy);
      // Magnet-magnet friction
      if (mu_m != 0 && Math.abs(r-1) < 0.0000001) {
        var r_hat = normalized(subtract(dj.p, di.p));
        var omega = vec3(0, 0, dj.av);
        var v_t = subtract(dj.v, mult(cross(omega, r_hat), 0.5));
        var v_hat = normalized(v_t);
        var F12 = F(di, dj, false);
        var f_m = mult(v_hat, -mu_m * Math.abs(dot(F12, r_hat)));
        debugValues.f_m = f_m;
        f = add(f, f_m);
      }
    }

    // debugValues.F = f.map(function(n) { return n.toFixed(2) });
    // debugValues.F_mag = length(f_orig).toFixed(4);
    // debugValues.F_mag_net = length(f).toFixed(4);
  }
  return f;
}

// This torque function is optimized and applies only when the
// fixed dipole is at the origin with moment=(1,0,0).
//
// Torque of dipole m_i on dipole m_j.
// Equation 10 of the paper.
// applyFriction applies to both friction and eddy breaks
function T(di, dj, applyFriction) {
  const Rij = dj.p;
  const r = length(dj.p);
  const mi = di.m;
  const mj = dj.m;

  const c = 1;
  const r2 = r*r;
  const cn1 = Rij[0] / (2 * r2 * r2 * r);
  const n1 = mult(cross(mj, Rij), cn1);
  const n2 = mult(cross(mj, mi), 1/(6 * Math.pow(r, 3)));
  var t = mult(vec3c(c), subtract(n1, n2));
  const t_orig = t;
  if (applyFriction) {
    if (Math.abs(dj.av) > 0) {
      // Table friction tau_t
      var mu = vec3(0, 0, (dj.av > 0 ? -gamma_star : gamma_star));
      t = add(t, mu);
      // Eddy breaks
      var B_mag = length(B(subtract(dj.p, di.p)));
      var v_mag = Math.abs(dj.av);
      var eddy_mag = eta_star * B_mag * B_mag * v_mag;
      var eddy = vec3(0, 0, (dj.av > 0) ? -eddy_mag : eddy_mag);
      t = add(t, eddy);
      // Magnet-magnet friction
      if (mu_m != 0 && Math.abs(r-1) < 0.0000001) {
        var r_hat = normalized(subtract(dj.p, di.p));
        var omega = vec3(0, 0, dj.av);
        var v_t = subtract(dj.v, mult(cross(omega, r_hat), 0.5));
        var v_hat = normalized(v_t);
        var F12 = F(di, dj, false);
        var f_m = mult(v_hat, -mu_m * Math.abs(dot(F12, r_hat)));
        var tau_m = mult(cross(mult(-1, r_hat), f_m), 0.5);
        debugValues.v_t = vecString(v_t, 2);
        debugValues.v_hat = vecString(v_hat, 2);
        debugValues.r_hat = vecString(r_hat, 2);
        debugValues.f_m = vecString(f_m, 2);
        debugValues.tau_m = vecString(tau_m, 2);
        t = add(t, tau_m);
      }
    }

    // Only update values if we're applying friction
    debugValues.tau = t_orig[2].toFixed(4);
    // debugValues.tau_net = t[2].toFixed(4);
  }

  return t;
}

//------------------------------------------------------------------------------
// General magnetic field functions
//------------------------------------------------------------------------------

// // General magnetic field calculation with source dipole
// // at moment m.
// // Computes the magnetic field at position p.
// // m points south to north
// // dipole is sphere
// // n spheres of diameter d. For each sphere, specify m orientation.
// // Torque on dipole will twist m.
// function B(m, p) {
//   var mag = length(p);
//   if (mag == 0) {
//     return 0;
//   }
//   const c = 1 / 6;
//   const mr = mult(p, vec3c(3 * dot(m, p) / Math.pow(mag, 5)));
//   const mm = mult(m, vec3c(1.0 / Math.pow(mag, 3)));
//   return mult(subtract(mr, mm), vec3c(c));
// }

// function BSum(dipoles, origin) {
//   var sum = 0;
//   for (var i = 0; i < dipoles.length; ++i) {
//     var v = B(dipoles[i].m, subtract(origin, dipoles[i].p));
//     if (v != 0) {
//       if (sum == 0) {
//         sum = v;
//       } else {
//         sum = add(sum, v);
//       }
//     }
//   }
//   return sum;
// }

// This is the general F equation where both dipoles can
// have any configuration
// // Force of dipole m_i on dipole m_j.
// // Equation 8 of the paper.
// // applyFriction also applies to eddy breaks
// function F(di, dj, applyFriction) {
//   const Rij = subtract(dj.p, di.p);
//   // const Rij_mag = length(Rij);
//   // const Rij_mag = dj.r;
//   const r = dj.r;
//   const mi = di.m;
//   const mj = dj.m;

//   // |v|*cos(theta) = dot(u,v)/|u|
//   // 

//   // c = 1 / (2*r^5)
//   const c = 1 / (2 * r * r * r * r * r);
//   const n1 = mult(mj, dot(mi, Rij));
//   const n2 = mult(mi, dot(mj, Rij));
//   const n3 = mult(Rij, dot(mi, mj));
//   const n4 = mult(vec3c(5 * dot(mi, Rij) * dot(mj, Rij) / Math.pow(r, 2)),
//                   Rij);
//   var f = mult(vec3c(c), add(n1, add(n2, subtract(n3, n4))));
//   const f_orig = f.slice(0);
//   if (applyFriction) {
//     // Friction
//     if (length(dj.v) > 0) {
//       // friction
//       var mu = mult(normalize(mult(dj.v, -1)), gamma);
//       f = add(f, mu);
//       // eddy breaks
//       var B_mag = length(B(di.m, subtract(dj.p, di.p)));
//       var v_mag = length(dj.v);
//       var eddy_mag = eta * B_mag * B_mag * v_mag;
//       var eddy = mult(-eddy_mag, normalized(dj.v));
//       f = add(f, eddy);
//       debugValues.B_mag = B_mag.toFixed(4);
//       debugValues.v_mag = v_mag.toFixed(4);
//       debugValues.f_eddy_mag = eddy_mag.toFixed(4) +
//         " (" + (100 * eddy_mag / length(f_orig)).toFixed(4) + "% of |F|)";
//     }

//     // Only update values if we're applying friction
//     debugValues.F = f.map(function(n) { return n.toFixed(2) });
//     debugValues.F_mag = length(f_orig).toFixed(4);
//     debugValues.F_mag_net = length(f).toFixed(4);
//   }
//   return f;
// }

// General torque function for any configuration of di and dj
// // Torque of dipole m_i on dipole m_j.
// // Equation 10 of the paper.
// // applyFriction applies to both friction and eddy breaks
// function T(di, dj, applyFriction) {
//   const Rij = subtract(dj.p, di.p);
//   const Rij_mag = length(Rij);
//   const mi = di.m;
//   const mj = dj.m;

//   const c = 1;
//   const cn1 = dot(mi, Rij) / (2 * Math.pow(Rij_mag, 5));
//   const n1 = mult(cross(mj, Rij), cn1);
//   const n2 = mult(cross(mj, mi), 1/(6 * Math.pow(Rij_mag, 3)));
//   var t = mult(vec3c(c), subtract(n1, n2));
//   const t_orig = t;
//   if (applyFriction) {
//     if (Math.abs(dj.av) > 0) {
//       // Friction
//       var mu = vec3(0, 0, (dj.av > 0 ? -gamma_star : gamma_star));
//       t = add(t, mu);
//       // eddy breaks
//       var B_mag = length(B(di.m, subtract(dj.p, di.p)));
//       var v_mag = Math.abs(dj.av);
//       var eddy_mag = eta_star * B_mag * B_mag * v_mag;
//       var eddy = vec3(0, 0, (dj.av > 0) ? -eddy_mag : eddy_mag);
//       t = add(t, eddy);
//       // debugValues.t_eddy_mag = eddy_mag;
//       // debugValues.t_eddy = (100 * eddy_mag / length(t_orig)).toFixed(4) + "% of T";
//       debugValues.t_eddy_mag = eddy_mag.toFixed(4) + " (" + (100 * eddy_mag / length(t_orig)).toFixed(4) + "% of T)";
//     }
//     // debugValues.torque_final = length(t).toFixed(4);

//     // Only update values if we're applying friction
//     debugValues.T = t_orig[2].toFixed(4);
//     debugValues.T_net = t[2].toFixed(4);
//   }

//   return t;
// }

