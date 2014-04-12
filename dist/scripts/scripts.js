window.console=window.console||{log:function(){}};var app=angular.module("emjsAppDirectives",[]);app.directive("dropArea",function(){return{scope:{files:"=dropArea"},transclude:!0,template:"<div ng-transclude></div>",link:function(a,b){b.bind("dragover",function(a){a.stopPropagation(),a.preventDefault()}),b.bind("drop",function(b){b.stopPropagation(),b.preventDefault(),a.$apply(function(){a.files=b.originalEvent.dataTransfer.files})})}}}),app.directive("fileSelect",function(){var a='<input type="file" multiple name="files" style="display:none"/>';return{scope:{files:"=fileSelect"},link:function(b,c){var d=$(a);c.append(d),d.bind("change",function(a){b.$apply(function(){b.files=a.originalEvent.target.files})}),d.click(function(a){a.stopPropagation()}),c.bind("click",function(a){a.stopPropagation(),a.preventDefault(),d.click()})}}}),app.directive("flot",function(){return{scope:{graphdata:"=flot",click:"&"},replace:!1,link:function(a,b){a.$watch("graphdata",function(a){a.series&&a.options&&$.plot(b,a.series,a.options)},!0),b.bind("plotclick",function(b,c,d){var e={x:c.x,y:c.y};d&&(e.dataIndex=d.dataIndex,e.seriesIndex=d.seriesIndex),a.click({args:e})}),b.bind("plotselected",function(a,b){console.log([a,b])})}}}),app.directive("arrBind",function(){return{restrict:"A",scope:{array:"=arrBind"},link:function(a,b){a.$watch("array",function(a){b.val(a?a.join("\n"):"")},!0),b.bind("change",function(){var c=b.val().split(/\n/).map(function(a){return+a});angular.copy(c,a.array),a.$apply()})}}}),app.directive("focus",["$timeout",function(a){return function(b,c,d){c.bind("focus",function(){!0!==b.$eval(d.focus)&&b.$apply(d.focus+" = true")}),c.bind("blur",function(){!1!==b.$eval(d.focus)&&a(function(){b.$eval(d.focus+" = false")},500)}),b.$watch(d.focus,function(a){$(c).trigger(a?"focus":"blur")})}}]);var GMEM=window.GMEM,app=angular.module("emjsApp",["emjsAppDirectives"]),hist=function(a,b,c,d){for(var e=[],f=1/a.length,g=b-c/2,h=0;d>h;h++)e[h]=[g+h*c,0];return angular.forEach(a,function(a){var b=Math.floor((a-g)/c);b=0>b?0:b,b=b>d-1?d-1:b,e[b][1]+=f}),e},getHistogram=function(a,b){var c,d=b[0],e=d;return angular.forEach(b,function(a){d>a&&(d=a),a>e&&(e=a)}),c=5+Math.floor((e-d)/a),hist(b,d-2*a,a,c)},estimateInitialParam=function(a){for(var b=0,c=0,d=0;d<a.length;d++)c<a[d][1]&&(c=a[d][1],b=a[d][0]);var e=.5*(a[0][0]+a[a.length-1][0]),f=(a[a.length-1][0]-a[0][0])/8,g=parseInt((b-e)/f,10);return g>=1&&(b-=500),-1>=g&&(b+=500),[{m:b-500,s:30,p:1},{m:b,s:30,p:1},{m:b+500,s:30,p:1}]};app.factory("filelistLoader",function(){return{load:function(a,b){var c=[];return angular.forEach(a,function(a,d){var e=new FileReader;e.onload=function(a){var c=a.target.result,e=c.split(/[#\s]+/).map(function(a){return+a}).filter(function(a){return a>0});b(d,e)},e.readAsText(a),c[d]=a.name}),c}}}),app.controller("MainCtrl",["$scope","filelistLoader",function(a,b){var c=[4391,4359,4328,3938,4359,4313,4500,3906,4344,4546,4109,4469,4531,3813,3922,4328,4516,4406,4328,4313,3844,3406,4313,4422,3875,3844,4375,3875,4328,4344,4375,3922,3391,4359,4344,3844,4687,4297,3328,4359,4406,3907,3906,3859,3813,3375,4312,3813,3890,3375,4781,3937,3344,3359,3907,3844,4406,4407,3343,3375,4329,4546,4329,3359,4391,3360,3344,4344,4390,3875,3422,4297,3921,3875,3813,4297,4031,3391,3875,3859,3812,3891,3391,3343,3828],d={name:"sample_data",show:!0,samples:c,histogram:{binsize:null,bins:[]},model:{params:[],pdf:null}};a.datasets=[angular.copy(d)],a.addDataSet=function(b){a.datasets.splice(1+b,0,angular.copy(d))};var e=function(b){var c=b.getData(),d=0;a.datasets.forEach(function(a){a.color=a.show&&c[3*d]&&c[3*d++].color||"#FFF"})};a.graphdata={series:[],options:{series:{},hooks:{draw:[e]},grid:{hoverable:!0,clickable:!0}}},a.makeGraphData=function(){var b=[],c=function(a,b,c){if(a&&b&&c){var d,e=a[0][0],f=a[a.length-1][0],g=(f-e)/(a.length-1),h=[],i=[];if(b){for(var j=e;f>j;j+=.1*g){var k=0;for(d=0;d<b.length;d++)k+=b[d].p*c(j,b[d].m,b[d].s);h.push([j,g*k])}for(d=0;d<b.length;d++)i[d]=[b[d].m,0]}return{binsize:g,pdist:h,means:i}}};a.datasets.forEach(function(a,d){if(a.show){var e=c(a.histogram.bins,a.model.params,a.model.pdf);if(e){var f=d+": "+a.name;b.push({color:d,data:a.histogram.bins,bars:{show:!0,barWidth:e.binsize}}),b.push({color:d,label:f,data:e.pdist,lines:{show:!0}}),b.push({color:d,points:{show:!0},data:e.means})}}}),a.graphdata.series=b},a.$watch("datasets",function(){a.makeGraphData()},!0),a.plotclick=function(b){a.$broadcast("plotclick",b)},a.$watch("dropFiles",function(c){if(c){console.log("files droppped into the plot.",c),a.datasets=[];var e=b.load(c,function(b,c){a.datasets[b].samples=c,a.$apply()});e.forEach(function(b){var c=angular.copy(d);angular.extend(c,{name:b,samples:[]}),a.datasets.push(c)})}})}]),app.controller("DataItemCtrl",["$scope","filelistLoader",function(a,b){a.setInitialCondition=function(b){console.log("setInitialCondition called."),a.runEstimation(b,a.dataset.samples)},a.$watch("dataset.histogram.binsize",function(b){b&&(a.dataset.histogram.bins=getHistogram(b,a.dataset.samples))}),a.runEstimation=function(b,c){a.calculating=!0,a.em=new GMEM(c,b),console.log(a.em),a.em.run();var d=a.em.getResult();a.dataset.model.params=d.model,a.dataset.model.L=d.L,a.dataset.model.pdf=a.em.g,a.calculating=!1},a.$watch("dataset.samples",function(b){!b||b.length<3||(console.log("samples updated: ",b.slice(0,5)),a.dataset.histogram.binsize=function(a){for(var b=a.length,c=a[0],d=a[0],e=0;b>e;e++)a[e]<c&&(c=a[e]),a[e]>d&&(d=a[e]);return Math.round((d-c)/Math.sqrt(b)/3)}(b),a.dataset.histogram.bins=getHistogram(a.dataset.histogram.binsize,b),a.initParams=a.initParams||estimateInitialParam(a.dataset.histogram.bins),a.runEstimation(a.initParams,b))},!0),a.$watch("dataset.filelist",function(c){c&&(console.log("filelist changed : ",c),a.dataset.name=b.load(c,function(b,c){0===b&&(a.dataset.samples=c,a.$apply(),console.log(b,a.dataset.samples.slice(0,5)))})[0])}),a.$on("plotclick",function(b,c){console.log("plotclick",b,c),a.initParams.forEach(function(b,d){b.focus&&(a.initParams[d].m=c.x)})}),a.sort=function(){console.log("sort triggered"),a.dataset.samples.sort()},a.remove=function(b){delete a.initParams[b],a.initParams.splice(b,1),a.setInitialCondition(a.initParams)}}]);