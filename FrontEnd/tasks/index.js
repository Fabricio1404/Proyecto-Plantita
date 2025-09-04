// Utilities
const $ = (s, ctx=document)=>ctx.querySelector(s);
const $$ = (s, ctx=document)=>[...ctx.querySelectorAll(s)];

// Year
$("#year").textContent = new Date().getFullYear();

// Hero slider
const slides = $$(".slide");
const dotsWrap = $("#dots");
let idx = 0;
slides.forEach((_s,i)=>{
  const b = document.createElement("button");
  b.className = "dot";
  b.setAttribute("aria-label", "Slide " + (i+1));
  b.onclick = ()=>go(i);
  dotsWrap.appendChild(b);
});
function go(i){
  slides[idx].classList.remove("is-active");
  dotsWrap.children[idx]?.classList.remove("is-on");
  idx = i;
  slides[idx].style.setProperty("z-index", 2);
  slides[idx].classList.add("is-active");
  dotsWrap.children[idx]?.classList.add("is-on");
}
function next(){ go((idx+1)%slides.length); }
go(0);
setInterval(next, 6000);

// Dots styling
const styleDots = document.createElement("style");
styleDots.textContent = `.slider__dots{position:absolute; bottom:18px; left:50%; transform:translateX(-50%); display:flex; gap:.4rem}
.dot{width:9px; height:9px; border-radius:999px; border:none; background:#dfe8df; opacity:.75; cursor:pointer}
.dot.is-on{background:#a5d6a7; opacity:1}`;
document.head.appendChild(styleDots);

// Counters on view
const counterIO = new IntersectionObserver(entries=>{
  for(const e of entries){
    if(e.isIntersecting){
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 1200;
      const start = performance.now();
      const from = 0;
      function tick(t){
        const p = Math.min(1, (t-start)/dur);
        el.textContent = Math.round(from + p*(target-from)).toLocaleString();
        if(p<1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    }
  }
}, {threshold: .5});
$$(".kpi__num").forEach(el=>counterIO.observe(el));

// Reveal on scroll
const revIO = new IntersectionObserver(entries=>{
  for(const e of entries){
    if(e.isIntersecting){
      e.target.classList.add("revealed");
      revIO.unobserve(e.target);
    }
  }
}, {threshold:.2});
$$(".reveal").forEach(el=>revIO.observe(el));

// Parallax
const px = $("[data-parallax]");
if(px){
  window.addEventListener("scroll", ()=>{
    const r = px.getBoundingClientRect();
    const viewH = window.innerHeight;
    const rel = (viewH - r.top) / (viewH + r.height);
    const speed = +px.dataset.speed || 0.2;
    const y = (rel-0.5) * 140 * speed;
    px.style.transform = `translateY(${y}px)`;
  }, {passive:true});
}

// Carousel
const car = $("#carousel");
let offset = 0;
$("#next").onclick = ()=>{ offset = Math.min(offset+1, car.children.length-1); car.style.transform = `translateX(-${offset*100}%)`; };
$("#prev").onclick = ()=>{ offset = Math.max(offset-1, 0); car.style.transform = `translateX(-${offset*100}%)`; };
