/* SplashCursor — WebGL fluid simulation, yellow/gold palette
   Extracted from react-bits SplashCursor and adapted for vanilla JS */
(function () {
  /* ── Config ──────────────────────────────────────────── */
  const config = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1440,
    DENSITY_DISSIPATION: 3.5,
    VELOCITY_DISSIPATION: 2,
    PRESSURE: 0.1,
    PRESSURE_ITERATIONS: 20,
    CURL: 3,
    SPLAT_RADIUS: 0.2,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLOR_UPDATE_SPEED: 10,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: true
  };

  /* ── Canvas setup ────────────────────────────────────── */
  const wrapper = document.createElement('div');
  wrapper.style.cssText =
    'position:fixed;top:0;left:0;z-index:50;pointer-events:none;width:100%;height:100%;';
  const canvas = document.createElement('canvas');
  canvas.id = 'fluid';
  canvas.style.cssText = 'width:100vw;height:100vh;display:block;';
  wrapper.appendChild(canvas);
  document.body.prepend(wrapper);

  /* ── Pointer ─────────────────────────────────────────── */
  function Pointer() {
    this.id = -1;
    this.texcoordX = 0; this.texcoordY = 0;
    this.prevTexcoordX = 0; this.prevTexcoordY = 0;
    this.deltaX = 0; this.deltaY = 0;
    this.down = false; this.moved = false;
    this.color = [0, 0, 0];
  }
  const pointers = [new Pointer()];

  /* ── WebGL context ───────────────────────────────────── */
  const { gl, ext } = getWebGLContext(canvas);
  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 256;
    config.SHADING = false;
  }

  function getWebGLContext(canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2) gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat, supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }
    gl.clearColor(0, 0, 0, 1);

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
    let formatRGBA, formatRG, formatR;
    if (isWebGL2) {
      formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG   = getSupportedFormat(gl, gl.RG16F,   gl.RG,   halfFloatTexType);
      formatR    = getSupportedFormat(gl, gl.R16F,    gl.RED,  halfFloatTexType);
    } else {
      formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG   = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR    = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }
    return { gl, ext: { formatRGBA, formatRG, formatR, halfFloatTexType, supportLinearFiltering } };
  }

  function getSupportedFormat(gl, internalFormat, format, type) {
    if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
      if (internalFormat === gl.R16F)  return getSupportedFormat(gl, gl.RG16F,   gl.RG,   type);
      if (internalFormat === gl.RG16F) return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
      return null;
    }
    return { internalFormat, format };
  }

  function supportRenderTextureFormat(gl, internalFormat, format, type) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }

  /* ── Shader helpers ──────────────────────────────────── */
  function compileShader(type, source, keywords) {
    source = addKeywords(source, keywords);
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(shader));
    return shader;
  }
  function addKeywords(source, keywords) {
    if (!keywords) return source;
    return keywords.map(k => `#define ${k}\n`).join('') + source;
  }
  function createProgram(vs, fs) {
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) console.warn(gl.getProgramInfoLog(prog));
    return prog;
  }
  function getUniforms(program) {
    const u = [];
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const name = gl.getActiveUniform(program, i).name;
      u[name] = gl.getUniformLocation(program, name);
    }
    return u;
  }

  class Material {
    constructor(vs, fsSource) {
      this.vs = vs; this.fsSource = fsSource;
      this.programs = []; this.activeProgram = null; this.uniforms = [];
    }
    setKeywords(keywords) {
      let hash = 0;
      for (const k of keywords) for (let i = 0; i < k.length; i++) hash = ((hash << 5) - hash + k.charCodeAt(i)) | 0;
      let prog = this.programs[hash];
      if (!prog) {
        prog = createProgram(this.vs, compileShader(gl.FRAGMENT_SHADER, this.fsSource, keywords));
        this.programs[hash] = prog;
      }
      if (prog === this.activeProgram) return;
      this.uniforms = getUniforms(prog);
      this.activeProgram = prog;
    }
    bind() { gl.useProgram(this.activeProgram); }
  }

  class Program {
    constructor(vs, fs) {
      this.program = createProgram(vs, fs);
      this.uniforms = getUniforms(this.program);
    }
    bind() { gl.useProgram(this.program); }
  }

  /* ── Shaders ─────────────────────────────────────────── */
  const baseVS = compileShader(gl.VERTEX_SHADER, `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv,vL,vR,vT,vB;
    uniform vec2 texelSize;
    void main(){
      vUv=aPosition*.5+.5;
      vL=vUv-vec2(texelSize.x,0.);
      vR=vUv+vec2(texelSize.x,0.);
      vT=vUv+vec2(0.,texelSize.y);
      vB=vUv-vec2(0.,texelSize.y);
      gl_Position=vec4(aPosition,0.,1.);
    }`);

  const copyFS   = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;void main(){gl_FragColor=texture2D(uTexture,vUv);}`);
  const clearFS  = compileShader(gl.FRAGMENT_SHADER, `precision mediump float;precision mediump sampler2D;varying highp vec2 vUv;uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}`);

  const displayFSSource = `
    precision highp float;precision highp sampler2D;
    varying vec2 vUv,vL,vR,vT,vB;
    uniform sampler2D uTexture;uniform vec2 texelSize;
    vec3 linearToGamma(vec3 c){c=max(c,vec3(0.));return max(1.055*pow(c,vec3(0.4167))-.055,vec3(0.));}
    void main(){
      vec3 c=texture2D(uTexture,vUv).rgb;
      #ifdef SHADING
        vec3 lc=texture2D(uTexture,vL).rgb,rc=texture2D(uTexture,vR).rgb,
             tc=texture2D(uTexture,vT).rgb,bc=texture2D(uTexture,vB).rgb;
        float dx=length(rc)-length(lc),dy=length(tc)-length(bc);
        vec3 n=normalize(vec3(dx,dy,length(texelSize)));
        float diffuse=clamp(dot(n,vec3(0.,0.,1.))+.7,.7,1.);
        c*=diffuse;
      #endif
      float a=max(c.r,max(c.g,c.b));
      gl_FragColor=vec4(c,a);
    }`;

  const splatFS = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;precision highp sampler2D;
    varying vec2 vUv;uniform sampler2D uTarget;uniform float aspectRatio;
    uniform vec3 color;uniform vec2 point;uniform float radius;
    void main(){
      vec2 p=vUv-point.xy; p.x*=aspectRatio;
      vec3 splat=exp(-dot(p,p)/radius)*color;
      vec3 base=texture2D(uTarget,vUv).xyz;
      gl_FragColor=vec4(base+splat,1.);
    }`);

  const advectionFS = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;precision highp sampler2D;
    varying vec2 vUv;uniform sampler2D uVelocity,uSource;
    uniform vec2 texelSize,dyeTexelSize;uniform float dt,dissipation;
    vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){
      vec2 st=uv/ts-.5,iuv=floor(st),fuv=fract(st);
      vec4 a=texture2D(s,(iuv+vec2(.5,.5))*ts),b=texture2D(s,(iuv+vec2(1.5,.5))*ts),
           c=texture2D(s,(iuv+vec2(.5,1.5))*ts),d=texture2D(s,(iuv+vec2(1.5,1.5))*ts);
      return mix(mix(a,b,fuv.x),mix(c,d,fuv.x),fuv.y);
    }
    void main(){
      #ifdef MANUAL_FILTERING
        vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;
        vec4 result=bilerp(uSource,coord,dyeTexelSize);
      #else
        vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;
        vec4 result=texture2D(uSource,coord);
      #endif
      gl_FragColor=result/(1.+dissipation*dt);
    }`, ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']);

  const divergenceFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;precision mediump sampler2D;
    varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;
    void main(){
      float L=texture2D(uVelocity,vL).x,R=texture2D(uVelocity,vR).x,
            T=texture2D(uVelocity,vT).y,B=texture2D(uVelocity,vB).y;
      vec2 C=texture2D(uVelocity,vUv).xy;
      if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;
      if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;
      gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);
    }`);

  const curlFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;precision mediump sampler2D;
    varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity;
    void main(){
      float L=texture2D(uVelocity,vL).y,R=texture2D(uVelocity,vR).y,
            T=texture2D(uVelocity,vT).x,B=texture2D(uVelocity,vB).x;
      gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);
    }`);

  const vorticityFS = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;precision highp sampler2D;
    varying vec2 vUv,vL,vR,vT,vB;uniform sampler2D uVelocity,uCurl;
    uniform float curl,dt;
    void main(){
      float L=texture2D(uCurl,vL).x,R=texture2D(uCurl,vR).x,
            T=texture2D(uCurl,vT).x,B=texture2D(uCurl,vB).x,
            C=texture2D(uCurl,vUv).x;
      vec2 force=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
      force/=length(force)+.0001; force*=curl*C; force.y*=-1.;
      vec2 vel=texture2D(uVelocity,vUv).xy+force*dt;
      vel=min(max(vel,-1000.),1000.);
      gl_FragColor=vec4(vel,0.,1.);
    }`);

  const pressureFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;precision mediump sampler2D;
    varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uDivergence;
    void main(){
      float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,
            T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x,
            div=texture2D(uDivergence,vUv).x;
      gl_FragColor=vec4((L+R+B+T-div)*.25,0.,0.,1.);
    }`);

  const gradSubFS = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;precision mediump sampler2D;
    varying highp vec2 vUv,vL,vR,vT,vB;uniform sampler2D uPressure,uVelocity;
    void main(){
      float L=texture2D(uPressure,vL).x,R=texture2D(uPressure,vR).x,
            T=texture2D(uPressure,vT).x,B=texture2D(uPressure,vB).x;
      vec2 vel=texture2D(uVelocity,vUv).xy-vec2(R-L,T-B);
      gl_FragColor=vec4(vel,0.,1.);
    }`);

  /* ── Programs ────────────────────────────────────────── */
  const copyProg       = new Program(baseVS, copyFS);
  const clearProg      = new Program(baseVS, clearFS);
  const splatProg      = new Program(baseVS, splatFS);
  const advectionProg  = new Program(baseVS, advectionFS);
  const divergenceProg = new Program(baseVS, divergenceFS);
  const curlProg       = new Program(baseVS, curlFS);
  const vorticityProg  = new Program(baseVS, vorticityFS);
  const pressureProg   = new Program(baseVS, pressureFS);
  const gradSubProg    = new Program(baseVS, gradSubFS);
  const displayMat     = new Material(baseVS, displayFSSource);

  /* ── Blit ────────────────────────────────────────────── */
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  function blit(target, clear = false) {
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    if (clear) { gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT); }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  /* ── FBO helpers ─────────────────────────────────────── */
  function createFBO(w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.viewport(0,0,w,h); gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture: tex, fbo, width: w, height: h,
      texelSizeX: 1/w, texelSizeY: 1/h,
      attach(id){ gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D,tex); return id; }
    };
  }

  function createDoubleFBO(w, h, iF, f, type, param) {
    let fbo1 = createFBO(w,h,iF,f,type,param);
    let fbo2 = createFBO(w,h,iF,f,type,param);
    return {
      width: w, height: h, texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
      get read(){ return fbo1; }, set read(v){ fbo1=v; },
      get write(){ return fbo2; }, set write(v){ fbo2=v; },
      swap(){ const t=fbo1; fbo1=fbo2; fbo2=t; }
    };
  }

  function resizeFBO(target, w, h, iF, f, type, param) {
    const newFBO = createFBO(w,h,iF,f,type,param);
    copyProg.bind();
    gl.uniform1i(copyProg.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
  }

  function resizeDoubleFBO(target, w, h, iF, f, type, param) {
    if (target.width === w && target.height === h) return target;
    target.read  = resizeFBO(target.read,  w,h,iF,f,type,param);
    target.write = createFBO(w,h,iF,f,type,param);
    target.width = w; target.height = h;
    target.texelSizeX = 1/w; target.texelSizeY = 1/h;
    return target;
  }

  /* ── Init framebuffers ───────────────────────────────── */
  let dye, velocity, divergence, curl, pressure;

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    const tt = ext.halfFloatTexType;
    const rgba = ext.formatRGBA, rg = ext.formatRG, r = ext.formatR;
    const fil = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    gl.disable(gl.BLEND);

    dye      = dye      ? resizeDoubleFBO(dye,      dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, tt, fil)
                        : createDoubleFBO(dyeRes.width,  dyeRes.height,  rgba.internalFormat, rgba.format, tt, fil);
    velocity = velocity ? resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat,   rg.format,   tt, fil)
                        : createDoubleFBO(simRes.width,  simRes.height,  rg.internalFormat,   rg.format,   tt, fil);
    divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, tt, gl.NEAREST);
    curl       = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, tt, gl.NEAREST);
    pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, tt, gl.NEAREST);
  }

  /* ── Utilities ───────────────────────────────────────── */
  function getResolution(res) {
    let ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (ar < 1) ar = 1/ar;
    const min = Math.round(res), max = Math.round(res * ar);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  function scaleByPixelRatio(v) { return Math.floor(v * (window.devicePixelRatio || 1)); }

  function HSVtoRGB(h, s, v) {
    let r,g,b,i=Math.floor(h*6),f=h*6-i,p=v*(1-s),q=v*(1-f*s),t=v*(1-(1-f)*s);
    switch(i%6){
      case 0:r=v;g=t;b=p;break; case 1:r=q;g=v;b=p;break;
      case 2:r=p;g=v;b=t;break; case 3:r=p;g=q;b=v;break;
      case 4:r=t;g=p;b=v;break; case 5:r=v;g=p;b=q;break;
    }
    return {r,g,b};
  }

  /* ── Yellow/gold color generator ────────────────────── */
  function generateColor() {
    // Hue range 30°–55° → amber/gold palette matching brand #d4a853
    const h = (30 + Math.random() * 25) / 360;
    const s = 0.75 + Math.random() * 0.25;
    let c = HSVtoRGB(h, s, 1.0);
    c.r *= 0.15; c.g *= 0.15; c.b *= 0.15;
    return c;
  }

  function wrap(v, min, max) { const r=max-min; return r===0?min:((v-min)%r)+min; }

  function correctRadius(radius) {
    const ar = canvas.width / canvas.height;
    if (ar > 1) radius *= ar;
    return radius;
  }
  function correctDeltaX(d) { const ar=canvas.width/canvas.height; if(ar<1)d*=ar; return d; }
  function correctDeltaY(d) { const ar=canvas.width/canvas.height; if(ar>1)d/=ar; return d; }

  /* ── Pointer helpers ─────────────────────────────────── */
  function updatePointerDownData(p, id, x, y) {
    p.id=id; p.down=true; p.moved=false;
    p.texcoordX=x/canvas.width; p.texcoordY=1-(y/canvas.height);
    p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY;
    p.deltaX=0; p.deltaY=0; p.color=generateColor();
  }
  function updatePointerMoveData(p, x, y) {
    p.prevTexcoordX=p.texcoordX; p.prevTexcoordY=p.texcoordY;
    p.texcoordX=x/canvas.width; p.texcoordY=1-(y/canvas.height);
    p.deltaX=correctDeltaX(p.texcoordX-p.prevTexcoordX);
    p.deltaY=correctDeltaY(p.texcoordY-p.prevTexcoordY);
    p.moved=Math.abs(p.deltaX)>0||Math.abs(p.deltaY)>0;
  }
  function updatePointerUpData(p) { p.down=false; }

  /* ── Splat ───────────────────────────────────────────── */
  function splat(x, y, dx, dy, color) {
    splatProg.bind();
    gl.uniform1i(splatProg.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProg.uniforms.aspectRatio, canvas.width/canvas.height);
    gl.uniform2f(splatProg.uniforms.point, x, y);
    gl.uniform3f(splatProg.uniforms.color, dx, dy, 0);
    gl.uniform1f(splatProg.uniforms.radius, correctRadius(config.SPLAT_RADIUS/100));
    blit(velocity.write); velocity.swap();

    gl.uniform1i(splatProg.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProg.uniforms.color, color.r, color.g, color.b);
    blit(dye.write); dye.swap();
  }

  function splatPointer(p) {
    splat(p.texcoordX, p.texcoordY, p.deltaX*config.SPLAT_FORCE, p.deltaY*config.SPLAT_FORCE, p.color);
  }

  function clickSplat(p) {
    const c = generateColor();
    c.r *= 10; c.g *= 10; c.b *= 10;
    splat(p.texcoordX, p.texcoordY, 10*(Math.random()-.5), 30*(Math.random()-.5), c);
  }

  /* ── Simulation step ─────────────────────────────────── */
  function step(dt) {
    gl.disable(gl.BLEND);

    curlProg.bind();
    gl.uniform2f(curlProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProg.bind();
    gl.uniform2f(vorticityProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProg.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProg.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProg.uniforms.dt, dt);
    blit(velocity.write); velocity.swap();

    divergenceProg.bind();
    gl.uniform2f(divergenceProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProg.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProg.bind();
    gl.uniform1i(clearProg.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProg.uniforms.value, config.PRESSURE);
    blit(pressure.write); pressure.swap();

    pressureProg.bind();
    gl.uniform2f(pressureProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProg.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProg.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write); pressure.swap();
    }

    gradSubProg.bind();
    gl.uniform2f(gradSubProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradSubProg.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradSubProg.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write); velocity.swap();

    advectionProg.bind();
    gl.uniform2f(advectionProg.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProg.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    const vId = velocity.read.attach(0);
    gl.uniform1i(advectionProg.uniforms.uVelocity, vId);
    gl.uniform1i(advectionProg.uniforms.uSource, vId);
    gl.uniform1f(advectionProg.uniforms.dt, dt);
    gl.uniform1f(advectionProg.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write); velocity.swap();

    if (!ext.supportLinearFiltering)
      gl.uniform2f(advectionProg.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProg.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProg.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProg.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write); dye.swap();
  }

  function render(target) {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    const w = target == null ? gl.drawingBufferWidth  : target.width;
    const h = target == null ? gl.drawingBufferHeight : target.height;
    displayMat.bind();
    if (config.SHADING) gl.uniform2f(displayMat.uniforms.texelSize, 1/w, 1/h);
    gl.uniform1i(displayMat.uniforms.uTexture, dye.read.attach(0));
    blit(target);
  }

  /* ── Resize + keywords ───────────────────────────────── */
  function resizeCanvas() {
    const w = scaleByPixelRatio(canvas.clientWidth);
    const h = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width !== w || canvas.height !== h) { canvas.width=w; canvas.height=h; return true; }
    return false;
  }

  displayMat.setKeywords(config.SHADING ? ['SHADING'] : []);
  initFramebuffers();

  /* ── Main loop ───────────────────────────────────────── */
  let lastUpdateTime = Date.now();
  let colorTimer = 0;

  function updateFrame() {
    const now = Date.now();
    const dt = Math.min((now - lastUpdateTime) / 1000, 0.016666);
    lastUpdateTime = now;

    if (resizeCanvas()) initFramebuffers();

    colorTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorTimer >= 1) {
      colorTimer = wrap(colorTimer, 0, 1);
      pointers.forEach(p => { p.color = generateColor(); });
    }

    pointers.forEach(p => { if (p.moved) { p.moved = false; splatPointer(p); } });

    step(dt);
    render(null);
    requestAnimationFrame(updateFrame);
  }

  /* ── Event listeners ─────────────────────────────────── */
  let firstMove = false;
  window.addEventListener('mousedown', e => {
    const p = pointers[0];
    updatePointerDownData(p, -1, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY));
    clickSplat(p);
  });
  window.addEventListener('mousemove', e => {
    const p = pointers[0];
    if (!firstMove) { p.color = generateColor(); firstMove = true; }
    updatePointerMoveData(p, scaleByPixelRatio(e.clientX), scaleByPixelRatio(e.clientY));
  });
  window.addEventListener('touchstart', e => {
    const p = pointers[0];
    for (const t of e.targetTouches)
      updatePointerDownData(p, t.identifier, scaleByPixelRatio(t.clientX), scaleByPixelRatio(t.clientY));
  });
  window.addEventListener('touchmove', e => {
    const p = pointers[0];
    for (const t of e.targetTouches)
      updatePointerMoveData(p, scaleByPixelRatio(t.clientX), scaleByPixelRatio(t.clientY));
  }, false);
  window.addEventListener('touchend', e => {
    for (const t of e.changedTouches) updatePointerUpData(pointers[0]);
  });

  updateFrame();
})();
