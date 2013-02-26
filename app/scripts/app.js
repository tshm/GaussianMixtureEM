var app = angular.module('emjsApp', ['emjsAppDirectives']);

var hist = function( samples, min, binsize, N ) {
  var bins = [], inc = 1.0 / samples.length;
  var min1 = min - binsize/2;
  for (var i = 0; i < N; i++)  // initialize
    bins[i] = [min1 + i*binsize, 0];
  angular.forEach( samples, function( v ) {
    var index = Math.floor( ( v - min1 ) / binsize );
    index = ( index < 0   ?   0 : index );
    index = ( index > N-1 ? N-1 : index );
    bins[index][1] += inc;
  });
  //console.log('bins: ', bins );
  return bins;
};

var get_histogram = function( binsize, samples ) {
  var min = samples[0], max = min, N, k;
  angular.forEach( samples, function(v) {
    if ( v < min ) min = v;
    if ( max < v ) max = v;
  });
  //console.log([min,max]);
  N = 5 + Math.floor( ( max - min ) / binsize );
  return hist( samples, min - 2 * binsize, binsize, N );
};

var estimateInitialParam = function( bins, K ) {
  //console.log('estimateInitialParam.');
  var max_pos = 0, max = 0;
  for (var i = 0; i < bins.length; i++) {
    if ( max < bins[i][1] ) {
      max = bins[i][1];
      max_pos = bins[i][0];
    }
  }
  var center = 0.5 * (bins[0][0] + bins[bins.length-1][0]),
  range = ( bins[bins.length-1][0] - bins[0][0] ) / 8.0,
  pos = parseInt( (max_pos - center) / range, 10 );
  //console.log( [center, range, pos, max_pos] );
  if (1 <= pos)  max_pos -= 500;
  if (pos <= -1) max_pos += 500;
  return [
    {m: max_pos - 500, s:30, p:1},
    {m: max_pos,       s:30, p:1},
    {m: max_pos + 500, s:30, p:1}
  ];
};

app.factory('filelistLoader', function() {
  return {
    load: function( filelist, done ) {
      var filenames = [];
      angular.forEach( filelist, function( file, i ) {
        var reader = new FileReader();
        reader.onload = function( event ) {
          var text = event.target.result;
          var data = text.split(/[#\s]+/)
          .map(function(v) {return +v;})
          .filter(function(v) {return v > 0;});
          done( i, data );
        };
        reader.readAsText( file );
        filenames[i] = file.name;
      });
      return filenames;
    }
  };
});

app.controller('MainCtrl', ['$scope', 'filelistLoader', function( $scope, filelistLoader ) {

  var default_sample = [
      4391, 4359, 4328, 3938, 4359, 4313, 4500, 3906, 4344, 4546, 4109, 4469, 4531,
      3813, 3922, 4328, 4516, 4406, 4328, 4313, 3844, 3406, 4313, 4422, 3875, 3844,
      4375, 3875, 4328, 4344, 4375, 3922, 3391, 4359, 4344, 3844, 4687, 4297, 3328,
      4359, 4406, 3907, 3906, 3859, 3813, 3375, 4312, 3813, 3890, 3375, 4781, 3937,
      3344, 3359, 3907, 3844, 4406, 4407, 3343, 3375, 4329, 4546, 4329, 3359, 4391,
      3360, 3344, 4344, 4390, 3875, 3422, 4297, 3921, 3875, 3813, 4297, 4031, 3391,
      3875, 3859, 3812, 3891, 3391, 3343, 3828
  ];

  var defaultdataset = {
    name: 'sample_data',
    show: true,
    samples: default_sample,
    histogram: { binsize: null, bins: [] },
    model: { params: [], pdf: null }
  };

  $scope.datasets = [ angular.copy( defaultdataset ) ];

  $scope.addDataSet = function( index ) {
    $scope.datasets.splice( 1+index, 0, angular.copy( defaultdataset ));
  };

  var draw_hook = function( plot ) {
    var series = plot.getData(), j = 0;
    $scope.datasets.forEach(function( dataset ) {
      dataset.color = ( dataset.show && series[j*3] && series[j++*3].color || "#FFF" );
    });
  };

  $scope.graphdata = {
    series: [],
    options: {
      series: {
        //bars: { barWidth: binsize }
        //lines: { show: true },
        //points: { show: true }
      },
      hooks: { draw: [draw_hook] },
      //selection: {mode: 'x'},
      grid: { hoverable: true, clickable: true }
    }
  };

  $scope.make_graphdata = function() {
    var series = [];

    var make_graph_for_single_dataset = function( bins, model, pdf ) {
      if ( !bins || !model || !pdf ) return;
      var min = bins[0][0], max = bins[bins.length-1][0], binsize = (max-min)/(bins.length-1);
      var pdist = [], means = [];
      if ( model ) {
        // Gaussian mixture graph
        for (var x = min; x < max; x+=0.1*binsize) {
          var f = 0.0;
          for (k=0; k < model.length; k++) {
            f += model[k].p * pdf(x, model[k].m, model[k].s);
          }
          pdist.push([ x, binsize * f ]);
        }
        // means
        for (k=0; k < model.length; k++) {
          means[k] = [ model[k].m, 0 ];
        }
      }
      return { binsize: binsize, pdist: pdist, means: means };
    };

    $scope.datasets.forEach(function( dataset, i ) {
      //console.log( $scope.datasets.length, dataset, i );
      if ( !dataset.show ) return;
      var obj = make_graph_for_single_dataset( dataset.histogram.bins, dataset.model.params, dataset.model.pdf );
      if ( !obj ) return;
      var label = i + ": " + dataset.name;
      // histogram
      series.push({ color: i, data: dataset.histogram.bins, bars: { show: true, barWidth: obj.binsize } });
      // estimated pdf
      series.push({ color: i, label: label, data: obj.pdist, lines: { show: true } });
      // characteristice points
      series.push({ color: i, points: { show: true }, data: obj.means });
    });

    $scope.graphdata.series = series;
  };

  $scope.$watch('datasets', function() {
    $scope.make_graphdata();
  }, true);

  $scope.plotclick = function( args ) {
    $scope.$broadcast('plotclick', args);
  };

  $scope.$watch('dropFiles', function( files ) {
    if ( !files ) return;
    console.log("files droppped into the plot.", files );
    $scope.datasets = [];
    var filenames = filelistLoader.load(files, function( i, data ) {
      $scope.datasets[ i ].samples = data;
      $scope.$apply();
    });
    filenames.forEach(function( name ) {
      var dataset = angular.copy( defaultdataset );
      angular.extend( dataset, { name: name, samples: [] });
      $scope.datasets.push( dataset );
    });
  });

}]);  // Main Controller 


app.controller('DataItemCtrl', ['$scope', 'filelistLoader', function( $scope, filelistLoader ) {

  $scope.setInitialCondition = function( init_params ) {
    console.log('setInitialCondition called.');
    $scope.run_estimation( init_params, $scope.dataset.samples );
  };

  $scope.$watch('dataset.histogram.binsize', function( binsize ) {
    if ( !binsize ) return;
    $scope.dataset.histogram.bins = get_histogram( binsize, $scope.dataset.samples );
  });

  $scope.run_estimation = function( params, samples ) {
    //console.log( params, samples );
    $scope.calculating = true;
    $scope.em = new GMEM( samples, params );
    console.log( $scope.em );
    $scope.em.run();
    var result = $scope.em.get_result();
    $scope.dataset.model.params = result.model;
    $scope.dataset.model.L = result.L;
    $scope.dataset.model.pdf = $scope.em.g;
    $scope.calculating = false;
  };

  $scope.$watch('dataset.samples', function( samples ) {
    if ( !samples || samples.length < 3 ) return;
    console.log('samples updated: ', samples.slice(0, 5));
    $scope.dataset.histogram.binsize = (function( samples ) {
      var N = samples.length,
      k = Math.ceil(1 + Math.log(N, 2));
      var min = samples[0], max = samples[0];
      for (var i = 0; i < N; i++) {
        if ( samples[i] < min ) min = samples[i];
        if ( samples[i] > max ) max = samples[i];
      }
      return Math.round( (max - min) / Math.sqrt( N ) / 3 );
    })( samples );
    $scope.dataset.histogram.bins = get_histogram( $scope.dataset.histogram.binsize, samples );
    $scope.init_params = $scope.init_params || estimateInitialParam( $scope.dataset.histogram.bins );
    $scope.run_estimation( $scope.init_params, samples );
  }, true);

  //$scope.$watch('dataset.model.params', function( init_params ) { $scope.run_estimation( init_params, $scope.dataset.samples ); });

  $scope.$watch('dataset.filelist', function( filelist ) {
    if ( !filelist ) return;
    console.log("filelist changed : ", filelist );
    $scope.dataset.name = filelistLoader.load( filelist, function( index, data ) {
      if ( index !== 0 ) return;
      $scope.dataset.samples = data;
      $scope.$apply();
      console.log( index, $scope.dataset.samples.slice(0,5) );
    })[0];
  });

  $scope.$on('plotclick', function( msg, arg ) {
    console.log('plotclick', msg, arg );
    $scope.init_params.forEach(function( m0, i ) {
      if ( !m0.focus ) return;
      $scope.init_params[ i ].m = arg.x;
    });
  });

  $scope.sort = function() {
    console.log('sort triggered');
    $scope.dataset.samples.sort();
  };

  $scope.remove = function( index ) {
    delete $scope.init_params[index];
    $scope.init_params.splice( index, 1 );
    $scope.setInitialCondition( $scope.init_params );
  };

}]);  // DataItem Controller
