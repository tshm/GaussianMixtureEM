# Build script to create offline version and CDN linked version of the html file.
require 'rubygems'
SRC = 'source.html'
JS = FileList['js/*.js']
EXTERN = 'extern.js'
JSOUT = 'tmp.out.js'
OUT_ONLINE  = 'index.html'
OUT_OFFLINE = 'offline.html'
COMPILER = Dir['**/*.jar'][0]

CDNJS = "http://cdnjs.cloudflare.com/ajax/libs/"
GGL   = "http://ajax.googleapis.com/ajax/libs/"
TWIT  = "http://netdna.bootstrapcdn.com/twitter-bootstrap/2.2.2/"
LIB_MAPS = {  # devel files => deploy paths
  "lib/bootstrap.css" => TWIT+"css/bootstrap-combined.min.css",
  "lib/bootstrap.js" => TWIT+"js/bootstrap.min.js",
  "lib/html5shiv.js" => CDNJS+"html5shiv/3.6.1/html5shiv.js",
  "lib/json3.min.js" => CDNJS+"json3/3.2.4/json3.min.js",
  "lib/jquery.flot.min.js" => CDNJS+"flot/0.7/jquery.flot.min.js",
  "lib/jquery-ui.css" => GGL+"jqueryui/1/themes/trontastic/jquery-ui.css",
  "lib/jquery.js" => GGL+"jquery/1/jquery.min.js",
  "lib/jquery-ui.js" => GGL+"jqueryui/1/jquery-ui.min.js",
  "lib/angular.js" => GGL+"angularjs/1.0.3/angular.min.js",
  "lib/md5.js" => "http://labs.cybozu.co.jp/blog/mitsunari/2007/07/24/js/md5.js"
}

task :default => :publish

file JSOUT => [JS, EXTERN] do
  OPTIONS = {}
  OPTIONS['js_output_file'] = JSOUT
  OPTIONS['externs'] = EXTERN
  OPTIONS['compilation_level'] = 'SIMPLE_OPTIMIZATIONS'#'ADVANCED_OPTIMIZATIONS'
  #OPTIONS['formatting'] = 'PRETTY_PRINT'
  OPTION = OPTIONS.map {|k,v| "--#{k} #{v}"}.join(" ")
  sh "java -jar #{COMPILER} #{OPTION} --js #{JS}"
end

task :optimize => [SRC, JSOUT] do
  open(OUT, "w") do |file|
    IO.foreach(SRC) do |line|
      # replace with minified version if not
      _, js, ext = line.match(/<script.+src="(lib.*\.js)".+/).to_a
      if (_)
        ap js
      end
      # inject javascript into html
      _, indent, dummy = line.match(/(\s*)<script.+testpage.js/).to_a
      if (_)
        file.print "<script>#{open(JSOUT).read}</script>"
        next
      end
      file.print line
    end
  end
end

task :publish => JS.push(SRC) do
  puts "publishing"
  embed(OUT_ONLINE, :online)
  embed(OUT_OFFLINE, :offline)
end

def embed(file, type = :online)
  open(file, "w") do |file|
    IO.foreach(SRC) do |line|
      # remove debugging code
      line.gsub!(/debug = true/, 'debug = false')
      # replace with minified version if not
      _, src, ext = line.match(/^.*"(lib.*\.(js|css))".+/).to_a
      if (_)
        if type == :online
          p _
          line.sub!(src, LIB_MAPS[src])
        else
          file.puts (ext == "js" ? "<script>" : "<style>" )
          require 'open-uri'
          puts src
          open(LIB_MAPS[src]) do |read_file|
            file.print read_file.read
          end
          file.puts (ext == "js" ? "</script>" : "</style>" )
          next
        end
      else
        # inject offline javascript into html
        _, indent, jssrc, dummy = line.match(/(\s*)<script .+"(js\/.+.js)/).to_a
        if (_)
          p jssrc
          file.print "<script>\n#{open(jssrc).read}\n</script>"
          next
        end
      end
      file.print line
    end
  end
end
