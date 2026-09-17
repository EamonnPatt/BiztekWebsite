(function(){
  var header = document.querySelector('.site-header');
  function onScroll(){
    if(!header) return;
    if(window.scrollY > 8){ header.classList.add('is-scrolled'); }
    else { header.classList.remove('is-scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  var btn = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  if(btn && menu){
    btn.addEventListener('click', function(){
      var open = menu.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true':'false');
    });
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        menu.classList.remove('is-open');
        btn.setAttribute('aria-expanded','false');
      });
    });
  }

  var els = document.querySelectorAll('[data-reveal]');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(els.length && !reduce && 'IntersectionObserver' in window){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var offscreen = [];
    els.forEach(function(el){
      var rect = el.getBoundingClientRect();
      if(rect.top > vh){
        el.classList.add('pre-reveal');
        offscreen.push(el);
      }
    });
    if(offscreen.length){
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting){
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, {threshold:.1, rootMargin:'0px 0px -40px 0px'});
      offscreen.forEach(function(el){ io.observe(el); });
    }
  }
  /* Elements stay visible by default with no JS, reduced motion, or when
     already in the initial viewport — only truly below-the-fold sections
     get the fade-up treatment. */

  var amb = document.createElement('div');
  amb.className = 'ambient';
  amb.setAttribute('aria-hidden', 'true');
  amb.innerHTML =
    '<span class="ambient-orb orb-1"></span>' +
    '<span class="ambient-orb orb-2"></span>' +
    '<span class="ambient-orb orb-3"></span>' +
    '<span class="ambient-orb orb-4"></span>' +
    '<span class="ambient-grid"></span>' +
    '<span class="ambient-veil"></span>';
  document.body.insertBefore(amb, document.body.firstChild);

  if(!reduce){
    var px = 0, py = 0, sy = 0, queued = false;
    function paint(){
      queued = false;
      amb.style.setProperty('--amb-x', px.toFixed(1) + 'px');
      amb.style.setProperty('--amb-y', (py + sy).toFixed(1) + 'px');
    }
    function queue(){
      if(queued) return;
      queued = true;
      requestAnimationFrame(paint);
    }
    window.addEventListener('scroll', function(){
      sy = Math.max(-70, window.scrollY * -0.05);
      queue();
    }, {passive:true});
    if(window.matchMedia('(hover:hover) and (pointer:fine)').matches){
      window.addEventListener('mousemove', function(e){
        px = (e.clientX / window.innerWidth - .5) * -26;
        py = (e.clientY / window.innerHeight - .5) * -18;
        queue();
      }, {passive:true});
    }
  }
})();
