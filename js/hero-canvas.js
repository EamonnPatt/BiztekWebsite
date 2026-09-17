(function(){
  var container = document.getElementById('hero-canvas-wrap');
  if(!container || typeof THREE === 'undefined') return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isSmall = window.innerWidth < 640;
  var scene, camera, renderer, group, hub, hubGlow, stars;

  try{
    /* Natural (unscaled) size — the box itself never changes layout size
       (that was pushing the grid around and reflowing the headline). The
       visual grow/shrink is a CSS transform, which has zero layout impact;
       to avoid the blur that a plain transform would cause, the renderer's
       internal resolution is bumped to match the *target* on-screen size
       independently (via setSize(..., false), which resizes the drawing
       buffer without touching the canvas's CSS size). */
    var baseW = container.clientWidth, baseH = container.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, baseW/Math.max(baseH,1), 0.1, 100);
    camera.position.set(0,0,12);

    renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.setSize(baseW, baseH);
    container.appendChild(renderer.domElement);

    group = new THREE.Group();
    scene.add(group);

    var count = isSmall ? 70 : 150;
    var radius = 4.6;
    var positions = [];
    var goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (var i=0;i<count;i++){
      var y = 1 - (i/(count-1))*2;
      var r = Math.sqrt(Math.max(0,1-y*y));
      var theta = goldenAngle * i;
      positions.push({x:Math.cos(theta)*r*radius, y:y*radius, z:Math.sin(theta)*r*radius});
    }

    var pointArr = new Float32Array(count*3);
    positions.forEach(function(p, idx){ pointArr[idx*3]=p.x; pointArr[idx*3+1]=p.y; pointArr[idx*3+2]=p.z; });
    var pointGeo = new THREE.BufferGeometry();
    pointGeo.setAttribute('position', new THREE.BufferAttribute(pointArr,3));

    var pc = document.createElement('canvas');
    pc.width = 64; pc.height = 64;
    var pctx = pc.getContext('2d');
    var grad = pctx.createRadialGradient(32,32,0,32,32,32);
    grad.addColorStop(0,'rgba(150,230,255,1)');
    grad.addColorStop(.4,'rgba(90,190,255,.9)');
    grad.addColorStop(1,'rgba(90,190,255,0)');
    pctx.fillStyle = grad;
    pctx.fillRect(0,0,64,64);
    var pointTexture = new THREE.CanvasTexture(pc);

    var pointMat = new THREE.PointsMaterial({
      size: isSmall ? 0.24 : 0.28,
      map: pointTexture,
      transparent:true,
      depthWrite:false,
      blending: THREE.AdditiveBlending,
      color: 0x8fe6ff
    });
    var pointsMesh = new THREE.Points(pointGeo, pointMat);
    group.add(pointsMesh);

    var linePositions = [];
    var lineColors = [];
    var cCyan = new THREE.Color(0x4fd8ff);
    var cViolet = new THREE.Color(0x9a8bff);

    for (var i=0;i<count;i+=2){
      var p = positions[i];
      linePositions.push(0,0,0, p.x,p.y,p.z);
      lineColors.push(cCyan.r,cCyan.g,cCyan.b, cViolet.r,cViolet.g,cViolet.b);
    }
    for (var i=0;i<count;i++){
      [1,7].forEach(function(off){
        var j = i+off;
        if(j<count){
          var p1=positions[i], p2=positions[j];
          linePositions.push(p1.x,p1.y,p1.z, p2.x,p2.y,p2.z);
          lineColors.push(cViolet.r,cViolet.g,cViolet.b, cCyan.r,cCyan.g,cCyan.b);
        }
      });
    }
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions),3));
    lineGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineColors),3));
    var lineMat = new THREE.LineBasicMaterial({vertexColors:true, transparent:true, opacity:.16, blending:THREE.AdditiveBlending, depthWrite:false});
    var lineMesh = new THREE.LineSegments(lineGeo, lineMat);
    group.add(lineMesh);

    var hubGeo = new THREE.IcosahedronGeometry(0.5, 1);
    var hubMat = new THREE.MeshBasicMaterial({color:0xe4f7ff, wireframe:true, transparent:true, opacity:.9});
    hub = new THREE.Mesh(hubGeo, hubMat);
    group.add(hub);
    var hubGlowGeo = new THREE.IcosahedronGeometry(0.66, 1);
    var hubGlowMat = new THREE.MeshBasicMaterial({color:0x6fe3ff, transparent:true, opacity:.14, blending:THREE.AdditiveBlending});
    hubGlow = new THREE.Mesh(hubGlowGeo, hubGlowMat);
    group.add(hubGlow);

    var starCount = isSmall ? 140 : 280;
    var starArr = new Float32Array(starCount*3);
    for (var i=0;i<starCount;i++){
      starArr[i*3] = (Math.random()-0.5)*30;
      starArr[i*3+1] = (Math.random()-0.5)*30;
      starArr[i*3+2] = (Math.random()-0.5)*30 - 6;
    }
    var starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starArr,3));
    var starMat = new THREE.PointsMaterial({size:.05, color:0x33456a, transparent:true, opacity:.7});
    stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    var targetX=0, targetY=0, mx=0, my=0;
    function onMove(e){
      if(isDragging) return;
      var rect = container.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      var cx = p.clientX - rect.left, cy = p.clientY - rect.top;
      targetX = (cx/rect.width - .5) * 2;
      targetY = (cy/rect.height - .5) * 2;
    }
    window.addEventListener('mousemove', onMove, {passive:true});
    window.addEventListener('touchmove', onMove, {passive:true});

    /* -------- click-and-drag rotation -------- */
    var isDragging = false;
    var dragRotX = 0, dragRotY = 0;
    var velX = 0, velY = 0;
    var lastPX = 0, lastPY = 0, lastPT = 0;
    var ROT_PER_PX = 0.008;
    var MAX_TILT = 1.15;
    function clampTilt(v){ return Math.max(-MAX_TILT, Math.min(MAX_TILT, v)); }

    /* -------- resize: drag away from center (fast ease), page scroll (slow ease) --------
       Visual size is a CSS transform (no layout impact); the renderer's
       drawing-buffer resolution is bumped to match so it stays sharp.
       Every scale change eases toward a target rather than snapping, so
       rapid clicking can't pop the size instantly — just faster while
       dragging than while scroll-driven. Never captures page scroll. */
    var MIN_SCALE = 0.7, MAX_SCALE = isSmall ? 1.4 : 2.2;
    var currentScale = 1, targetScale = 1, lastAppliedScale = 1;
    function clampScale(v){ return Math.max(MIN_SCALE, Math.min(MAX_SCALE, v)); }
    function applyScale(){
      container.style.transform = 'scale(' + currentScale.toFixed(3) + ')';
      var w = Math.round(baseW * currentScale), h = Math.round(baseH * currentScale);
      if(renderer){
        renderer.setSize(w, h, false);
        camera.updateProjectionMatrix();
      }
    }
    applyScale();

    function updateScaleTargetFromPointer(clientX, clientY){
      var rect = container.getBoundingClientRect();
      var cx = rect.left + rect.width/2;
      var cy = rect.top + rect.height/2;
      var dx = clientX - cx, dy = clientY - cy;
      var dist = Math.sqrt(dx*dx + dy*dy);
      var halfDiag = Math.sqrt(rect.width*rect.width + rect.height*rect.height) / 2;
      var t = halfDiag > 0 ? dist / halfDiag : 0;
      targetScale = clampScale(1 + t * 1.15);
      if(reduceMotion){
        currentScale = targetScale;
        applyScale();
        lastAppliedScale = currentScale;
      }
    }

    var heroSection = container.closest ? container.closest('.hero') : null;
    function updateTargetFromScroll(){
      if(reduceMotion || isDragging) return;
      var heroH = (heroSection ? heroSection.offsetHeight : window.innerHeight) || window.innerHeight;
      var progress = Math.min(Math.max(window.scrollY / heroH, 0), 1);
      targetScale = clampScale(1 + progress * 0.55);
    }
    window.addEventListener('scroll', updateTargetFromScroll, {passive:true});

    function renderStatic(){
      group.rotation.set(0.15 + dragRotX, 0.4 + dragRotY, 0);
      renderer.render(scene, camera);
    }

    function onPointerDown(e){
      isDragging = true;
      velX = 0; velY = 0;
      lastPX = e.clientX; lastPY = e.clientY; lastPT = performance.now();
      container.classList.add('is-dragging');
      if(e.pointerId != null && container.setPointerCapture){
        try{ container.setPointerCapture(e.pointerId); }catch(err){}
      }
    }
    var MAX_VEL = 6;
    function clampVel(v){ return Math.max(-MAX_VEL, Math.min(MAX_VEL, v)); }
    function onPointerMove(e){
      if(!isDragging) return;
      var now = performance.now();
      var dtMs = Math.max(now-lastPT, 16);
      var dx = e.clientX - lastPX, dy = e.clientY - lastPY;
      dragRotY += dx * ROT_PER_PX;
      dragRotX = clampTilt(dragRotX + dy * ROT_PER_PX);
      velY = clampVel((dx * ROT_PER_PX) / (dtMs/1000));
      velX = clampVel((dy * ROT_PER_PX) / (dtMs/1000));
      lastPX = e.clientX; lastPY = e.clientY; lastPT = now;
      updateScaleTargetFromPointer(e.clientX, e.clientY);
      if(reduceMotion) renderStatic();
    }
    function onPointerUp(){
      if(!isDragging) return;
      isDragging = false;
      velX = 0; velY = 0;
      container.classList.remove('is-dragging');
    }
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove, {passive:true});
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    var clock = new THREE.Clock();
    function frame(){
      requestAnimationFrame(frame);
      var dt = clock.getDelta();
      var t = clock.elapsedTime;
      if(!isDragging){
        mx += (targetX-mx)*.04;
        my += (targetY-my)*.04;
        if(Math.abs(velY) > 0.0005 || Math.abs(velX) > 0.0005){
          dragRotY += velY * dt;
          dragRotX = clampTilt(dragRotX + velX * dt);
          var decay = Math.pow(0.02, dt);
          velY *= decay; velX *= decay;
        }
      }
      /* scale always eases toward its target rather than snapping — fast
         while actively dragging (feels responsive, but a rapid click/tap
         can never cause an instant pop), slow while scroll-driven */
      if(!reduceMotion && Math.abs(targetScale-currentScale) > 0.0008){
        var ease = isDragging ? Math.min(dt*14, 1) : Math.min(dt*1.6, 1);
        currentScale += (targetScale-currentScale) * ease;
        if(Math.abs(currentScale-lastAppliedScale) > 0.0015){
          applyScale();
          lastAppliedScale = currentScale;
        }
      }
      group.rotation.y = t*.06 + mx*.3 + dragRotY;
      group.rotation.x = my*.2 + dragRotX;
      var pulse = 1 + Math.sin(t*1.4)*.06;
      hub.scale.setScalar(pulse);
      hubGlow.scale.setScalar(pulse*1.05);
      stars.rotation.y = t*.01;
      renderer.render(scene, camera);
    }
    if(reduceMotion){
      renderStatic();
    } else {
      frame();
    }

    function onViewportResize(){
      baseW = container.clientWidth;
      baseH = container.clientHeight;
      camera.aspect = baseW/Math.max(baseH,1);
      applyScale();
      if(reduceMotion) renderStatic();
    }
    window.addEventListener('resize', onViewportResize);
    if(window.ResizeObserver){ new ResizeObserver(onViewportResize).observe(container); }
  } catch(err){
    console.warn('3D hero unavailable, showing static gradient instead.', err);
  }
})();
