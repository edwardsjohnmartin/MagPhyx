precision highp float;
    
varying vec4 fColor;
varying vec3 vLighting;
varying vec4 gPosition;
varying vec4 lPosition;
    
uniform mat4 mvMatrix;
uniform mat4 pMatrix;
uniform mat4 nMatrix;

void main() {
  vec4 vNormal = vec4(lPosition.xyz, 1.0);

  // Change to white if desired
  vec4 lColor = fColor;
  // vec4 lColor = vec4(1.0, 1.0, 1.0, 1.0);

  // Material properties
  vec3 ka = vec3(0.3, 0.3, 0.3) * lColor.xyz;
  vec3 kd = vec3(0.7, 0.7, 0.7) * lColor.xyz;
  //vec3 ks = vec3(0.5, 0.5, 0.5);
  vec3 ks = vec3(0.0, 0.0, 0.0);

  // Light colors
  vec3 La = vec3(1.0, 1.0, 1.0);
  vec3 Ld = vec3(1.0, 1.0, 1.0);
  vec3 Ls = vec3(1.0, 1.0, 1.0);

  // Set the light position
  vec3 lightPosition = vec3(10, 10, 50);

  // Light direction in eye coordinates
  // vec3 l = lightPosition - gl_Position.xyz;
  vec3 l = lightPosition - gPosition.xyz;
  l = normalize(l);

  // normal in eye coordinates
  vec3 n = normalize((nMatrix * vNormal).xyz);

  // specular values
  float alpha = 10.0;
  // vec3 v = normalize(vec3(0.0, 0.0, 10.0) - gl_Position.xyz);
  vec3 v = normalize(vec3(0.0, 0.0, 10.0) - gPosition.xyz);
  vec3 r = max(dot(l, n), 0.0)*n*vec3(2.0, 2.0, 2.0)-l;

  vec3 ambient = ka*La;
  vec3 diffuse = kd*Ld*max(dot(n, l), 0.0);
  vec3 specular = ks*Ls*max(pow(max(dot(r,v), 0.0), alpha), 0.0);

  vec3 lcolor = ambient + diffuse + specular;
  // vec4 fColor = vec4(lcolor, vColor.a);
  vec4 fColor = vec4(lcolor, 1.0);


  //gl_FragColor = vec4(fColor.xyz * vLighting, fColor.a);
  //gl_FragColor = vec4(vLighting, fColor.a);
  gl_FragColor = fColor;
}
