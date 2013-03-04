'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').concat(['gruntacular']).forEach(grunt.loadNpmTasks);

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./component.json').appPath || yeomanConfig.app;
  } catch (e) {}

  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
			jade: {
				files: ['<%= yeoman.app %>/*.jade'],
				tasks: ['jade:html']
			},
      coffee: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.coffee'],
        tasks: ['coffee:dist']
      },
      coffeeTest: {
        files: ['test/spec/{,*/}*.coffee'],
        tasks: ['coffee:test']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.app %>}/{,*/}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg}'
        ],
        tasks: ['livereload']
      }
    },
    connect: {
      livereload: {
        options: {
          port: 9000,
          // Change this to '0.0.0.0' to access the server from outside.
          hostname: 'localhost',
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9000,
          middleware: function (connect) {
            return [
              mountFolder(connect, '.tmp'),
              mountFolder(connect, 'test')
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.livereload.options.port %>'
      }
    },
    clean: {
      dist: ['.tmp', '<%= yeoman.dist %>/*'],
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    testacular: {
      unit: {
        configFile: 'testacular.conf.js',
        singleRun: true
      }
    },
    coffee: {
      dist: {
        files: [{
          // rather than compiling multiple files here you should
          // require them into your main .coffee file
          expand: true,
          cwd: '<%= yeoman.app %>/scripts',
          src: '*.coffee',
          dest: '.tmp/scripts',
          ext: '.js'
        }]
      },
      test: {
        files: [{
          expand: true,
          cwd: '.tmp/spec',
          src: '*.coffee',
          dest: 'test/spec'
        }]
      }
    },
		jade: {
      html: {
        options: {
          pretty: true,
          data: { debug: true }
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: '*.jade',
          dest: '.tmp',
          ext: '.html'
        }]
      },
      dist: {
        options: {
          pretty: true,
          data: { debug: false }
        },
        src: '<%= yeoman.app %>/index.jade',
        dest: '<%= yeoman.app %>/index.html'
      }
		},
    concat: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '.tmp/scripts/*.js',
            '<%= yeoman.app %>/scripts/*.js'
          ]
        }
      }
    },
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      options: {
        dirs: ['<%= yeoman.dist %>']
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: '<%= yeoman.dist %>/images'
        }]
      }
    },
    cssmin: {
      dist: {
        files: {
          '<%= yeoman.dist %>/styles/main.css': [
            '.tmp/styles/{,*/}*.css',
            '<%= yeoman.app %>/styles/{,*/}*.css'
          ]
        }
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*removeCommentsFromCDATA: true,
          // https://github.com/yeoman/grunt-usemin/issues/44
          //collapseWhitespace: true,
          collapseBooleanAttributes: true,
          removeAttributeQuotes: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeOptionalTags: true*/
        },
        files: [{
          expand: true,
          cwd: '<%= yeoman.app %>',
          src: ['*.html', 'views/*.html'],
          dest: '<%= yeoman.dist %>'
        }]
      }
    },
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },
    ngmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.dist %>/scripts',
          src: '*.js',
          dest: '<%= yeoman.dist %>/scripts'
        }]
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/scripts.js': [
            '<%= yeoman.dist %>/scripts/scripts.js'
          ],
        }
      }
    },
    offline: {
      options: {
        dest: 'index_offline.html',
        source: 'index.html'
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.app %>',
          dest: '<%= yeoman.dist %>',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            'components/**/*'
          ]
        }]
      }
    }
  });

  grunt.renameTask('regarde', 'watch');
  // remove when mincss task is renamed
  grunt.renameTask('mincss', 'cssmin');

  grunt.registerTask('server', [
    'clean:server',
    'jade:html',
    'coffee:dist',
    'livereload-start',
    'connect:livereload',
    'open',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'jade:html',
    'coffee',
    'connect:test',
    'testacular'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'jade:dist:release',
    'jshint',
    //'test',
    'coffee',
    'useminPrepare',
    'imagemin',
    'cssmin',
    'htmlmin',
    'concat',
    'copy',
    'cdnify',
    'usemin',
    'ngmin',
    'uglify'
  ]);

  grunt.registerTask('default', ['build']);

  // Alias the `test` task to run `testacular` instead
  grunt.registerTask('test', 'run the testacular test driver', function () {
    var done = this.async();
    require('child_process').exec('testacular start --single-run', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });

  grunt.registerTask('buildall', ['build', 'offline']);

  grunt.registerTask('offline', 'build offline page', function () {
    process.chdir('dist');
    var lines,
      options = this.options(),
      pattern = new RegExp('<(script|link).*(src|href)="([^"]+)"[^>]*>(.*)', 'i');
    console.log( options );
    lines = grunt.file.read(options.source).split(/\n/).map(function (line) {
      var contents, file, post, match;
      match = line.match(pattern);
      if (!(match && match[1] && match[3])) {
        return line;
      }
      grunt.log.writeln(match);
      file = match[3];
      post = match[4];
      contents = grunt.file.read(file);
      if (match[1] === 'link') {
        return '<style>' + contents + '</style>' + post;
      } else {
        return '<script>' + contents + post;
      }
    });
    grunt.file.write(options.dest, lines.join('\n'));
    grunt.log.writeln('offline build task complete.');
  });

};
