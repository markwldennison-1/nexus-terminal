(function(){
  const a=document.querySelector('audio.ana-audio');
  if(!a) return;
  try{ a.currentTime=0; a.play().catch(()=>{});}catch(e){}
})();