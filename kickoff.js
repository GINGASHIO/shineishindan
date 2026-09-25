// A small 3D scene projected into SVG. Pitch, goal and shot share world coordinates.
(() => {
  const svg = document.querySelector('#kickoffScene');
  if (!svg) return;
  const yaw = 13 * Math.PI / 180;
  const elevation = 28 * Math.PI / 180;
  const goal = {halfWidth:65, front:110, back:158, height:74};
  const radius = 18;
  const project = ([x, z, height = 0]) => {
    const horizontal = x * Math.cos(yaw) + z * Math.sin(yaw);
    const distance = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const depth = 470 + distance * Math.cos(elevation) - height * Math.sin(elevation);
    const scale = 470 / depth;
    return {x:200 + horizontal * scale, y:183 - (distance * Math.sin(elevation) + height * Math.cos(elevation)) * scale, scale};
  };
  const point = position => {const p = project(position); return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;};
  const polygon = (points, attrs) => `<polygon points="${points.map(point).join(' ')}" ${attrs}/>`;
  const line = (a, b, attrs = '') => `<polyline points="${point(a)} ${point(b)}" ${attrs}/>`;
  const rectangle = (left, right, near, far, height = 0) => [[left,near,height],[right,near,height],[right,far,height],[left,far,height]];
  let pitch = polygon(rectangle(-143,143,-114,190,-12), 'fill="#365637"');
  pitch += polygon([[-143,-114,0],[143,-114,0],[143,-114,-12],[-143,-114,-12]], 'fill="#4b6d3e"');
  pitch += polygon([[143,-114,0],[143,190,0],[143,190,-12],[143,-114,-12]], 'fill="#294c36"');
  pitch += polygon(rectangle(-143,143,-114,190), 'fill="#b6cc87"');
  for (let z=-105, i=0; z<182; z+=32,i++) pitch += polygon(rectangle(-134,134,z,Math.min(z+32,182)), `fill="${i%2?'#85ad65':'#779f59'}"`);
  pitch += polygon(rectangle(-127,127,-96,174), 'fill="none" stroke="#f3f8df" stroke-opacity=".8" stroke-width="1.5"');
  pitch += polygon(rectangle(-104,104,35,goal.front), 'fill="none" stroke="#f3f8df" stroke-opacity=".75" stroke-width="1.5"');
  pitch += polygon(rectangle(-78,78,75,goal.front), 'fill="none" stroke="#f3f8df" stroke-opacity=".75" stroke-width="1.5"');
  pitch += line([-127,goal.front],[127,goal.front], 'stroke="#f3f8df" stroke-width="1.5"');
  const spot = project([0,14]);
  pitch += `<ellipse cx="${spot.x}" cy="${spot.y}" rx="2" ry="1" fill="#f3f8df"/>`;

  // Net behind the ball; the front posts are painted last to provide correct occlusion.
  const w = goal.halfWidth, f = goal.front, b = goal.back, h = goal.height;
  let net = polygon(rectangle(-w,w,f,b,h), 'fill="#eaf9ee" fill-opacity=".16"');
  net += polygon([[-w,b,0],[w,b,0],[w,b,h],[-w,b,h]], 'fill="#133e32" fill-opacity=".16"');
  net += polygon([[w,f,0],[w,b,0],[w,b,h],[w,f,h]], 'fill="#eef8e6" fill-opacity=".16"');
  net += polygon([[-w,f,0],[-w,b,0],[-w,b,h],[-w,f,h]], 'fill="#eef8e6" fill-opacity=".07"');
  let mesh = '';
  for(let x=-w; x<=w; x+=13) {
    mesh += line([x,b,0],[x,b,h]);
    mesh += line([x,f,h],[x,b,h]);
  }
  for(let y=0; y<=h; y+=10.57) {
    mesh += line([-w,b,y],[w,b,y]);
    mesh += line([-w,f,y],[-w,b,y]);
    mesh += line([w,f,y],[w,b,y]);
  }
  for(let z=f; z<=b; z+=12) {
    mesh += line([-w,z,h],[w,z,h]);
    mesh += line([-w,z,0],[-w,z,h]);
    mesh += line([w,z,0],[w,z,h]);
  }
  net += `<g fill="none" stroke="#f4fbef" stroke-opacity=".64" stroke-width=".8">${mesh}</g>`;
  let rearFrame = '';
  for(const x of [-w,w]) {
    rearFrame += line([x,f,h],[x,b,h]);
    rearFrame += line([x,b,h],[x,b,0]);
    rearFrame += line([x,b,0],[x,f,0]);
  }
  rearFrame += line([-w,b,h],[w,b,h]);
  const frontFrame = [[-w,f,0],[-w,f,h],[w,f,h],[w,f,0]].map(point).join(' ');
  svg.innerHTML = `
    <defs>
      <radialGradient id="kickBallShade" cx="30%" cy="25%" r="75%"><stop stop-color="#fff"/><stop offset=".65" stop-color="#f0f3e7"/><stop offset="1" stop-color="#9cae9e"/></radialGradient>
      <radialGradient id="kickBallLight" cx="25%" cy="20%" r="75%"><stop stop-color="#fff" stop-opacity=".6"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#13352c" stop-opacity=".3"/></radialGradient>
      <clipPath id="kickBallClip"><circle r="18"/></clipPath>
      <filter id="kickGroundBlur"><feGaussianBlur stdDeviation="7"/></filter>
    </defs>
    <ellipse cx="201" cy="248" rx="143" ry="22" fill="#25432d" opacity=".2" filter="url(#kickGroundBlur)"/>
    <g class="kick-pitch">${pitch}</g>
    ${polygon([[-w,f,0],[w,f,0],[w+26,b+18,0],[-w+26,b+18,0]], 'fill="#254635" fill-opacity=".18"')}
    <g class="kick-net">${net}</g>
    <g fill="none" stroke="#d1e3d8" stroke-width="2.8" stroke-linejoin="round" stroke-linecap="round">${rearFrame}</g>
    <g class="kick-ball-shadow"><ellipse rx="18" ry="6" fill="#173e2b" opacity=".29"/></g>
    <g class="kick-ball-position">
      <g class="kick-ball-roll" clip-path="url(#kickBallClip)">
        <circle r="18" fill="url(#kickBallShade)"/>
        <g fill="#244b40" stroke="#244b40" stroke-width=".65" stroke-linejoin="round">
          <path d="M-2-8 6-3 3 6-6 6-9-2Z M-15-13-8-17-3-15-5-11-13-9Z M13-12 19-7 17 2 12 0 9-7Z M15 10 12 17 3 19 2 13 8 8Z M-15 8-9 11-9 17-17 15-20 8Z"/>
          <path d="M-5-11-2-8 M9-7 6-3 M12 0 3 6 M2 13-6 6 M-9 11-9-2 M-13-9-9-2" fill="none" opacity=".45"/>
        </g>
      </g>
      <circle r="18" fill="url(#kickBallLight)"/>
      <circle r="17.6" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".8"/>
    </g>
    <polyline points="${frontFrame}" fill="none" stroke="#315e49" stroke-opacity=".23" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>
    <polyline class="kick-front-frame" points="${frontFrame}" fill="none" stroke="#fffdf1" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
    <g class="kick-goal-message"><rect x="152" y="7" width="108" height="33" rx="16.5" fill="#d6f378"/><text x="206" y="30" text-anchor="middle" fill="#245038" font-size="23" font-weight="900" font-family="sans-serif">GOAL!</text></g>`;

  const ball = svg.querySelector('.kick-ball-position');
  const shadow = svg.querySelector('.kick-ball-shadow');
  const roll = svg.querySelector('.kick-ball-roll');
  const transform = position => {const p = project(position); return `translate(${p.x}px,${p.y}px) scale(${p.scale})`;};
  // The centre crosses the mouth below the crossbar, contacts the back net,
  // then rebounds a little and settles wholly inside the goal (including radius).
  const shot = phase => {
    if(phase <= .76) {
      const t = phase / .76;
      return [-37 + 45*t, -83 + (b-radius+83)*t, radius + 37*Math.sin(Math.PI*t)];
    }
    const t = (phase-.76)/.24;
    return [8,b-radius-8*t,radius+5*Math.sin(Math.PI*t)];
  };
  ball.style.transform = transform(shot(0));
  shadow.style.transform = transform([-37,-83,0]);
  svg.dataset.shotState = 'ready';
  window.kickoffScene = {
    async shoot(run) {
      svg.classList.remove('is-goal');
      svg.dataset.shotState = 'shooting';
      const ballFrames = [], shadowFrames = [];
      for(let i=0;i<=40;i++) {
        const offset = i/40, position = shot(offset);
        ballFrames.push({offset,transform:transform(position)});
        shadowFrames.push({offset,transform:transform([position[0],position[1],0]),opacity:1-(position[2]-radius)/70});
      }
      // Final styles remain after the animation; the ball never disappears or snaps back.
      ball.style.transform = transform(shot(1));
      shadow.style.transform = transform([8,b-radius-8,0]);
      roll.style.transform = 'rotate(460deg)';
      await Promise.all([
        run(ball,ballFrames,{duration:1100,easing:'linear'}),
        run(shadow,shadowFrames,{duration:1100,easing:'linear'}),
        run(roll,[{transform:'rotate(0deg)'},{transform:'rotate(460deg)'}],{duration:1100,easing:'ease-out'}),
        run(svg.querySelector('.kick-net'),[{transform:'translate(0,0)'},{transform:'translate(2px,-2px)',offset:.3},{transform:'translate(-1px,1px)',offset:.65},{transform:'translate(0,0)'}],{delay:820,duration:280,easing:'ease-out'})
      ]);
      svg.classList.add('is-goal');
      svg.dataset.shotState = 'goal';
      await run(svg.querySelector('.kick-goal-message'),[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)',offset:.4},{opacity:1,transform:'translateY(0)'}],{duration:380});
    }
  };
})();
