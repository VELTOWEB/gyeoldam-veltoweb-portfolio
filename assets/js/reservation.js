(() => {
  const root = document.querySelector('[data-reservation-app]');
  if (!root || !window.GYEOLDAM_DATA) return;
  const state = { step:1, date:'', guests:2, time:'', course:'', seat:'', details:{} };
  const steps = [...root.querySelectorAll('[data-step]')];
  const nav = [...root.querySelectorAll('[data-step-nav]')];
  const summaryEls = [...document.querySelectorAll('[data-summary]')];
  const calendar = root.querySelector('[data-calendar]');
  const courseList = root.querySelector('[data-course-options]');
  const seatList = root.querySelector('[data-seat-options]');
  const timeList = root.querySelector('[data-time-options]');
  const errors = root.querySelector('[data-form-errors]');
  let month = new Date(2026,9,1);

  const money = n => new Intl.NumberFormat('ko-KR').format(n) + '원';
  const selectedCourse = () => GYEOLDAM_DATA.courses[state.course];
  const total = () => selectedCourse() ? selectedCourse().price * state.guests : 0;
  const renderSummary = () => summaryEls.forEach(el => {
    el.innerHTML = `<dl class="summary-list">
      <div><dt>날짜</dt><dd>${state.date || '—'}</dd></div>
      <div><dt>시간</dt><dd>${state.time || '—'}</dd></div>
      <div><dt>인원</dt><dd>${state.guests ? state.guests+'명':'—'}</dd></div>
      <div><dt>코스</dt><dd>${selectedCourse()?.name || '—'}</dd></div>
      <div><dt>좌석</dt><dd>${state.seat ? ({counter:'셰프 카운터',dining:'메인 다이닝',private:'프라이빗 룸'}[state.seat]) : '—'}</dd></div>
      <div class="summary-total"><dt>예상 금액</dt><dd>${total()?money(total()):'—'}</dd></div>
    </dl>`;
  });

  const renderCalendar = () => {
    const y=month.getFullYear(), m=month.getMonth();
    const first = new Date(y,m,1), last = new Date(y,m+1,0);
    const names=['일','월','화','수','목','금','토'];
    let html = `<div class="calendar-head"><button type="button" data-cal-prev aria-label="이전 달">←</button><strong>${y}. ${String(m+1).padStart(2,'0')}</strong><button type="button" data-cal-next aria-label="다음 달">→</button></div><div class="calendar-grid calendar-week">${names.map(n=>`<span>${n}</span>`).join('')}</div><div class="calendar-grid">`;
    for(let i=0;i<first.getDay();i++) html += '<span class="calendar-empty"></span>';
    for(let d=1;d<=last.getDate();d++){
      const dt=new Date(y,m,d), day=dt.getDay(), iso=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const closed=day===0||day===1;
      const status=closed?'closed':([3,11,18,25].includes(d)?'limited':([6,20].includes(d)?'full':'available'));
      const disabled=closed||status==='full';
      html += `<button type="button" class="cal-day ${status} ${state.date===iso?'is-selected':''}" ${disabled?'disabled':''} data-date="${iso}" aria-label="${iso} ${status}"><b>${d}</b><small>${status==='available'?'AVAILABLE':status==='limited'?'LIMITED':status==='full'?'FULL':'CLOSED'}</small></button>`;
    }
    calendar.innerHTML=html+'</div>';
    calendar.querySelector('[data-cal-prev]').onclick=()=>{ month=new Date(y,m-1,1); renderCalendar(); };
    calendar.querySelector('[data-cal-next]').onclick=()=>{ month=new Date(y,m+1,1); renderCalendar(); };
    calendar.querySelectorAll('[data-date]').forEach(b=>b.onclick=()=>{ state.date=b.dataset.date; renderCalendar(); renderSummary(); });
  };

  const renderTimesAndCourses = () => {
    const allTimes=[...new Set(Object.values(GYEOLDAM_DATA.courses).flatMap(c=>c.times))];
    timeList.innerHTML=allTimes.map(t=>`<button type="button" data-time="${t}" class="choice-chip ${state.time===t?'is-selected':''}">${t}</button>`).join('');
    timeList.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{state.time=b.dataset.time; state.course=''; renderTimesAndCourses(); renderSummary();});
    courseList.innerHTML=Object.values(GYEOLDAM_DATA.courses).map(c=>{
      const allowed=!state.time || c.times.includes(state.time);
      return `<button type="button" class="course-choice ${state.course===c.id?'is-selected':''}" data-course="${c.id}" ${allowed?'':'disabled'}><span><small>${c.en}</small><strong>${c.name}</strong><em>${c.detail}</em></span><b>${money(c.price)}</b></button>`;
    }).join('');
    courseList.querySelectorAll('[data-course]').forEach(b=>b.onclick=()=>{state.course=b.dataset.course; renderTimesAndCourses(); renderSummary();});
  };

  const renderSeats = () => {
    seatList.innerHTML=GYEOLDAM_DATA.seats.map(s=>`<button type="button" data-seat="${s.id}" class="seat-choice ${state.seat===s.id?'is-selected':''}"><img src="${s.image}" alt="${s.ko} 공간 이미지" loading="lazy"><span><small>${s.title}</small><strong>${s.ko}</strong><em>${s.desc}</em></span></button>`).join('');
    seatList.querySelectorAll('[data-seat]').forEach(b=>b.onclick=()=>{state.seat=b.dataset.seat; renderSeats(); renderSummary();});
  };

  const showStep = (n, shouldScroll=true) => {
    state.step=n;
    steps.forEach(s=>s.hidden=Number(s.dataset.step)!==n);
    nav.forEach(s=>s.classList.toggle('is-active', Number(s.dataset.stepNav)===n));
    if (shouldScroll) root.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'start'});
  };
  const validateStep = n => {
    if(n===1 && !state.date) return '예약 날짜를 선택해주세요.';
    if(n===2 && (!state.time || !state.course)) return '시간과 코스를 모두 선택해주세요.';
    if(n===3 && !state.seat) return '좌석을 선택해주세요.';
    return '';
  };

  root.addEventListener('click', e => {
    const next=e.target.closest('[data-next]'), prev=e.target.closest('[data-prev]');
    if(next){ const msg=validateStep(state.step); const err=root.querySelector(`[data-step-error="${state.step}"]`); if(msg){err.textContent=msg; err.hidden=false; return;} if(err)err.hidden=true; showStep(Math.min(4,state.step+1)); }
    if(prev) showStep(Math.max(1,state.step-1));
  });

  const guestInput=root.querySelector('[data-guests]');
  guestInput?.addEventListener('change',()=>{state.guests=Number(guestInput.value)||1; renderSummary();});

  const form=root.querySelector('form');
  form?.addEventListener('submit', e=>{
    e.preventDefault();
    errors.innerHTML='';
    const fd=new FormData(form), list=[];
    const name=String(fd.get('name')||'').trim(), phone=String(fd.get('phone')||'').trim(), email=String(fd.get('email')||'').trim();
    if(name.length<2) list.push(['name','이름을 2자 이상 입력해주세요.']);
    if(!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone)) list.push(['phone','전화번호를 확인해주세요.']);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) list.push(['email','이메일 형식을 확인해주세요.']);
    form.querySelectorAll('.field-error').forEach(x=>x.remove());
    list.forEach(([field,msg])=>{ const input=form.elements[field]; const p=document.createElement('p'); p.className='field-error'; p.textContent=msg; input.insertAdjacentElement('afterend',p); input.setAttribute('aria-invalid','true'); });
    if(list.length){ form.elements[list[0][0]].focus(); errors.textContent='입력 내용을 확인해주세요.'; return; }
    state.details=Object.fromEntries(fd.entries());
    root.querySelector('[data-reservation-flow]').hidden=true;
    const done=root.querySelector('[data-complete]'); done.hidden=false; done.focus();
    window.scrollTo({top:root.offsetTop-60, behavior:'smooth'});
  });

  const sheetBtn=document.querySelector('[data-summary-toggle]');
  const sheet=document.querySelector('[data-summary-sheet]');
  sheetBtn?.addEventListener('click',()=>{const open=sheet.classList.toggle('is-open'); sheetBtn.setAttribute('aria-expanded',String(open));});

  renderCalendar(); renderTimesAndCourses(); renderSeats(); renderSummary(); showStep(1,false);
})();
