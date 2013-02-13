/*global require:true, process:true, console:true */
module.exports = function( grunt ) {
  'use strict';

	//grunt.loadNpmTasks('grunt-contrib-jade');

  //
  // Grunt configuration:
  //
  // https://github.com/cowboy/grunt/blob/master/docs/getting_started.md
  //
  grunt.initConfig({

    // Project configuration
    // ---------------------

    // specify an alternate install location for Bower
    bower: {
      dir: 'app/components'
    },

    // Coffee to JS compilation
    coffee: {
      compile: {
        files: {
          'app/scripts/*.js': 'app/scripts/**/*.coffee',
          'test/spec/*.js': 'test/spec/**/*.coffee'
        }
      }
    },

    // compile .scss/.sass to .css using Compass
    compass: {
      dist: {
        // http://compass-style.org/help/tutorials/configuration-reference/#configuration-properties
        options: {
          css_dir: 'temp/styles',
          sass_dir: 'app/styles',
          images_dir: 'app/images',
          javascripts_dir: 'temp/scripts',
          force: true
        }
      }
    },

    // generate application cache manifest
    manifest:{
      dest: ''
    },

    // default watch configuration
    watch: {
			jade: {
				files: 'app/*.jade',
				tasks: 'jade reload'
			},
      coffee: {
        files: 'app/scripts/**/*.coffee',
        tasks: 'coffee reload'
      },
      compass: {
        files: [
          'app/styles/**/*.{scss,sass}'
        ],
        tasks: 'compass reload'
      },
      reload: {
        files: [
          'app/*.html',
          'app/styles/**/*.css',
          'app/scripts/**/*.js',
          'app/views/**/*.html',
          'app/images/**/*'
        ],
        tasks: 'reload'
      }
		},

    // default lint configuration, change this to match your setup:
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#lint-built-in-task
    lint: {
      files: [
        'Gruntfile.js',
        'app/scripts/**/*.js',
        'spec/**/*.js'
      ]
    },

    // specifying JSHint options and globals
    // https://github.com/cowboy/grunt/blob/master/docs/task_lint.md#specifying-jshint-options-and-globals
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        angular: true
      }
    },

    // Build configuration
    // -------------------

    // the staging directory used during the process
    staging: 'temp',
    // final build output
    output: 'dist',

    mkdirs: {
      staging: 'app/'
    },

    // Below, all paths are relative to the staging directory, which is a copy
    // of the app/ directory. Any .gitignore, .ignore and .buildignore file
    // that might appear in the app/ tree are used to ignore these values
    // during the copy process.

    // concat css/**/*.css files, inline @import, output a single minified css
    css: {
      'styles/main.css': ['styles/**/*.css']
    },

    // renames JS/CSS to prepend a hash of their contents for easier
    // versioning
    rev: {
      js: 'scripts/**/*.js',
      css: 'styles/**/*.css',
      img: 'images/**'
    },

    // usemin handler should point to the file containing
    // the usemin blocks to be parsed
    'usemin-handler': {
      html: 'index.html'
    },

    // update references in HTML/CSS to revved files
    usemin: {
      html: ['**/*.html'],
      css: ['**/*.css']
    },

    // HTML minification
    html: {
      files: ['**/*.html']
    },

    // Optimizes JPGs and PNGs (with jpegtran & optipng)
    img: {
      dist: '<config:rev.img>'
    },

    // rjs configuration. You don't necessarily need to specify the typical
    // `path` configuration, the rjs task will parse these values from your
    // main module, using http://requirejs.org/docs/optimization.html#mainConfigFile
    //
    // name / out / mainConfig file should be used. You can let it blank if
    // you're using usemin-handler to parse rjs config from markup (default
    // setup)
    rjs: {
      // no minification, is done by the min task
      optimize: 'none',
      baseUrl: './scripts',
      wrap: true
    },

    offline: {
      options: {
        dest: 'index_offline.html',
        source: 'index.html'
      }
    },

		jade: {
      options: {pretty: true},
      html: {
        src: 'app/index.jade', dest: 'app/index.html'
      }
		}
  /*
		jade: {
      options: {
        data: {
          debug: true
        }
      },
      html: {
        files: [{
          expand: true,
          cwd: 'app',
          src: '*.jade',
          dest: 'app',
          ext: '.html'
        }]
      }
		}
    jade: {
      compile: {
        files: {
          'app/*.html': 'app/*.jade'
        }
      }
    }
		*/

  });

  // Alias the `test` task to run `testacular` instead
  grunt.registerTask('test', 'run the testacular test driver', function () {
    var done = this.async();
    require('child_process').exec('testacular start --single-run', function (err, stdout) {
      grunt.log.write(stdout);
      done(err);
    });
  });

  grunt.registerTask('buildall', ['build', 'offline']);

  grunt.registerTask('offline', 'build offline page', function() {
    process.chdir('dist');
    var lines,
      options = this.options(),
      pattern = new RegExp('<(script|link).*(src|href)="([^"]+)"[^>]*>(.*)', 'i');
    lines = grunt.file.read(options.source).split(/\n/).map(function(line) {
      var contents, file, post, match;
      match = line.match(pattern);
      if (!(match && match[1] && match[3])) {
        return line;
      }
      grunt.log.writeln(match);
      file = match[3];
      post = match[4];
      contents = grunt.file.read(file);
      if (match[1] === "link") {
        return "<style>" + contents + "</style>" + post;
      } else {
        return "<script>" + contents + post;
      }
    });
    grunt.file.write(options.dest, lines.join("\n"));
    grunt.log.writeln('offline build task complete.');
  });

	grunt.registerMultiTask('jade', 'compile Jade files', function() {
    grunt.util = grunt.util || grunt.utils;
    var path = require('path');
    //var helpers = require('grunt-lib-contrib').init(grunt);
    //this.files = this.files || helpers.normalizeMultiTaskFiles(this.data, this.target);
    //this.files = grunt.helper('normalizeMultiTaskFiles', this.data, this.target);

		var options = this.options();
		var data = this.data;
		var debug = false;
		if (debug) {
			console.log({
				//xx: grunt.file.expandMapping( this.files.src, this.files.dest, this.files ),
        current: JSON.stringify( grunt.task.current ),
				files: JSON.stringify( this.files ),
				//src: this.files[0].src,
				options: options,
        data: JSON.stringify( data ),
				self: this
			});
		}
		var jade = require('jade');
		//if (debug) console.log( this.files[0].src );
		//if (debug) console.log( grunt.file.expand( this.files[0].src[0] ) );
		this.files.forEach(function(file) {
			//if (debug) console.log( grunt.file.expand( file.src ) );
			//file.src = grunt.file.expand( file.src );
			if (debug) console.log( file );
			var code = grunt.file.read(file.src);
			//var options = grunt.util._.extend({filename: file}, options);
			var html = jade.compile(code, options)();
			grunt.file.write(file.dest, html);
      //grunt.log.writeln( html );
		});
		//lines = grunt.file.read(options.source).split(/\n/).map(function(line) {
	});
};
