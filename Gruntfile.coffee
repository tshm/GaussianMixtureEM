sys = require 'sys'

module.exports = (grunt) ->
	grunt.initConfig
		lint:
			all: ['js/**/*.js']
		jshint:
			options:
				browser: true
		build:
			options:
				dest: 'index_offline.html'
				source: 'source.html'

	grunt.registerTask 'build', 'build offline page', () ->
		options = this.options()
		lines = grunt.file.read(options.source).split(/\n/).map (line) ->
			match = line.match /<script .*src=\s*"([^\s]*)"/i
			return line unless match && match[1]
			jsfile = "#{match[1]}"
			#grunt.log.writeln "#{sys.inspect jsfile}" if jsfile
			js = grunt.file.read jsfile
			#return "<script>#{jsfile}</script>"
			return "<script>#{js}</script>"
		grunt.file.write(options.dest, lines.join "\n")
		grunt.log.writeln 'build task complete.'

