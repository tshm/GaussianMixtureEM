var app = angular.module('emjsApp', ['emjsAppDirectives']);

var hist = function( data, min, binsize, N ) {
  var bin = [], inc = 1.0 / data.length;
  var min1 = min - binsize/2;
  for (var i = 0; i < N; i++)  // initialize
    bin[i] = [min1 + i*binsize, 0];
  angular.forEach(data, function(v) {
    var index = Math.floor( ( v - min1 ) / binsize );
    index = ( index < 0   ?   0 : index );
    index = ( index > N-1 ? N-1 : index );
    bin[index][1] += inc;
  });
  //console.log( bin );
  return bin;
};

var get_histogram = function( binsize, data ) {
  var min = data[0], max = min, N, k;
  angular.forEach( data, function(v) {
    if ( v < min ) min = v;
    if ( max < v ) max = v;
  });
  //console.log([min,max]);
  N = 5 + Math.floor( ( max - min ) / binsize );
  return hist( data, min - 2 * binsize, binsize, N );
};

var estimateInitialParam = function( h, K ) {
  //console.log('estimateInitialParam.');
  var max_pos = 0, max = 0;
  for (var i = 0; i < h.length; i++) {
    if ( max < h[i][1] ) {
      max = h[i][1];
      max_pos = h[i][0];
    }
  }
  var center = 0.5 * (h[0][0] + h[h.length-1][0]),
  range = ( h[h.length-1][0] - h[0][0] ) / 8.0,
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
    data: default_sample,
    result: {}
  };

  $scope.dataset = [ angular.copy( defaultdataset ) ];

  $scope.addDataSet = function( index ) {
    $scope.dataset.splice( 1+index, 0, angular.copy( defaultdataset ));
  };

  $scope.graphdata = [];
  $scope.graphoptions = {
    series: {
      //bars: { barWidth: binsize }
      //lines: { show: true },
      //points: { show: true }
    },
    //selection: {mode: 'x'},
    grid: { hoverable: true, clickable: true }
  };

  $scope.make_graphdata = function() {
    $scope.graphdata = [];

    var make_graph_for_single_dataset = function( h, model, em ) {
      if ( !h || !model || !em ) return;
      var min = h[0][0], max = h[h.length-1][0], binsize = (max-min)/(h.length-1);
      var gg = [], means = [];
      if ( model ) {
        // Gaussian mixture graph
        for (var x = min; x < max; x+=0.1*binsize) {
          var f = 0.0;
          for (k=0; k < model.length; k++) {
            f += model[k].p * em.g(x, model[k].m, model[k].s);
          }
          gg.push([ x, binsize * f ]);
        }
        // means
        for (k=0; k < model.length; k++) {
          means[k] = [ model[k].m, 0 ];
        }
      }
      return { binsize: binsize, gg: gg, means: means };
    };

    $scope.dataset.forEach(function( ds, i ) {
      //console.log( $scope.dataset.length, ds, i );
      if ( !ds.show ) return;
      var obj = make_graph_for_single_dataset( ds.result.h, ds.result.model, ds.result.em );
      if ( !obj ) return;
      var label = i + ": " + ds.name;
      // histogram
      $scope.graphdata.push({ color: i, data: ds.result.h, bars: { show: true, barWidth: obj.binsize } });
      // estimated pdf
      $scope.graphdata.push({ color: i, label: label, data: obj.gg, lines: { show: true } });
      // characteristice points
      $scope.graphdata.push({ color: i, points: { show: true }, data: obj.means });
    });
  };

  $scope.$watch('dataset', function( dataset ) {
    $scope.make_graphdata();
  }, true);

  $scope.plotclick = function( args ) {
    var onCharaPoints = ( args.seriesIndex % 2 === 0 ),
      model0 = $scope.dataset[ Math.floor( args.seriesIndex / 3 ) ].model0;
    //console.log([onCharaPoints, datasetIndex]);
    if ( onCharaPoints ) {
      model0[ args.dataIndex ].focus = true;
      $scope.$apply();
    } else {
      model0.forEach(function( m, i ) {
        if ( !m.focus ) return;
        model0[ i ].m = args.x;
      });
    }
  };

  $scope.$watch('dropFiles', function( files ) {
    if ( !files ) return;
    console.log("files droppped into the plot.", files );
    $scope.dataset = [];
    var filenames = filelistLoader.load(files, function( i, data ) {
      angular.copy( data, $scope.dataset[ i ].data );
      $scope.$apply();
    });
    filenames.forEach(function( name ) {
      var ds = angular.copy( defaultdataset );
      angular.extend( ds, { name: name, data: [] });
      $scope.dataset.push( ds );
    });
  });

}]);  // Main Controller 


app.controller('DataItemCtrl', ['$scope', 'filelistLoader', function( $scope, filelistLoader ) {

  $scope.binsize = 50;

  $scope.setInitialCondition = function( model0 ) {
    $scope.run_estimation( model0, $scope.data );
  };

  $scope.$watch('binsize', function( binsize ) {
    if ( !binsize ) return;
    $scope.h = get_histogram( binsize, $scope.data );
  });

  $scope.run_estimation = function( model, data ) {
    //console.log( model, data );
    $scope.calculating = true;
    $scope.em = new GMEM( data, model );
    console.log( $scope.em );
    $scope.em.run();
    angular.copy( $scope.em.get_result(), $scope.result );
    $scope.result.em = $scope.em;
    $scope.result.h = $scope.h;
    $scope.calculating = false;
  };

  $scope.$watch('data', function( data ) {
    if ( !data || data.length < 3 ) return;
    console.log('data updated: ', data.slice(0, 5));
    $scope.binsize = (function( data ) {
      var N = data.length,
      k = Math.ceil(1 + Math.log(N, 2));
      var min = data[0], max = data[0];
      for (var i = 0; i < N; i++) {
        if ( data[i] < min ) min = data[i];
        if ( data[i] > max ) max = data[i];
      }
      return Math.round( (max - min) / Math.sqrt( N ) / 3 );
    })( data );
    $scope.h = get_histogram( $scope.binsize, $scope.data );
    $scope.model0 = $scope.model0 || estimateInitialParam( $scope.h );
    $scope.run_estimation( $scope.model0, $scope.data );
  }, true);

  $scope.$watch('filelist', function( filelist ) {
    if ( !filelist ) return;
    console.log("filelist changed : ", filelist );
    $scope.ds.name = filelistLoader.load( filelist, function( index, data ) {
      if ( index !== 0 ) return;
      angular.copy( data, $scope.data );
      $scope.$apply();
      console.log( index, $scope.data.slice(0,5) );
    })[0];
  });

  $scope.sort = function() {
    console.log('sort triggered');
    $scope.data.sort();
  };

  $scope.remove = function( index ) {
    delete $scope.model0[index];
    $scope.model0.splice( index, 1 );
    $scope.setInitialCondition( $scope.model0 );
  };

}]);  // DataItem Controller
