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


var D = 1, gconst = 1 / Math.pow( Math.sqrt(2 * Math.PI), D );
var g = function( v, m, s ) {
	return gconst / Math.pow(s, D) * Math.exp( -0.5 * Math.pow((v - m)/s, 2) );
};

app.controller('MainCtrl', function( $scope ) {

  $scope.data = [
3937, 4360, 4391, 3422, 3313, 3859, 3406, 3328, 3375, 3859, 3813, 3328, 4422, 3875, 3891, 3859, 3844, 4359, 4344, 3922, 3859, 3843, 3421, 3921, 3765, 3407, 3875, 3812, 4359, 3422, 3406, 4391, 3500, 4312, 3344, 3359, 3891, 3891, 3843, 4312, 3781, 3922, 4281, 3422, 3344, 3906, 3344, 4328, 3422, 4594, 4235, 3891, 3875, 3390, 3875, 3359, 3407, 3875, 3344, 4406, 3406, 3453, 3359, 3343, 3375, 3860, 3812, 4344, 4265, 3391, 3406, 3906, 3859, 4391, 3797, 4359, 3906, 3938, 3890,
3343, 3860, 3422, 3859, 3359, 3438, 3344, 3313, 4406, 3828, 3844, 3859, 4390, 3906, 4375, 4109, 3922, 4594, 4407, 3891, 3344, 3828, 4328, 3875, 3328, 3375, 3453, 3359, 3343, 3812, 4000, 3906, 3313, 3391, 4328, 3375, 3890, 3360, 3891, 3453, 3875, 3860, 3843, 3375, 3860, 4313];

  $scope.binsize = 50;

	$scope.update_hist = function(binsize) {
		var min = $scope.data[0], max = min, N, k;
		angular.forEach($scope.data, function(v) {
			if ( v < min ) min = v;
			if ( max < v ) max = v;
		});
		console.log([min,max]);
		N = 5 + Math.floor( ( max - min ) / binsize );
		var h = hist($scope.data, min - 2 * binsize, binsize, N);
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
			for (var x = min-binsize; x < max+binsize; x+=binsize/10) {
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

	$scope.$watch('binsize', function(binsize) {
		$scope.update_hist(binsize);
	});
	$scope.$watch('data', function(data) {
		$scope.result = EM($scope.data, 3, [3500, 4000, 4500], [30,30,30], [1,1,1]);
		$scope.update_hist($scope.binsize);
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
});

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
