// gaussian mixture EM
// @param {Array<number>} x samples
// @param {Array<Object<m:number, s:number, p:number>>}
// m: mean
// s: deviation
// p: mixture ratio
GMEM = (function() {
  // Constructor
  function GMEM( x, model ) {
		var n, k;
		this.x = x;
		this.D = 1;  // dimension
		this.N = x.length;
		this.K = model.length;
		// model structure initialization
		this.m = [];
		this.s = [];
		this.p = [];
		var psum = 0;
		for (k = 0; k < this.K; k++) {
			psum += model[k].p;
			this.m[k] = model[k].m;
			this.s[k] = model[k].s;
		}
		for (k = 0; k < this.K; k++) {
			this.p[k] = model[k].p / psum;
		}
		// membership probability initialization
		this.pmem = [];
		var normp = 1.0 / this.K;
		for (k = 0; k < this.K; k++) {
			this.pmem[k] = [];
			for (n = 0; n < this.N; n++) {
				this.pmem[k][n] = normp;
			}
		}
		// fixed constant for gaussian PDF
		this.gconst = 1.0 / Math.pow( Math.sqrt(2.0 * Math.PI), this.D );
		// get the initial likelihood
		var L = this.LogLikelihood();
	}

	// gaussian
	GMEM.prototype.g = function( v, m, s ) {
		return this.gconst / Math.pow(s, this.D) * Math.exp( -0.5 * Math.pow((v - m)/s, 2) );
	};
  
	// Expectation step
	// p(k|n) = p[k] * g(x[n],m[k],s[k]) / SUM_k( p[k] * g(x[n],m[k],s[k]) )
	GMEM.prototype.Expectation = function() {
		var wp = [], n, k; 
		for (n = 0; n < this.N; n++) {
			var wpsum = 0;
			wp[n] = [];
			for (k = 0; k < this.K; k++) {
				wp[n][k] = this.p[k] * this.g(this.x[n], this.m[k], this.s[k]);
				wpsum += wp[n][k];
			}
			for (k = 0; k < this.K; k++) {
				this.pmem[k][n] = wp[n][k] / wpsum;
			}
		}
	};

	// Maximization step
	GMEM.prototype.Maximization = function() {
		var n, m = [], s = [], p = [];
		for (var k = 0; k < this.K; k++) {
			var wsum = 0, wsqsum = 0, psum = 0, pk = this.pmem[k];
			for (n = 0; n < this.N; n++) {
				wsum += this.x[n] * pk[n];
				psum += pk[n];
			}
			var mk = wsum / psum;
			for (n = 0; n < this.N; n++) {
				wsqsum += pk[n] * (this.x[n] - mk) * (this.x[n] - mk);
			}
			this.m[k] = mk;
			this.s[k] = Math.sqrt( wsqsum / psum / this.D );
			this.p[k] = psum / this.N;
		}
	};

	GMEM.prototype.LogLikelihood = function() {
		var n, k, prod_pkg = 1.0, sum_pkg;
		for (n = 0; n < this.N; n++) {
			sum_pkg = 0.0; 
			for (k = 0; k < this.K; k++) {
				sum_pkg += this.p[k] * this.g(this.x[n], this.m[k], this.s[k]);
			}
			if (!sum_pkg) continue;
			//console.log(['sum_pkg: ', sum_pkg]);
			prod_pkg += Math.log( sum_pkg );
		}
		return prod_pkg;
	};

	GMEM.prototype.run_iteration = function() {
		this.Expectation();
		this.Maximization();
		this.L = this.LogLikelihood();
	};

  GMEM.prototype.run = function() {
		var L_old = this.L;
		for (i=0; i<100; i++) {  // give up at 100th iteration
			this.run_iteration();
			console.log(i, " LogLikelihood: ", this.L);
			if ( !isFinite(this.L) || Math.abs(this.L - L_old) < 0.1 ) return;
			L_old = this.L;
		}
	};

  GMEM.prototype.get_result = function() {
		var result_model = [];
		for (k = 0; k < this.K; k++) {
			result_model[k] = {m: this.m[k], s: this.s[k], p: this.p[k]};
		}
		return {model: result_model, L: this.L};
	};

	return GMEM;
})();
