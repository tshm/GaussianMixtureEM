(function(){var a,b=function(a,b){return function(){return a.apply(b,arguments)}};a=function(){function a(a,c){var d,e,f,g,h,i,j,k,l,m,n;for(this.x=a,this.model=c,this.g=b(this.g,this),this.D=1,this.N=this.x.length,this.K=this.model.length,h=this.model.reduce(function(a,b){return a+b.p},0),this.m=[],this.s=[],this.p=[],d=i=0,l=this.K;l>=0?l>i:i>l;d=l>=0?++i:--i)this.m[d]=this.model[d].m,this.s[d]=this.model[d].s,this.p[d]=this.model[d].p/h;for(g=1/this.K,this.pmem=[],e=j=0,m=this.K;m>=0?m>j:j>m;e=m>=0?++j:--j)for(this.pmem[e]=[],f=k=0,n=this.N;n>=0?n>k:k>n;f=n>=0?++k:--k)this.pmem[e][f]=g;this.gconst=1/Math.pow(Math.sqrt(2*Math.PI),this.D),this.L=this.loglikelihood()}return a.prototype.g=function(a,b,c){return this.gconst/Math.pow(c,this.D)*Math.exp(-.5*Math.pow((a-b)/c,2))},a.prototype.expectation=function(){var a,b,c,d,e,f,g,h,i,j;for(c=[],b=e=0,h=this.N;h>=0?h>e:e>h;b=h>=0?++e:--e){for(c[b]=[],d=0,a=f=0,i=this.K;i>=0?i>f:f>i;a=i>=0?++f:--f)c[b][a]=this.p[a]*this.g(this.x[b],this.m[a],this.s[a]),d+=c[b][a];for(a=g=0,j=this.K;j>=0?j>g:g>j;a=j>=0?++g:--g)this.pmem[a][b]=c[b][a]/d}},a.prototype.maximization=function(){var a,b,c,d,e,f,g,h,i,j,k,l,m;for(a=h=0,k=this.K;k>=0?k>h:h>k;a=k>=0?++h:--h){for(g=f=e=0,d=this.pmem[a],c=i=0,l=this.N;l>=0?l>i:i>l;c=l>=0?++i:--i)g+=this.x[c]*d[c],e+=d[c];for(b=g/e,c=j=0,m=this.N;m>=0?m>j:j>m;c=m>=0?++j:--j)f+=d[c]*(this.x[c]-b)*(this.x[c]-b);this.m[a]=b,this.s[a]=Math.sqrt(f/e/this.D),this.p[a]=e/this.N}},a.prototype.loglikelihood=function(){var a,b,c,d,e,f,g,h;for(b=e=0,g=this.N;g>=0?g>e:e>g;b=g>=0?++e:--e){for(c=d=0,a=f=0,h=this.K;h>=0?h>f:f>h;a=h>=0?++f:--f)d+=this.p[a]*this.g(this.x[b],this.m[a],this.s[a]);d&&(c+=Math.log(d))}return c},a.prototype.step=function(){return this.expectation(),this.maximization(),this.L=this.loglikelihood()},a.prototype.run=function(){var a,b,c;for(b=c=0;100>c;b=++c)if(a=this.L,console.log(""+b+" LogLikelihood: "+this.L),this.step(),!isFinite(this.L)||Math.abs(this.L-a)<.1)return},a.prototype.getResult=function(){var a,b,c,d;for(b=[],a=c=0,d=this.K;d>=0?d>c:c>d;a=d>=0?++c:--c)b[a]={m:this.m[a],s:this.s[a],p:this.p[a]};return{model:b,L:this.L}},a}(),this.GMEM=a}).call(this);