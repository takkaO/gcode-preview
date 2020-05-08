import{Scene as t,Color as e,PerspectiveCamera as s,WebGLRenderer as i,Group as r,Euler as n,BufferGeometry as a,Float32BufferAttribute as o,LineBasicMaterial as h,LineSegments as c}from"three";import*as l from"three-orbitcontrols";class m extends class{constructor(t,e){this.gcode=t,this.comment=e}}{constructor(t,e,s){super(t,s),this.params=e}}class d{constructor(t,e){this.layer=t,this.commands=e}}class p{parseCommand(t,e=!0){const s=t.trim().split(";"),i=s[0],r=e&&s[1]||null,n=i.split(/ +/g),a=n[0].toLowerCase();switch(a){case"g0":case"g1":const t=this.parseMove(n.slice(1));return new m(a,t,r);default:return null}}parseMove(t){return t.reduce((t,e)=>{const s=e.charAt(0).toLowerCase();return"x"!=s&&"y"!=s&&"z"!=s&&"e"!=s||(t[s]=parseFloat(e.slice(1))),t},{})}groupIntoLayers(t){const e=[];let s,i=0;for(const r of t.filter(t=>t instanceof m)){const t=r.params;t.z&&t.z>i&&(0!=i||t.z<2)?(i=t.z,s=new d(e.length,[r]),e.push(s)):s&&s.commands.push(r)}return e}parseGcode(t){console.time("parsing");const e=t.split("\n").filter(t=>t.length>0).map(t=>this.parseCommand(t)).filter(t=>null!==t),s=this.groupIntoLayers(e),i=s.length-1;return console.timeEnd("parsing"),{header:{slicer:"MySlicer"},layers:s,limit:i}}parseHeader(t){return{slicer:t.filter(t=>null!==t.comment).map(t=>t.comment).filter(t=>/(G|g)enerated/.test(t)).map(t=>t.includes("Slic3r")?"Slic3r":t.includes("Simplify3D")?"Simplify3D":t.includes("Cura_SteamEngine")?"Cura_SteamEngine":void 0)[0]}}}class g{constructor(r){if(this.parser=new p,this.backgroundColor=14737632,this.travelColor=10027008,this.extrusionColor=65280,this.renderExtrusion=!0,this.renderTravel=!1,this.limit=r.limit,this.scene=new t,this.scene.background=new e(this.backgroundColor),this.targetId=r.targetId,this.container=document.getElementById(this.targetId),!this.container)throw new Error("Unable to find element "+this.targetId);this.camera=new s(75,this.container.offsetWidth/this.container.offsetHeight,.1,1e3),this.camera.position.set(0,0,50),this.renderer=new i({preserveDrawingBuffer:!0}),this.renderer.setSize(this.container.offsetWidth,this.container.offsetHeight),this.renderer.setPixelRatio(window.devicePixelRatio),this.canvas=this.renderer.domElement,this.container.appendChild(this.canvas);new l(this.camera,this.renderer.domElement);this.animate()}animate(){requestAnimationFrame(()=>this.animate()),this.renderer.render(this.scene,this.camera)}processGCode(t){const{header:e,layers:s,limit:i}=this.parser.parseGcode(t);this.header=e,this.layers=s,this.limit=i,console.time("rendering webgl"),this.render(),console.timeEnd("rendering webgl")}render(){for(;this.scene.children.length>0;)this.scene.remove(this.scene.children[0]);this.group=new r,this.group.name="gcode";const t={x:0,y:0,z:0,e:0};for(let s=0;s<this.layers.length&&!(s>this.limit);s++){const i={extrusion:[],travel:[],z:t.z},r=this.layers[s];for(const e of r.commands)if("g0"==e.gcode||"g1"==e.gcode){const s=e,r={x:void 0!==s.params.x?s.params.x:t.x,y:void 0!==s.params.y?s.params.y:t.y,z:void 0!==s.params.z?s.params.z:t.z,e:void 0!==s.params.e?s.params.e:t.e},n=s.params.e>0;this.addLineSegment(i,t,r,n),s.params.x&&(t.x=s.params.x),s.params.y&&(t.y=s.params.y),s.params.z&&(t.z=s.params.z),s.params.e&&(t.e=s.params.e)}const n=Math.round(80*s/this.layers.length),a=new e(`hsl(0, 0%, ${n}%)`).getHex();this.renderExtrusion&&this.addLine(i.extrusion,a),this.renderTravel&&this.addLine(i.travel,this.travelColor)}this.group.quaternion.setFromEuler(new n(-Math.PI/2,0,0)),this.group.position.set(-100,-20,100),this.scene.add(this.group),this.renderer.render(this.scene,this.camera)}resize(){this.renderer.setSize(this.container.offsetWidth,this.container.offsetHeight),this.renderer.setPixelRatio(window.devicePixelRatio),this.camera.aspect=this.container.offsetWidth/this.container.offsetHeight,this.camera.updateProjectionMatrix()}addLineSegment(t,e,s,i){const r=i?t.extrusion:t.travel;r.push(e.x,e.y,e.z),r.push(s.x,s.y,s.z)}addLine(t,e){const s=new a;s.setAttribute("position",new o(t,3));const i=new h({color:e}),r=new c(s,i);this.group.add(r)}}class u{constructor(t){if(this.lineWidth=.6,this.parser=new p,this.limit=t.limit,this.scale=t.scale,t.lineWidth&&(this.lineWidth=t.lineWidth),this.rotation=void 0===t.rotation?0:t.rotation,this.rotationAnimation=t.rotationAnimation,this.zoneColors=t.zoneColors,t.canvas instanceof HTMLCanvasElement)this.canvas=t.canvas,this.ctx=this.canvas.getContext("2d");else{if(this.targetId=t.targetId,this.container=document.getElementById(this.targetId),!this.container)throw new Error("Unable to find element "+this.targetId);this.canvas=document.createElement("canvas"),this.ctx=this.canvas.getContext("2d"),this.container.appendChild(this.canvas),this.resize()}}clear(){this.ctx.clearRect(-this.canvas.width/2,-this.canvas.height/2,this.canvas.width,this.canvas.height)}resize(){this.canvas.width=this.canvas.parentNode.offsetWidth,this.canvas.height=this.canvas.offsetHeight}renderWithColor(t,e,s){if(s)this.ctx.strokeStyle=s;else{const t=Math.round(e/this.layers.length*80);this.ctx.strokeStyle="hsl(0, 0%, "+t+"%)"}this.ctx.beginPath();for(const e of t.commands)if("g0"==e.gcode){const t=e;this.ctx.moveTo(t.params.x,t.params.y)}else if("g1"==e.gcode){const t=e;t.params.e>0?this.ctx.lineTo(t.params.x,t.params.y):this.ctx.moveTo(t.params.x,t.params.y)}this.ctx.stroke()}drawLayer(t,e){if(t>e)return;const s=this.layers[t],i=this.projectIso({x:0,y:0},t);this.ctx.save(),this.ctx.scale(this.scale,this.scale),this.ctx.translate(i.x,i.y),this.ctx.rotate(this.rotation*Math.PI/180),this.ctx.translate(-this.center.x,-this.center.y),this.renderWithColor(s,t),this.ctx.restore()}render(){this.canvas.width=this.canvas.width,this.ctx.lineWidth=this.lineWidth,this.ctx.scale(1,-1),this.ctx.translate(this.canvas.width/2,-this.canvas.height/2),this.center=this.getAdjustedCenter();for(let t=0;t<this.layers.length;t++)this.drawLayer(t,this.limit)}processGCode(t){const{header:e,layers:s,limit:i}=this.parser.parseGcode(t);this.header=e,this.layers=s,this.limit=i,console.time("rendering"),this.render(),console.timeEnd("rendering")}animationLoop(){this.rotationAnimation&&(requestAnimationFrame(this.animationLoop.bind(this)),this.rotation+=2,this.rotation%=360,this.render())}startAnimation(){this.rotationAnimation=!0,this.animationLoop()}stopAnimation(){this.rotationAnimation=!1}getOuterBounds(t){const e=t||this.layers[0];let s=1/0,i=-1/0,r=1/0,n=-1/0;for(let t of e.commands){if("g91"==t.gcode)break;"g0"!=t.gcode&&"g1"!=t.gcode||(t.params.x<s&&(s=t.params.x),t.params.x>i&&(i=t.params.x),t.params.y<r&&(r=t.params.y),t.params.y>n&&(n=t.params.y))}return{minX:s,maxX:i,minY:r,maxY:n}}getCenter(t){const e=t||this.layers[0],s=this.getOuterBounds(e);return{x:s.minX+(s.maxX-s.minX)/2,y:s.minY+(s.maxY-s.minY)/2}}getAdjustedCenter(){const t=this.getCenter(this.layers[0]);return this.maxProjectionOffset=this.projectIso({x:0,y:0},this.layers.length-1),t.x+=this.maxProjectionOffset.x/2,t.y+=this.maxProjectionOffset.y/2,t}getSize(t){const e=t||this.layers[0],s=this.getOuterBounds(e);return{sizeX:s.maxX-s.minX,sizeY:s.maxY-s.minY}}drawBounds(t,e){this.ctx.strokeStyle=e;const{minX:s,maxX:i,minY:r,maxY:n}=this.getOuterBounds(t);console.log(s,r,i-s,n-r),this.ctx.strokeRect(s,r,i-s,n-r)}autoscale(){const{sizeX:t,sizeY:e}=this.getSize(),{width:s,height:i}=this.canvas;var r;return r=t/e>s/i?s/t:i/e,r*=.2}projectIso(t,e){return{x:t.x,y:t.y+.1*e}}}var x={Cura_SteamEngine:{skirt:"lime","wall-inner":"purple","wall-outer":"blue",skin:"red",fill:"orange",support:"rgba(255,255,255,0.5)"},Simplify3D:{skirt:"lime","inner perimeter":"purple","outer perimeter":"blue",skin:"solid layer",fill:"infill",support:"rgba(255,255,255,0.5)"}};export{x as Colors,u as Preview,g as WebGLPreview};
