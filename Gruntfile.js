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

/*
		jade: {
			html: {
				src: ['app/*.jade'],
				dest: 'app',
				options: {
					client: false
				}
			}
		}
		*/
		jade: {
			compile: {
				options: {
					data: {
						debug: true
					}
				},
				files: [{
					expand: true,
					cwd: 'app',
					src: '*.jade',
					dest: 'app',
					ext: '.html'
				}]
			}
		}

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
    var lines, options;
    options = this.options();
    lines = grunt.file.read(options.source).split(/\n/).map(function(line) {
      var js, jsfile, match;
      match = line.match(/<script .*src=\s*"([^\s]*)"/i);
      if (!(match && match[1])) {
        return line;
      }
      jsfile = "" + match[1];
      js = grunt.file.read(jsfile);
      return "<script>" + js + "</script>";
    });
    grunt.file.write(options.dest, lines.join("\n"));
    grunt.log.writeln('offline build task complete.');
  });

	grunt.registerMultiTask('jade', 'compile Jade files', function() {
		var debug = true;
		if (debug) {
			console.log({
				xx: grunt.file.expandMapping( this.files.src, this.files.dest, this.files ),
				files: this.files,
				src: this.files[0].src,
				self: this,
				options: options
			});
		}
		return;
		var options = this.options();
		var jade = require('jade');
		//if (debug) console.log( this.files[0].src );
		//if (debug) console.log( grunt.file.expand( this.files[0].src[0] ) );
		this.files.forEach(function(file) {
			if (debug) console.log( grunt.file.expand( file.src ) );
			file.src = grunt.file.expand( file.src );
			if (debug) console.log( file );
			var code = grunt.file.read(file.src[0]);
			//var options = grunt.util._.extend({filename: file}, options);
			var html = jade.compile(code)(options);
			grunt.file.write(file.dest, html);
		});
		//lines = grunt.file.read(options.source).split(/\n/).map(function(line) {
	});
};
