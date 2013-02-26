var app = angular.module('emjsAppDirectives', []);

app.directive('dropArea', function() {
  return {
    scope: { files: "=dropArea" },
    transclude: true,
    template: '<div ng-transclude></div>',
    link: function( scope, elm, attrs ) {
      elm.bind('dragover', function( event ) {
        event.stopPropagation();
        event.preventDefault();
      });
      elm.bind('drop', function( event ) {
        event.stopPropagation();
        event.preventDefault();
        scope.$apply(function() {
          scope.files = event.originalEvent.dataTransfer.files;
        });
      });
    }
  };
});

app.directive('fileSelect', function() {
  var template = '<input type="file" multiple name="files" style="display:none"/>';
  return {
    scope: { files: '=fileSelect' },
    link: function( scope, elem, attrs ) {
      var selector = $( template );
      elem.append(selector);
      selector.bind('change', function( event ) {
        scope.$apply(function() {
          scope.files = event.originalEvent.target.files;
        });
      });
      selector.click(function( event ) {
        event.stopPropagation();
      });
      elem.bind('click', function( event ) {
        event.stopPropagation();
        event.preventDefault();
        selector.click();
      });
    }
  };
});

app.directive('flot', function() {
  return {
    scope: { graphdata: '=flot', click: '&' },
    replace: false,
    link: function( scope, elm, attrs ) {
      scope.$watch('graphdata', function( data ) {
        if ( !data.series || !data.options ) return;
        //console.log(data.series, data.options);
        $.plot( elm, data.series, data.options );
      }, true);
      //
      elm.bind('plotclick', function( event, pos, item ) {
        //console.log(vent, pos, item]);
        var args = { x: pos.x, y: pos.y };
        if ( item ) {
          args.dataIndex = item.dataIndex;
          args.seriesIndex = item.seriesIndex;
        }
        scope.click({ args: args });
      });
      //
      elm.bind('plotselected', function( event, ranges ) {
        console.log([ event, ranges ]);
      });
    }
  };
});

app.directive('arrBind', function() {
  return {
    restrict: 'A',
    scope: { array: '=arrBind' },
    link: function( scope, elem, attrs ) {
      scope.$watch('array', function( array ) {
        elem.val( array ? array.join('\n') : '' );
      }, true);
      elem.bind('change', function() {
        var arr = elem.val().split(/\n/).map(function (v) { return +v; });
        angular.copy( arr, scope.array );
        scope.$apply();
      });
    }
  };
});

app.directive('focus', ['$timeout', function( $timeout ) {
  return function( scope, elem, attrs ) {
    elem.bind('focus', function() {
      if ( true !== scope.$eval( attrs.focus ) ) {
        scope.$apply( attrs.focus + ' = true' );
      }
    });
    elem.bind('blur', function() {
      if ( false !== scope.$eval( attrs.focus ) ) {
        $timeout(function() {
          scope.$eval( attrs.focus + ' = false' );
        }, 500 );
      }
    });
    scope.$watch( attrs.focus, function( val ) {
      $(elem).trigger( val ? 'focus' : 'blur' );
    });
  };
}]);
