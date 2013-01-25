// gaussian mixture EM
// k: number of clusters
// m: initial means
// s: initial deviations
var EM = function( x, K, m0, s0, p0 ) {
  var N = x.length,
			D = 1;  // dimension
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
	// p(k|n) = p[k] * g(x[n],m[k],s[k]) / SUM_k( p[k] * g(x[n],m[k],s[k]) )
	var Expectation = function(p, m, s) {
		var wp = [], n, k; 
		for (n = 0; n < N; n++) {
			var wpsum = 0;
			wp[n] = [];
			for (k = 0; k < K; k++) {
				wp[n][k] = p[k] * g(x[n], m[k], s[k]);
				wpsum += wp[n][k];
			}
			for (k = 0; k < K; k++) {
				pmem[k][n] = wp[n][k] / wpsum;
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
			s[k] = Math.sqrt( wsqsum / psum / D );
			p[k] = psum / N;
		}
		return {m:m, s:s, p:p};
	};

  function showsump(pmem) {
	var sump0 = 0;
	var sump1 = 0;
	var sump2 = 0;
	for (var n = 0; n < N; n++) {
		sump0 += pmem[0][n];
		sump1 += pmem[1][n];
		sump2 += pmem[2][n];
	}
	console.log("sump", [sump0/N, sump1/N, sump2/N, (sump0+sump1+sump2)/N] );
	}

  // difference evaluation func
	var diff = function(m0, m1) {
		var k, sqsum = 0;
		for (k = 0; k < K; k++) {
			sqsum += ( m0[k] - m1[k] ) * ( m0[k] - m1[k] );
		}
		console.log( sqsum );
		return Math.sqrt( sqsum );
	};

	// iteration
	for (i=0; i<10000; i++) {
		Expectation(p, m, s);
		var res = Maximization();
		if (diff(m, res.m) < 10) break;
		p = res.p;
		m = res.m;
		s = res.s;
		console.log([i, m]);
	}
	return {m:m, s:s, p:p};
};
