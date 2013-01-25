// gaussian mixture EM
// k: number of clusters
// m: initial means
// s: initial deviations
var EM = function( x, K, m0, s0, p0 ) {
  var N = x.length,
			D = 2;  // dimension
	// model structure initialization
	var m = m0, s = s0, p;
	var psum = p0.reduce(function(p, c) { return p + c; }, 0.0);
	p = p0.map(function(v) { return v / psum; });
	// membership probability initialization
	var pmem = [], normp = 1.0 / K;
	for (var k = 0; k < K; k++) {
		pmem[k] = [];
		for (var n = 0; n < N; n++) {
			pmem[k][n] = normp;
		}
	}

	// gaussian
	var gconst = 1 / Math.pow( Math.sqrt(2 * Math.PI), D );
	var g = function( v, m, s ) {
		return gconst / Math.pow(s, D) * Math.exp( -0.5 * Math.pow((v - m)/s, 2) );
	};
  
	// Expectation step
	var Expectation = function(p, m, s) {
		var wp = [], n; 
		for (var k = 0; k < K; k++) {
			var wpsum = 0;
			wp[k] = [];
			for (n = 0; n < N; n++) {
				wp[k][n] = p[k] * g(x[n], m[k], s[k]);
				wpsum += wp[k][n];
			}
			for (n = 0; n < N; n++) {
				pmem[k][n] = wp[k][n] / wpsum;
			}
		}
	};

	// Maximization step
	var Maximization = function() {
		var n, m = [], s = [], p = [];
		for (var k = 0; k < K; k++) {
			var wsum = 0, wsqsum = 0, psum = 0, pk = pmem[k];
			for (n = 0; n < N; n++) {
				wsum += x[n] * pk[n];
				psum += pk[n];
			}
			var mk = wsum / psum;
			for (n = 0; n < N; n++) {
				wsqsum += pk[n] * (x[n] - mk) * (x[n] - mk);
			}
			m[k] = mk;
			s[k] = Math.sqrt( wsqsum / psum ) / D;
			p[k] = psum / K;
		}
		return {m:m, s:s, p:p};
	};

	console.log( g(3900, 3900, 100) );

	// iteration
	for (i=0; i<10; i++) {
		Expectation(p, m, s);
		console.log(pmem);
		var res = Maximization();
		p = res.p;
		m = res.m;
		s = res.s;
	}
	return {m:m, s:s, p:p};
};
