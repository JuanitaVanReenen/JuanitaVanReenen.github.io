const buttons=[...document.querySelectorAll('[data-reaction]')];
buttons.forEach(button=>{
  button.addEventListener('click',()=>{
    buttons.forEach(b=>b.classList.remove('selected'));
    button.classList.add('selected');
    const type=button.dataset.reaction;
    if(type==='TRAVEL') button.querySelector('span').textContent='Travel signal sent';
  });
});