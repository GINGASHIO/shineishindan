// Dependency-free motion; course policy and scoring remain in index.html.
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('#motionToggle');
  const active = new Set();
  const field = document.querySelector('#fieldProgress');
  const confetti = new Set();
  let lastStep = 0;
  let allowed = !preference.matches;
  try { if (sessionStorage.getItem('shinei-motion') === 'off') allowed = false; } catch {}
  const enabled = () => allowed && !preference.matches;
  const run = (el, frames, options = {}) => {
    if (!el || !enabled() || !el.animate) return Promise.resolve();
    const animation = el.animate(frames, {duration:480,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)',...options});
    active.add(animation);
    return animation.finished.catch(() => {}).finally(() => active.delete(animation));
  };
  function applyPreference() {
    const on = enabled();
    document.documentElement.classList.toggle('motion-on', on);
    document.documentElement.classList.toggle('motion-off', !on);
    toggle.textContent = on ? 'Ⅱ 動きを止める' : '▶ 動きをつける';
    toggle.setAttribute('aria-pressed', String(on));
    toggle.disabled = preference.matches;
    if (preference.matches) toggle.textContent = '動き：控えめ設定';
    if (!on) {
      active.forEach(animation => animation.cancel());
      confetti.forEach(el => el.remove());
      confetti.clear();
      document.querySelectorAll('[data-tilt]').forEach(el => el.style.transform = '');
    }
  }
  toggle.addEventListener('click', () => {
    allowed = !allowed;
    try { sessionStorage.setItem('shinei-motion', allowed ? 'on' : 'off'); } catch {}
    applyPreference();
  });
  preference.addEventListener('change', applyPreference);
  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('motion-away', document.hidden);
    active.forEach(animation => document.hidden ? animation.pause() : animation.play());
  });
  applyPreference();

  function updateField(count) {
    field.style.setProperty('--distance', `${count / 9 * 100}%`);
    document.querySelector('#fieldCount').textContent = `${count} / 9 回答`;
    document.querySelector('#fieldMessage').textContent = count === 9 ? '回答できました。次は、体験へ！' : count >= 6 ? 'あと少し。体験への一歩！' : count >= 3 ? 'いい調子！「好き」を見つけよう。' : 'さあ、お子さまのことを教えてください。';
    field.setAttribute('aria-label', `全9問中${count}問に回答済み`);
    run(field.querySelector('.field-runner'), [{rotate:'0deg'},{rotate:'180deg'}],{duration:550});
  }
  async function accept(button) {
    button.classList.add('is-chosen');
    button.querySelector('.arrow').textContent = '✓';
    await run(button, [{transform:'scale(1)'},{transform:'scale(.975)',offset:.35},{transform:'scale(1)'}],{duration:260});
  }
  function celebrate() {
    if (!enabled()) return;
    const head = document.querySelector('.result-head');
    for (let i=0; i<26; i++) {
      const piece = document.createElement('i');
      piece.className = 'goal-confetti';
      piece.setAttribute('aria-hidden','true');
      piece.style.background = ['#bddb60','#2d8967','#d8ad43','#76bdcd'][i%4];
      piece.style.left = `${8+(i*37%84)}%`;
      head.append(piece); confetti.add(piece);
      run(piece,[{opacity:0,transform:'translateY(-24px) rotate(0deg)'},{opacity:1,offset:.12},{opacity:0,transform:`translate(${(i%2?1:-1)*(18+i*2)}px, ${130+i%5*30}px) rotate(${(i%2?1:-1)*300}deg)`}],{duration:1500+i%5*110,delay:i*14,easing:'cubic-bezier(.2,.65,.45,1)'}).finally(()=>{piece.remove();confetti.delete(piece);});
    }
  }
  document.addEventListener('diagnosischange', ({detail}) => {
    if (detail.result) {
      run(document.querySelector('.result-head'),[{opacity:.2,transform:'translateY(22px) scale(.98)'},{opacity:1,transform:'none'}],{duration:650});
      run(document.querySelector('.result-first-actions'),[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:550,delay:180});
      celebrate();
      lastStep = 0;
      return;
    }
    const direction = detail.current < lastStep ? -1 : 1;
    updateField(detail.current);
    [document.querySelector('#questionTitle'),document.querySelector('#questionLead')].forEach((el,i)=>run(el,[{opacity:.2,transform:`translateX(${direction*18}px)`},{opacity:1,transform:'none'}],{duration:350,delay:i*35}));
    document.querySelectorAll('#choices .choice').forEach((el,i)=>run(el,[{opacity:.25,transform:`translate(${direction*22}px, 8px)`},{opacity:1,transform:'none'}],{duration:400,delay:40+i*55}));
    if (Math.floor(detail.current/3) !== Math.floor(lastStep/3)) run(document.querySelector('.journey .is-current b'),[{transform:'scale(.75)'},{transform:'scale(1.2)',offset:.55},{transform:'scale(1)'}],{duration:500});
    lastStep = detail.current;
  });
  window.courseMotion = {enabled,accept,finish:()=>updateField(9)};

  let kicking = false;
  const kick = document.querySelector('#kickoffButton');
  kick.addEventListener('click', async () => {
    if (kicking) return;
    kicking = true;
    kick.disabled = true;
    if (window.kickoffScene) await window.kickoffScene.shoot(run);
    document.querySelector('.panel').scrollIntoView({behavior:enabled()?'smooth':'instant',block:'start'});
    (document.body.classList.contains('has-result') ? document.querySelector('#resultTitle') : document.querySelector('#questionTitle')).focus({preventScroll:true});
    kick.disabled = false; kicking = false;
  });

  document.querySelectorAll('.headline-line').forEach((el,i)=>run(el,[{opacity:0,transform:'translateY(35px)',clipPath:'inset(0 0 100% 0)'},{opacity:1,transform:'none',clipPath:'inset(0 0 0 0)'}],{duration:750,delay:100+i*130}));
  run(document.querySelector('.hero-photo'),[{opacity:.4,transform:'scale(1.035)'},{opacity:1,transform:'none'}],{duration:1200});
  const seen = new WeakSet();
  const entrances = new IntersectionObserver(entries => entries.forEach(entry=>{
    if (!entry.isIntersecting || seen.has(entry.target)) return;
    seen.add(entry.target);
    run(entry.target,[{opacity:.35,transform:'translateY(24px)'},{opacity:1,transform:'none'}],{duration:620});
    entrances.unobserve(entry.target);
  }),{threshold:.14});
  document.querySelectorAll('.welcome-proof>div,.kickoff-card,.course-mini,.side-coach,.moment-grid article,.trial-steps>div,.coach-invite,.family-banner,.banner-intro,.contact-strip').forEach(el=>entrances.observe(el));
  document.querySelectorAll('.course-mini,.kickoff-toy').forEach(card=>{
    card.dataset.tilt = 'true';
    let frame = 0;
    card.addEventListener('pointermove', event=>{
      if (!enabled() || !finePointer.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      const rect = card.getBoundingClientRect();
      const x = (event.clientX-rect.left)/rect.width-.5;
      const y = (event.clientY-rect.top)/rect.height-.5;
      frame = requestAnimationFrame(()=>{if(enabled()) card.style.transform = `perspective(900px) rotateX(${-y*5}deg) rotateY(${x*7}deg)`;});
    });
    card.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);card.style.transform='';});
  });
})();
