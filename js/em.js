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
	var diff = function(m0, s0, p0, m1, s1, p1) {
		var k, sqsum_m = 0, sqsum_s = 0, sqsum_p = 0;
		for (k = 0; k < K; k++) {
			sqsum_m += ( m0[k] - m1[k] ) * ( m0[k] - m1[k] );
			sqsum_s += ( s0[k] - s1[k] ) * ( s0[k] - s1[k] );
			sqsum_p += ( p0[k] - p1[k] ) * ( p0[k] - p1[k] );
		}
		console.log( sqsum_m, sqsum_s, sqsum_p );
		return Math.sqrt( sqsum_m + sqsum_s );
	};

	var LogLikelihood = function(m, s, p) {
		var n, k, prod_pkg = 1.0, sum_pkg;
		for (n = 0; n < N; n++) {
			sum_pkg = 0.0; 
			for (k = 0; k < K; k++) {
				sum_pkg += p[k] * g(x[n], m[k], s[k]);
			}
			if (!sum_pkg) continue;
			//console.log(['sum_pkg: ', sum_pkg]);
			prod_pkg += Math.log( sum_pkg );
		}
		return prod_pkg;
	};

	// iteration
	var L_old;
	for (i=0; i<10; i++) {
		Expectation(p, m, s);
		var L = LogLikelihood(m, s, p),
			res = Maximization();
		console.log(i, " LogLikelihood: ", LogLikelihood(m, s, p));
		if ( !isFinite(L) || Math.abs(L - L_old) < 0.1 ) break;
		L_old = L;
		p = res.p;
		m = res.m;
		s = res.s;
		//console.log([i, m]);
	}
	return {m:m, s:s, p:p, L:L_old};
};
