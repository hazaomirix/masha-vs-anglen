/* ===== PROFILE SYSTEM (shared across pages) ===== */
const PKEY='casinoProfiles';
const CKEY='casinoCurrentProfile';
const BAL_KEY='casinoRpoBal';

function loadProfiles(){
  try{return JSON.parse(localStorage.getItem(PKEY))||[]}catch(e){return []}
}
function saveProfiles(list){localStorage.setItem(PKEY,JSON.stringify(list))}

function getProfile(){
  const id=localStorage.getItem(CKEY);
  return loadProfiles().find(p=>p.id===id)||null;
}
function getCurrentId(){return localStorage.getItem(CKEY)||''}
function setCurrentProfile(id){localStorage.setItem(CKEY,id)}

function getBalance(){
  const p=getProfile();
  if(p)return parseInt(p.balance)||0;
  // fallback to old shared balance (no profile yet)
  return parseInt(localStorage.getItem(BAL_KEY)||'100000');
}
function setBalance(v){
  const p=getProfile();
  v=Math.max(0,Math.floor(v));
  if(p){
    p.balance=v;
    const list=loadProfiles();
    const i=list.findIndex(x=>x.id===p.id);
    if(i>=0){list[i]=p;saveProfiles(list)}
  }else{
    localStorage.setItem(BAL_KEY,String(v));
  }
  updateBalanceUI();
}
function addBalance(v){setBalance(getBalance()+v)}

function topup(){
  setBalance(Math.max(getBalance(),100000));
  const w=window.sndWin||window.sw; if(w)w();
  const c=window.confetti||window.cf; if(c)c(20);
}

function updateBalanceUI(){
  document.querySelectorAll('[data-balance]').forEach(e=>e.textContent='¥ '+getBalance().toLocaleString('ru-RU'));
}

/* ===== HEADER USER ===== */
function renderUser(){
  const p=getProfile();
  const nickEl=document.querySelector('.header-nick b');
  const avEl=document.querySelector('.avatar');
  if(p){
    if(nickEl)nickEl.textContent=p.name;
    if(avEl)avEl.textContent=p.icon;
  }else{
    if(avEl)avEl.textContent='M';
  }
}

/* ===== PROFILE GATE (create/select profile) ===== */
const AVATARS=['🦊','🐺','🐯','🦁','🐉','👑','🥷','🎩'];

function initProfileGate(){
  const gate=document.getElementById('profileGate');
  if(!gate)return;
  // avatar picker
  const picker=document.getElementById('avatarPick');
  let selAv=AVATARS[Math.floor(Math.random()*AVATARS.length)];
  if(picker){
    picker.innerHTML='';
    AVATARS.forEach(a=>{
      const d=document.createElement('div');
      d.className='av-opt'+(a===selAv?' sel':'');
      d.textContent=a;
      d.onclick=()=>{selAv=a;picker.querySelectorAll('.av-opt').forEach(x=>x.classList.remove('sel'));d.classList.add('sel')};
      picker.appendChild(d);
    });
  }
  const doCreate=()=>{
    const name=document.getElementById('profName').value.trim();
    const err=document.getElementById('profErr');
    if(name.length<2){err.textContent='Минимум 2 символа';return}
    if(name.length>16){err.textContent='Максимум 16 символов';return}
    const list=loadProfiles();
    if(list.some(p=>p.name.toLowerCase()===name.toLowerCase())){err.textContent='Этот ник уже занят';return}
    const prof={id:'p'+Date.now(),name,icon:selAv,balance:100000,created:Date.now()};
    list.push(prof);saveProfiles(list);
    setCurrentProfile(prof.id);
    gate.classList.add('hidden');
    updateBalanceUI();renderUser();
    if(window.sndWin)sndWin();if(window.confetti)confetti(30);
  };
  const btn=document.getElementById('profCreateBtn');
  if(btn)btn.onclick=doCreate;
  const input=document.getElementById('profName');
  if(input)input.addEventListener('keydown',e=>{if(e.key==='Enter')doCreate()});
}

function logout(){
  localStorage.removeItem(CKEY);
  const gate=document.getElementById('profileGate');
  if(gate)gate.classList.remove('hidden');
  const input=document.getElementById('profName');
  if(input)input.value='';
  const err=document.getElementById('profErr');
  if(err)err.textContent='';
  updateBalanceUI();renderUser();
  if(window.sndClick)sndClick();
}

// run on DOM ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',()=>{updateBalanceUI();renderUser();initProfileGate()});
}else{
  updateBalanceUI();renderUser();initProfileGate();
}

// hide gate if profile exists
(function(){
  const gate=document.getElementById('profileGate');
  if(gate&&getProfile())gate.classList.add('hidden');
})();