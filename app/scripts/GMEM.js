(function() {
  var GMEM;

  GMEM = (function() {

    function GMEM(x, model) {
      var i, k, n, norp, psum, _i, _j, _k, _ref, _ref1, _ref2;
      this.x = x;
      this.model = model;
      this.D = 1;
      this.N = this.x.length;
      this.K = this.model.length;
      psum = this.model.reduce((function(s, v) {
        return s + v.p;
      }), 0);
      this.m = [];
      this.s = [];
      this.p = [];
      for (i = _i = 0, _ref = this.K; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.m[i] = this.model[i].m;
        this.s[i] = this.model[i].s;
        this.p[i] = this.model[i].p / psum;
      }
      norp = 1.0 / this.K;
      this.pmem = [];
      for (k = _j = 0, _ref1 = this.K; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; k = 0 <= _ref1 ? ++_j : --_j) {
        this.pmem[k] = [];
        for (n = _k = 0, _ref2 = this.N; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; n = 0 <= _ref2 ? ++_k : --_k) {
          this.pmem[k][n] = norp;
        }
      }
      this.gconst = 1.0 / Math.pow(Math.sqrt(2.0 * Math.PI), this.D);
      this.L = this.loglikelihood();
    }

    GMEM.prototype.g = function(v, m, s) {
      return this.gconst / Math.pow(s, this.D) * Math.exp(-0.5 * Math.pow((v - m) / s, 2));
    };

    GMEM.prototype.expectation = function() {
      var k, n, wp, wpsum, _i, _j, _k, _ref, _ref1, _ref2;
      wp = [];
      for (n = _i = 0, _ref = this.N; 0 <= _ref ? _i < _ref : _i > _ref; n = 0 <= _ref ? ++_i : --_i) {
        wp[n] = [];
        wpsum = 0;
        for (k = _j = 0, _ref1 = this.K; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; k = 0 <= _ref1 ? ++_j : --_j) {
          wp[n][k] = this.p[k] * this.g(this.x[n], this.m[k], this.s[k]);
          wpsum += wp[n][k];
        }
        for (k = _k = 0, _ref2 = this.K; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; k = 0 <= _ref2 ? ++_k : --_k) {
          this.pmem[k][n] = wp[n][k] / wpsum;
        }
      }
    };

    GMEM.prototype.maximization = function() {
      var k, mk, n, pk, psum, wsqsum, wsum, _i, _j, _k, _ref, _ref1, _ref2;
      for (k = _i = 0, _ref = this.K; 0 <= _ref ? _i < _ref : _i > _ref; k = 0 <= _ref ? ++_i : --_i) {
        wsum = wsqsum = psum = 0;
        pk = this.pmem[k];
        for (n = _j = 0, _ref1 = this.N; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; n = 0 <= _ref1 ? ++_j : --_j) {
          wsum += this.x[n] * pk[n];
          psum += pk[n];
        }
        mk = wsum / psum;
        for (n = _k = 0, _ref2 = this.N; 0 <= _ref2 ? _k < _ref2 : _k > _ref2; n = 0 <= _ref2 ? ++_k : --_k) {
          wsqsum += pk[n] * (this.x[n] - mk) * (this.x[n] - mk);
        }
        this.m[k] = mk;
        this.s[k] = Math.sqrt(wsqsum / psum / this.D);
        this.p[k] = psum / this.N;
      }
    };

    GMEM.prototype.loglikelihood = function() {
      var k, n, prod_pkg, sum_pkg, _i, _j, _ref, _ref1;
      for (n = _i = 0, _ref = this.N; 0 <= _ref ? _i < _ref : _i > _ref; n = 0 <= _ref ? ++_i : --_i) {
        prod_pkg = sum_pkg = 0.0;
        for (k = _j = 0, _ref1 = this.K; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; k = 0 <= _ref1 ? ++_j : --_j) {
          sum_pkg += this.p[k] * this.g(this.x[n], this.m[k], this.s[k]);
        }
        if (!sum_pkg) {
          continue;
        }
        prod_pkg += Math.log(sum_pkg);
      }
      return prod_pkg;
    };

    GMEM.prototype.run_iteration = function() {
      this.expectation();
      this.maximization();
      this.L = this.loglikelihood();
    };

    GMEM.prototype.run = function() {
      var L_old, i, _i;
      L_old = this.L;
      for (i = _i = 0; _i < 100; i = ++_i) {
        this.run_iteration();
        console.log("" + i + " LogLikelihood: " + this.L);
        if (!isFinite(this.L) || Math.abs(this.L - L_old) < 0.1) {
          return;
        }
        L_old = this.L;
      }
    };

    GMEM.prototype.get_result = function() {
      var k, result_model, _i, _ref;
      result_model = [];
      for (k = _i = 0, _ref = this.K; 0 <= _ref ? _i < _ref : _i > _ref; k = 0 <= _ref ? ++_i : --_i) {
        result_model[k] = {
          m: this.m[k],
          s: this.s[k],
          p: this.p[k]
        };
      }
      return {
        model: result_model,
        L: this.L
      };
    };

    return GMEM;

  })();

  this.GMEM = GMEM;

}).call(this);
