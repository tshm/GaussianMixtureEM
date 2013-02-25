var app = angular.module('emjsAppDirectives', []);

app.directive('dropArea', function() {
  return function( scope, elm, attrs ) {
    elm.bind('dragover', function( event ) {
      event.stopPropagation();
      event.preventDefault();
    });
    elm.bind('drop', function( event ) {
      event.stopPropagation();
      event.preventDefault();
      scope.$apply(function( scope ) {
        //console.log(event);
        //console.log( event.dataTransfer.files,  attrs.dropArea );
        scope[ attrs.dropArea ] = event.originalEvent.dataTransfer.files;
      });
    });
  };
});

app.directive('fileSelect', function() {
  var template = '<input type="file" multiple name="files" style="display:none"/>';
  return function( scope, elem, attrs ) {
    var selector = $( template );
    elem.append(selector);
    selector.bind('change', function( event ) {
      scope.$apply(function() {
        scope[ attrs.fileSelect ] = event.originalEvent.target.files;
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
  };
});

app.directive('flot', function() {
  return {
    scope: { data: '=flot', options: '=flotOptions', click: '&' },
    replace: false,
    link: function( scope, elm, attrs ) {
      var updateplot = function() {
        if ( !scope.data || !scope.options ) return;
        //console.log([scope.data, scope.options]);
        $.plot( elm, scope.data, scope.options );
      };
      scope.$watch('data',   updateplot);
      scope.$watch('options',updateplot);
      //
      elm.bind('plotclick', function( event, pos, item ) {
        //console.log([event, pos, item]);
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

app.directive('plotDataInputField', function() {
  return {
    restrict: 'A',
    scope: { array: '=plotDataInputField' },
    link: function( scope, elem, attrs ) {
      scope.$watch('array', function( array ) {
        elem.val( array ? array.join('\n') : '' );
      }, true);
      elem.bind('change', function() {
        var arr = text.split(/\n/).map(function (v) { return +v; });
        angular.copy( arr, scope.array );
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
