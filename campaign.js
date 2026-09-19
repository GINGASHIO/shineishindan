// Keep the existing quiz flow; add contextual navigation and gentle entrance motion.
(() => {
  const dock = document.querySelector('#actionDock');
  const main = document.querySelector('#dockMain');
  const hint = document.querySelector('#dockHint');
  const message = document.querySelector('#dockMessage');
  const banner = document.querySelector('.banner-intro');
  const startLink = banner.querySelector('.banner-start');
  startLink.href = '#diagnosis';
  document.addEventListener('diagnosischange', ({detail}) => {
    main.href = detail.result ? 'https://forms.gle/Ut7Sn43C9N8rcv138' : '#diagnosis';
    main.textContent = detail.result ? '無料体験に申し込む ↗' : detail.current ? '診断のつづきへ ↑' : 'コース診断をはじめる ↓';
    if (detail.result) {main.target = '_blank'; main.rel = 'noopener noreferrer';}
    else {main.removeAttribute('target');main.removeAttribute('rel');}
    hint.textContent = detail.result ? '体験無料・ボール貸出あり' : `親子で答える、9つの質問${detail.current ? `（${detail.current + 1} / 9）` : ''}`;
    message.textContent = detail.result ? '次は、グラウンドで会いましょう。' : 'お子さまの「好き」を、次の一歩に。';
    startLink.textContent = detail.result ? '無料体験に申し込む ↗' : '9問の診断をはじめる ↓';
    startLink.href = detail.result ? main.href : '#diagnosis';
    if(detail.result){startLink.target='_blank';startLink.rel='noopener noreferrer';}
    else {startLink.removeAttribute('target');startLink.removeAttribute('rel');}
  });
  new IntersectionObserver(([entry]) => {dock.hidden = entry.isIntersecting;}, {threshold:0}).observe(document.querySelector('.hero'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate([{opacity:.35,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:550,easing:'ease-out'});
      observer.unobserve(entry.target);
    }), {threshold:.12});
    document.querySelectorAll('.banner-intro,.coach-invite,.try-moments,.side-coach').forEach(el=>observer.observe(el));
  }
})();
