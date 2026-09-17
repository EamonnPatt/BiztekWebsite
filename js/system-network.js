/* Interactive "Biztek System" diagram: six labeled service nodes in a
   hexagon around a central BIZTEK hub. HTML buttons are the actual
   interactive/accessible nodes; canvas underneath draws ambient
   particles and highlights the active connection. Hovering or
   focusing a node updates the detail panel. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initSystemNetwork(){
    var wrap = document.querySelector('.system-canvas-wrap');
    var canvas = document.getElementById('systemNetwork');
    var detailLabel = document.getElementById('systemDetailLabel');
    var detailList = document.getElementById('systemDetailList');
    if(!wrap || !canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H;

    var nodes = [
      {id:'strategy', label:'Strategy', angle:-90,
        items:['Technology roadmaps','IT audits & assessments','Vendor & budget strategy','Infrastructure planning']},
      {id:'cloud', label:'Cloud', angle:-30,
        items:['Cloud migration','Microsoft 365 & Azure','Backup & disaster recovery','Cost optimization']},
      {id:'software', label:'Software', angle:30,
        items:['Custom applications','Workflow automation','System integrations','API development']},
      {id:'security', label:'Security', angle:90,
        items:['Risk assessments','Security hardening','24/7 monitoring','Compliance support']},
      {id:'managed', label:'Managed IT', angle:150,
        items:['Help desk & support','Network management','Device & server upkeep','Proactive monitoring']},
      {id:'transform', label:'Transform', angle:210,
        items:['Legacy modernization','Process digitization','Change management','Scalable platforms']}
    ];

    var hub = {x:0,y:0};
    var particles = [];
    var activeId = null;

    function buildNodes(){
      nodes.forEach(function(n){
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'system-node';
        btn.textContent = n.label;
        btn.setAttribute('data-node', n.id);
        wrap.appendChild(btn);
        n.el = btn;
        btn.addEventListener('mouseenter', function(){ setActive(n.id); });
        btn.addEventListener('focus', function(){ setActive(n.id); });
        btn.addEventListener('click', function(){ setActive(n.id); });
      });
      var centerBtn = document.createElement('button');
      centerBtn.type = 'button';
      centerBtn.className = 'system-node is-center';
      centerBtn.textContent = 'BIZTEK';
      centerBtn.addEventListener('mouseenter', function(){ setActive(null); });
      centerBtn.addEventListener('focus', function(){ setActive(null); });
      wrap.appendChild(centerBtn);
    }

    function setActive(id){
      activeId = id;
      nodes.forEach(function(n){ n.el.classList.toggle('is-active', n.id === id); });
      var node = nodes.filter(function(n){ return n.id === id; })[0];
      if(!detailLabel || !detailList) return;
      if(!node){
        detailLabel.textContent = 'BIZTEK';
        detailList.innerHTML = '<li>Hover or tap a node to explore each service.</li>';
        return;
      }
      detailLabel.textContent = node.label;
      detailList.innerHTML = node.items.map(function(i){ return '<li>'+i+'</li>'; }).join('');
    }

    function layout(){
      W = wrap.clientWidth; H = wrap.clientHeight;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W*dpr; canvas.height = H*dpr;
      canvas.style.width = W+'px'; canvas.style.height = H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      hub.x = W/2; hub.y = H/2;

      var radius = Math.min(W,H) * .36;
      nodes.forEach(function(n){
        var rad = n.angle * Math.PI/180;
        n.x = W/2 + Math.cos(rad)*radius;
        n.y = H/2 + Math.sin(rad)*radius;
        n.el.style.left = n.x+'px';
        n.el.style.top = n.y+'px';
      });
      var centerBtn = wrap.querySelector('.system-node.is-center');
      if(centerBtn){ centerBtn.style.left = '50%'; centerBtn.style.top = '50%'; }

      var pcount = Math.round((W*H)/14000);
      particles = [];
      for(var i=0;i<pcount;i++){
        particles.push({
          x:Math.random()*W, y:Math.random()*H,
          vx:(Math.random()-.5)*.18, vy:(Math.random()-.5)*.18
        });
      }
    }

    function step(){
      ctx.clearRect(0,0,W,H);

      for(var i=0;i<particles.length;i++){
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if(p.x<0||p.x>W) p.vx*=-1;
        if(p.y<0||p.y>H) p.vy*=-1;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(166,178,198,.35)';
        ctx.arc(p.x,p.y,1.1,0,Math.PI*2); ctx.fill();
      }

      nodes.forEach(function(n){
        var active = n.id === activeId;
        ctx.strokeStyle = active ? 'rgba(53,208,255,.9)' : 'rgba(139,123,255,.22)';
        ctx.lineWidth = active ? 2.4 : 1;
        ctx.beginPath(); ctx.moveTo(hub.x,hub.y); ctx.lineTo(n.x,n.y); ctx.stroke();
        if(active){
          ctx.beginPath();
          ctx.fillStyle = 'rgba(53,208,255,.9)';
          ctx.arc(n.x, n.y, 3, 0, Math.PI*2); ctx.fill();
        }
      });

      ctx.beginPath();
      ctx.fillStyle = 'rgba(53,208,255,.16)';
      ctx.arc(hub.x, hub.y, 20, 0, Math.PI*2); ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = '#8fe6ff';
      ctx.arc(hub.x, hub.y, 5, 0, Math.PI*2); ctx.fill();

      if(!reduce) requestAnimationFrame(step);
    }

    try{
      buildNodes();
      layout();
      window.addEventListener('resize', layout);
      if(reduce){ step(); } else { requestAnimationFrame(step); }
    } catch(err){
      console.warn('system network unavailable', err);
    }
  }

  function initCursorGlow(){
    if(reduce) return;
    var wrap = document.querySelector('.system-canvas-wrap');
    if(!wrap) return;
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    wrap.appendChild(glow);
    wrap.addEventListener('mouseenter', function(){ glow.classList.add('is-active'); });
    wrap.addEventListener('mouseleave', function(){ glow.classList.remove('is-active'); });
    wrap.addEventListener('mousemove', function(e){
      var r = wrap.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + 'px';
      glow.style.top = (e.clientY - r.top) + 'px';
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    initSystemNetwork();
    initCursorGlow();
  });
})();
