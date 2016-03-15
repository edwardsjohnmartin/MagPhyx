// flatten returns a Float32Array, so each number is 4 bytes, each
// vec4 is 4x4 bytes.
const VEC_SIZE = 4*4;
const INITIAL_SIZE = 4;

var Points = function(gl) {
  this.gl = gl;
  this.n = 0;
  this.points = Array(INITIAL_SIZE);

  this.bbInitialized = false;
  this.bbFixed = false;
  this.minx = this.miny = 0;
  this.maxx = this.maxy = 1;
  
  this.points.fill(vec4(0, 0, 0, 0));

  this.vertexBuffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
  this.gl.bufferData(this.gl.ARRAY_BUFFER,
                     this.points.length*VEC_SIZE, this.gl.STATIC_DRAW);
}

Points.prototype.setBB = function(minx, maxx, miny, maxy) {
  this.minx = minx;
  this.miny = miny;
  this.maxx = maxx;
  this.maxy = maxy;
  this.bbInitialized = true;
  this.bbFixed = true;
}

Points.prototype.push = function(p) {
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);

  if (!this.bbFixed) {
    if (!this.bbInitialized) {
      this.minx = p[0];
      this.miny = p[1];
      this.maxx = p[0];
      this.maxy = p[1];
      this.bbInitialized = true;
    } else {
      this.minx = Math.min(this.minx, p[0]);
      this.miny = Math.min(this.miny, p[1]);
      this.maxx = Math.max(this.maxx, p[0]);
      this.maxy = Math.max(this.maxy, p[1]);
    }
  }

  if (this.n == this.points.length) {
    this.points.length *= 2;
    for (var i = this.n; i < this.points.length; ++i) {
      this.points[i] = vec4(0, 0, 0, 0);
    }
    this.gl.bufferData(this.gl.ARRAY_BUFFER, flatten(this.points),
                       this.gl.STATIC_DRAW);
  }


  var pointsArray = [ p ];
  this.gl.bufferSubData(gl.ARRAY_BUFFER, this.n*VEC_SIZE,
                   flatten(pointsArray));

  this.points[this.n] = p;
  ++this.n;
}

Points.prototype.clear = function() {
  this.n = 0;
}
