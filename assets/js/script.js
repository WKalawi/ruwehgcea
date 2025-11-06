
document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.has-dropdown').forEach(function(el){
    const btn = el.querySelector('button');
    btn && btn.addEventListener('click', function(e){
      const open = el.classList.contains('open');
      document.querySelectorAll('.has-dropdown.open').forEach(function(o){ if(o!==el) o.classList.remove('open') });
      if(open) el.classList.remove('open'); else el.classList.add('open');
      e.stopPropagation();
    });
  });
  document.addEventListener('click', function(){ document.querySelectorAll('.has-dropdown.open').forEach(function(o){ o.classList.remove('open') }) });
  // mobile toggle
  const toggle = document.querySelectorAll('.nav-toggle');
  toggle.forEach(t=>t.addEventListener('click', function(e){
    const list = document.querySelector('.nav-links');
    if(!list) return;
    if(list.style.display === 'flex'){ list.style.display = ''; }
    else { list.style.display = 'flex'; list.style.flexDirection = 'column'; list.style.background = 'linear-gradient(90deg,#061226,#02203a)'; list.style.position = 'absolute'; list.style.top = '60px'; list.style.right = '20px'; }
  }));
});
