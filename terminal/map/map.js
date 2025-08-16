(async function(){
  const res = await fetch('/terminal/map/pins.json'); const pins = await res.json();
  const map = document.querySelector('.map');
  pins.forEach(p=>{
    const pin = document.createElement('a'); pin.className='pin'; pin.href=p.href; pin.style.left=p.x+'%'; pin.style.top=p.y+'%'; pin.title=p.title;
    pin.setAttribute('aria-label', p.title + ' (Section ' + p.section + ')');
    const tip = document.createElement('div'); tip.className='tooltip'; tip.innerHTML = `<strong>${p.title}</strong><br>Section ${p.section}`;
    map.appendChild(pin); map.appendChild(tip);
  });
})();