class GMEM
	constructor: (@x, @model) ->
		# dimension
		@D = 1
		@N = @x.length
		@K = @model.length
		psum = @model.reduce(((s, v) -> s + v.p), 0)
		# workspace model structure initialization
		@m = []; @s = []; @p = []
		for i in [0...@K]
			@m[i] = @model[i].m
			@s[i] = @model[i].s
			@p[i] = @model[i].p / psum
		# membership probability initialization
		norp = 1.0 / @K
		#@pmem = ( (norp for n in [0...@N]) for k in [0...@K])
		@pmem = []
		for k in [0...@K]
			@pmem[k] = []
			for n in [0...@N]
				@pmem[k][n] = norp
		# fixed constant for gaussian PDF
		@gconst = 1.0 / Math.pow( Math.sqrt(2.0 * Math.PI), @D )
		# get the initial likelihood
		@L = @loglikelihood()
	

	# gaussian pdf
	g: (v, m, s) =>
		@gconst / Math.pow(s, @D) * Math.exp( -0.5 * Math.pow((v - m)/s, 2) )

	# expectation
	expectation: () ->
		wp = []
		for n in [0...@N]
			wp[n] = []
			wpsum = 0
			for k in [0...@K]
				wp[n][k] = @p[k] * @g(@x[n], @m[k], @s[k])
				wpsum += wp[n][k]
			for k in [0...@K]
				@pmem[k][n] = wp[n][k] / wpsum
		return
	
	# maximization
	maximization: () ->
		for k in [0...@K]
			wsum = wsqsum = psum = 0
			pk = @pmem[k]
			for n in [0...@N]
				wsum += @x[n] * pk[n]
				psum += pk[n]
			mk = wsum / psum
			for n in [0...@N]
				wsqsum += pk[n] * (@x[n] - mk) * (@x[n] - mk)
			@m[k] = mk
			@s[k] = Math.sqrt( wsqsum / psum / @D )
			@p[k] = psum / @N
		return

	# loglikelihood
	loglikelihood: () ->
		for n in [0...@N]
			prod_pkg = sum_pkg = 0.0
			for k in [0...@K]
				sum_pkg += @p[k] * @g(@x[n], @m[k], @s[k])
			continue if !sum_pkg
			prod_pkg += Math.log( sum_pkg )
		return prod_pkg
	
	# step
	step: () ->
		@expectation()
		@maximization()
		@L = @loglikelihood()
	
	run: () ->
		for i in [0...100]
			L_old = @L
			console.log "#{i} LogLikelihood: #{@L}"
			@step()
			return if ( !isFinite(@L) || Math.abs(@L - L_old) < 0.1 )
		return

	get_result: () ->
		result_model = []
		for k in [0...@K]
			result_model[k] = {m: @m[k], s: @s[k], p: @p[k]}
		return {model: result_model, L: @L}

# export GMEM class
this.GMEM = GMEM

