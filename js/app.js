// handle missing window.console.log cases.
var app = angular.module('app', []);

var hist = function(data, min, binsize, N) {
  var bin = [], inc = 1.0 / data.length;
	var min1 = min - binsize/2;
	for (var i = 0; i < N; i++)  // initialize
		bin[i] = [min1 + i*binsize, 0];
	angular.forEach(data, function(v) {
		var index = Math.floor( ( v - min1 ) / binsize );
		index = ( index < 0 ? 0 : index );
		index = ( index > N-1 ? N-1 : index );
		bin[index][1] += inc;
	});
	//console.log( bin );
	return bin;
};

var estimateInitialParam = function(h) {
  var max_pos = 0, max = 0;
	for (var i = 0; i < h.length; i++) {
		if ( max < h[i][1] ) {
			max = h[i][1];
			max_pos = h[i][0];
		}
	}
	return [max_pos - 500, max_pos, max_pos + 500];
};

var D = 1, gconst = 1 / Math.pow( Math.sqrt(2 * Math.PI), D );
var g = function( v, m, s ) {
	return gconst / Math.pow(s, D) * Math.exp( -0.5 * Math.pow((v - m)/s, 2) );
};

app.controller('MainCtrl', function( $scope ) {

  $scope.data = [
4391,
4359,
4328,
3938,
4359,
4313,
4500,
3906,
4344,
4546,
4109,
4469,
4531,
3813,
3922,
4328,
4516,
4406,
4328,
4313,
3844,
3406,
4313,
4422,
3875,
3844,
4375,
3875,
4328,
4344,
4375,
3922,
3391,
4359,
4344,
3844,
4687,
4297,
3328,
4359,
4406,
3907,
3906,
3859,
3813,
3375,
4312,
3813,
3890,
3375,
4781,
3937,
3344,
3359,
3907,
3844,
4406,
4407,
3343,
3375,
4329,
4546,
4329,
3359,
4391,
3360,
3344,
4344,
4390,
3875,
3422,
4297,
3921,
3875,
3813,
4297,
4031,
3391,
3875,
3859,
3812,
3891,
3391,
3343,
3828
];

  $scope.binsize = 50;

	$scope.get_histogram = function(binsize) {
		var min = $scope.data[0], max = min, N, k;
		angular.forEach($scope.data, function(v) {
			if ( v < min ) min = v;
			if ( max < v ) max = v;
		});
		//console.log([min,max]);
		N = 5 + Math.floor( ( max - min ) / binsize );
		return hist($scope.data, min - 2 * binsize, binsize, N);
	};

	$scope.draw_graph = function(h) {
		var min = h[0][0], max = h[h.length-1][0], binsize = (max-min)/(h.length-1);
		var options = {
			series: {
				bars: { barWidth: binsize }
				//lines: { show: true },
				//points: { show: true }
			},
			grid: { hoverable: true }
		};
		var gg = [], means = [];
		if ($scope.result) {
			// Gaussian mixture graph
			var dist = $scope.result;
			for (var x = min; x < max; x+=0.1*binsize) {
				var f = 0.0;
				for (k=0; k < $scope.result.m.length; k++) {
					f += dist.p[k] * g(x, dist.m[k], dist.s[k]);
				}
				gg.push([x, binsize * f]);
			}
			// means
			for (k=0; k < dist.m.length; k++) {
				means[k] = [dist.m[k], 0];
			}
		}
		var graphdata = [{data: h, bars: {show:true}}, gg, {points:{show:true}, data:means} ];
		$.plot($("#placeholder"), graphdata, options);
	};

	$scope.update = function(m0) {
		var h = $scope.get_histogram( $scope.binsize );
		if (m0) {
			m = m0.map(function(v) { return v.v; });
		} else {
			m = estimateInitialParam(h);
			$scope.m0 = [];
			for (var i = 0; i < m.length; i++) {
				$scope.m0[i] = {v : m[i]};
			}
		}
		var s = [], p = [];
		for (var i = 0; i < m.length; i++) {
			s[i] = 30;
			p[i] = 1;
		}
		$scope.result = EM($scope.data, m.length, m, s, p);
		$scope.draw_graph(h);
	};

	$scope.remove = function(index) {
		delete $scope.m0[index];
		$scope.m0.splice(index, 1);
	};

	$scope.$watch('data', function(data) {
		$scope.update();
	});

  //$scope.result = EM($scope.data, 3, [3500, 4000, 4500], [30,30,30], [1,1,1]);
  $scope.files = [];

  $scope.$watch( 'filelist', function( filelist ) {
    if ( !filelist ) return;
    $scope.files = [];
    console.log( filelist );
		var onload = function( event ) {
			var text = event.target.result;
			$scope.data = text.split(/[#\s]+/)
				.map(function(v) {return +v;})
				.filter(function(v) {return v > 0;});
			$scope.$apply();
		};
    for ( var i = filelist.length - 1; i >= 0; i-- ) {
      var file = filelist[i];
			var reader = new FileReader();
			reader.onload = onload;
			reader.readAsText( file );
      $scope.files.push( file );
    }
  }, true);


	$scope.updateRawData = function() {
		if (!$scope.rawdata) return;
		$scope.data = $scope.rawdata.split(/[#\s]+/)
			.map(function(v) {return +v;})
			.filter(function(v) {return v > 0;});
	};

  $scope.clearRawData = function() {
		$scope.rawdata = "";
	};

});  // Main Controller

app.directive('dropArea', function() {
  return function( scope, elm, attrs ) {
    elm.bind("dragover", function( event ) {
      event.stopPropagation();
      event.preventDefault();
    });
    elm.bind("drop", function( event ) {
      event.stopPropagation();
      event.preventDefault();
      scope.$apply(function( scope ) {
        console.log( event.originalEvent.dataTransfer.files );
        scope[ attrs.dropArea ] = event.originalEvent.dataTransfer.files;
      });
    });
    elm.bind('click', function() {
      $('input').click();
    });
  };
});

app.directive("filelistBind", function() {
  return function( scope, elm, attrs ) {
    elm.bind("change", function( evt ) {
      //console.log( evt );
      scope.$apply(function( scope ) {
        scope[ attrs.name ] = evt.target.files;
      });
    });
  };
});
