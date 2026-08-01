const icons = {
  home: '⌂', explore: '⌁', passport: '▣', badges: '✦', journal: '✎', review: '✓', students: '♙', bell: '♢', wave: '≈', clock: '◷'
};

const islands = [
  {
    id: 'bidara', name: 'Gili Bidara', tagline: 'Reef edges & seagrass stories', className: '',
    description: 'Observe how coral, seagrass, people, and marine life share one connected island home.', progress: 67,
  },
  {
    id: 'range', name: 'Gili Range', tagline: 'Mangroves & coastal clues', className: 'range',
    description: 'Follow the shoreline, investigate coastal habitats, and look for nature’s protection systems.', progress: 33,
  },
  {
    id: 'sarang', name: 'Gili Sarang', tagline: 'Wildlife & community knowledge', className: 'sarang',
    description: 'Meet island species and learn how local knowledge can help care for the sea.', progress: 0,
  },
];

const activities = [
  { id:'coral-basics', island:'bidara', title:'Meet the coral neighbourhood', mode:'online', icon:'◌', time:'12 min', badge:'Coral Explorer', description:'Explore a visual guide to coral habitats and discover why a reef is a living neighbourhood.', steps:['Read the coral habitat story.','Match three reef residents to their homes.','Write one thing a healthy reef needs.'] },
  { id:'seagrass-watch', island:'bidara', title:'Seagrass shoreline watch', mode:'field', icon:'≋', time:'35 min', badge:'Ocean Scientist', description:'Observe a seagrass area carefully, record what you see, and leave the habitat as you found it.', steps:['Choose a safe observation point with your teacher.','Record three living things or signs of life.','Photograph your observation without disturbing wildlife.'] },
  { id:'reef-reflection', island:'bidara', title:'A reef through my eyes', mode:'online', icon:'◉', time:'10 min', badge:'Marine Wildlife Guardian', description:'Reflect on how everyday choices on land can affect coral reefs and marine wildlife.', steps:['Look closely at the reef illustration.','Identify two human actions that affect the reef.','Choose one action you can take this week.'] },
  { id:'mangrove-roots', island:'range', title:'Secrets among the roots', mode:'online', icon:'♧', time:'15 min', badge:'Mangrove Protector', description:'Discover how mangrove roots shelter young animals and protect the coast.', steps:['Explore the mangrove guide.','Find three animals that use mangroves.','Explain one way roots protect the shore.'] },
  { id:'shore-detective', island:'range', title:'Intertidal detective', mode:'field', icon:'⌕', time:'40 min', badge:'Ocean Scientist', description:'Investigate the changing world between high and low tide using careful observation.', steps:['Check the tide and safety guidance with your teacher.','Find five different natural objects or living things.','Record clues in a photo and short field note.'] },
  { id:'waste-audit', island:'range', title:'Coastal waste audit', mode:'field', icon:'♲', time:'30 min', badge:'Plastic-Free Champion', description:'Sort and record shoreline rubbish to understand where it may have come from.', steps:['Wear gloves and follow your teacher’s safety briefing.','Record rubbish by type without handling sharp objects.','Photograph the completed tally and share one solution.'] },
  { id:'wildlife-guide', island:'sarang', title:'Island wildlife field guide', mode:'online', icon:'◍', time:'14 min', badge:'Marine Wildlife Guardian', description:'Learn to notice wildlife responsibly through shape, movement, colour, and habitat clues.', steps:['Study the wildlife observation guide.','Choose one species and note three features.','Write a respectful wildlife-watching rule.'] },
  { id:'fisher-stories', island:'sarang', title:'A conversation with a fisher', mode:'field', icon:'☵', time:'45 min', badge:'Community Ocean Ambassador', description:'Listen to local ecological knowledge and record how the sea has changed over time.', steps:['Prepare three respectful questions.','Interview a fisher or community elder with permission.','Share one lesson in your own words and add a photo if permitted.'] },
  { id:'ocean-promise', island:'sarang', title:'My ocean promise', mode:'online', icon:'♡', time:'8 min', badge:'Community Ocean Ambassador', description:'Turn what you have learned into a small, practical action you can share with others.', steps:['Choose an ocean issue you care about.','Write one action you can repeat for a month.','Tell someone why your promise matters.'] },
];

const badgeInfo = {
  'Coral Explorer': { icon:'◌', note:'Understands the reef as a living habitat' },
  'Mangrove Protector': { icon:'♧', note:'Discovers how mangroves shelter and protect' },
  'Marine Wildlife Guardian': { icon:'◍', note:'Observes marine life with care and respect' },
  'Ocean Scientist': { icon:'⌕', note:'Uses evidence and careful field observation' },
  'Plastic-Free Champion': { icon:'♲', note:'Takes practical action on marine rubbish' },
  'Community Ocean Ambassador': { icon:'☵', note:'Shares ocean knowledge with the community' },
};

const seed = {
  role:'student', page:'home', islandFilter:'all', modeFilter:'all',
  completed:['coral-basics','reef-reflection','mangrove-roots'],
  submissions:[
    { id:1, activityId:'seagrass-watch', student:'Siti Rahmawati', date:'30 Jul 2026', reflection:'I saw tiny fish hiding between the seagrass leaves. The meadow felt like a nursery for the sea.', status:'pending', image:null },
    { id:2, activityId:'waste-audit', student:'Bima Aditya', date:'29 Jul 2026', reflection:'Most of our collected rubbish was food packaging. We made a plan to bring refillable bottles.', status:'pending', image:null },
    { id:3, activityId:'fisher-stories', student:'Nur Aisyah', date:'28 Jul 2026', reflection:'I learned that fishers read the wind, current, and clouds before leaving shore.', status:'pending', image:null },
  ],
  badgeStatus:{
    'Coral Explorer':'earned', 'Mangrove Protector':'earned', 'Marine Wildlife Guardian':'pending',
    'Ocean Scientist':'pending', 'Plastic-Free Champion':'locked', 'Community Ocean Ambassador':'locked'
  }
};

let state = loadState();
const demoRole = new URLSearchParams(location.search).get('role');
if (demoRole === 'teacher' || demoRole === 'student') {
  state.role = demoRole;
  state.page = demoRole === 'teacher' ? 'teacher' : 'home';
}
let activeModal = null;
let pendingImage = null;

function loadState(){
  try {
    const saved = JSON.parse(localStorage.getItem('lsk-passport-v1'));
    return saved ? {...seed, ...saved, badgeStatus:{...seed.badgeStatus,...saved.badgeStatus}} : structuredClone(seed);
  } catch { return structuredClone(seed); }
}
function save(){ localStorage.setItem('lsk-passport-v1', JSON.stringify(state)); }
function initials(name){ return name.split(' ').map(x=>x[0]).slice(0,2).join(''); }
function islandName(id){ return islands.find(i=>i.id===id)?.name || ''; }
function activityFor(id){ return activities.find(a=>a.id===id); }
function navItems(){
  return state.role === 'student'
    ? [['home','home','My Journey'],['explore','explore','Explore'],['passport','passport','Passport'],['badges','badges','Badges'],['journal','journal','Journal']]
    : [['teacher','home','Overview'],['review','review','Review'],['students','students','Students']];
}
function setPage(page){ state.page=page; save(); activeModal=null; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function setRole(role){ state.role=role; state.page=role==='student'?'home':'teacher'; save(); render(); }
function showToast(message){ const el=document.querySelector('#toast'); el.textContent=message; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2500); }
function icon(key){ return `<span class="ico">${icons[key] || '•'}</span>`; }

function shell(content){
  const items=navItems();
  const title = state.role==='student' ? 'Digital Ocean Passport' : 'Teacher workspace';
  return `<div class="app-shell">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">${icons.wave}</div><div><strong>Laut Sahabat Kita</strong><small>Ocean Passport</small></div></div>
      <nav class="nav">${items.map(([p,i,l])=>`<button class="nav-btn ${state.page===p?'active':''}" onclick="setPage('${p}')">${icon(i)}<span>${l}</span></button>`).join('')}</nav>
      <div class="role-card"><p>Prototype view</p><div class="role-switch"><button class="${state.role==='student'?'active':''}" onclick="setRole('student')">Student</button><button class="${state.role==='teacher'?'active':''}" onclick="setRole('teacher')">Teacher</button></div></div>
    </aside>
    <main class="main">
      <header class="topbar"><div><div class="eyebrow">Laut Sahabat Kita</div><div class="top-title">${title}</div></div><div class="top-actions"><button class="icon-button" aria-label="Notifications">${icons.bell}${state.submissions.some(s=>s.status==='pending')?'<i class="notice-dot"></i>':''}</button><button class="profile-chip" onclick="setRole('${state.role==='student'?'teacher':'student'}')" title="Switch to ${state.role==='student'?'teacher':'student'} prototype" aria-label="Switch to ${state.role==='student'?'teacher':'student'} prototype"><div class="avatar">${state.role==='student'?'SR':'IA'}</div><div><strong>${state.role==='student'?'Siti Rahmawati':'Ibu Aminah'}</strong><small>${state.role==='student'?'Young explorer':'Teacher · SDN Labuhan Pandan'}</small></div></button></div></header>
      ${content}
    </main>
    <nav class="mobile-nav">${items.slice(0,5).map(([p,i,l])=>`<button class="${state.page===p?'active':''}" onclick="setPage('${p}')">${icon(i)}<span>${l}</span></button>`).join('')}</nav>
  </div>`;
}

function studentHome(){
  return `<div class="page">
    <section class="hero">
      <div class="hero-copy"><span class="hero-kicker">✦ Your ocean journey continues</span><h1>Selamat datang,<br>Siti!</h1><p>Every observation, question, and action adds a new page to your Ocean Passport. Where will your curiosity take you today?</p><div class="hero-actions"><button class="btn light" onclick="setPage('explore')">Continue exploring →</button><button class="btn ghost" onclick="setPage('passport')">View my passport</button></div></div>
      <div class="hero-progress"><div class="row"><div><small>Overall journey</small><strong>42%</strong></div><span>🌊</span></div><div class="progress"><i style="width:42%"></i></div><small>3 of 9 activities complete</small></div>
    </section>
    <section class="section"><div class="stat-grid">
      ${stat('✦','2','Badges earned')}${stat('⌁','3','Activities complete')}${stat('◷','2.4h','Time exploring')}${stat('◎','2','Habitats visited')}
    </div></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Three island pilot</span><h2>Choose your next island</h2><p>Learn online or take your passport into the field.</p></div><button class="text-btn" onclick="setPage('explore')">See all activities →</button></div><div class="journey-grid">${islands.map(islandCard).join('')}</div></section>
    <section class="section two-col"><div class="panel"><div class="panel-head"><h3>Continue learning</h3><button class="text-btn" onclick="setPage('explore')">View all</button></div><div class="activity-list">
      ${activities.filter(a=>!state.completed.includes(a.id)).slice(0,3).map(a=>activityRow(a)).join('')}
    </div></div><div class="panel"><div class="panel-head"><h3>Your stewardship path</h3></div><div class="timeline"><div class="timeline-item"><i class="timeline-dot"></i><div class="timeline-copy"><strong>Ocean learner</strong><span>Joined LSK · 2026</span></div></div><div class="timeline-item"><i class="timeline-dot"></i><div class="timeline-copy"><strong>Island explorer</strong><span>2 habitats visited</span></div></div><div class="timeline-item"><i class="timeline-dot future"></i><div class="timeline-copy"><strong>Citizen scientist</strong><span>Your next chapter</span></div></div><div class="timeline-item"><i class="timeline-dot future"></i><div class="timeline-copy"><strong>Ocean steward</strong><span>A lifelong journey</span></div></div></div></div></section>
  </div>`;
}
function stat(i,n,l){ return `<div class="stat-card"><div class="stat-icon">${i}</div><strong>${n}</strong><span>${l}</span></div>`; }
function islandCard(i){
  const count=activities.filter(a=>a.island===i.id).length;
  return `<article class="island-card"><div class="island-art ${i.className}"><span class="art-label">${i.tagline}</span></div><div class="island-body"><div class="island-top"><h3>${i.name}</h3><span>${count} activities</span></div><p>${i.description}</p><div class="island-foot"><div><small>${i.progress}% explored</small><div class="mini-progress"><i style="width:${i.progress}%"></i></div></div><button class="btn sm outline" onclick="openIsland('${i.id}')">Explore →</button></div></div></article>`;
}
function activityRow(a){
  const submission=state.submissions.find(s=>s.activityId===a.id&&s.student==='Siti Rahmawati');
  const status=state.completed.includes(a.id)?'earned':submission?.status||'locked';
  return `<button class="activity-row" style="width:100%;text-align:left;cursor:pointer" onclick="openActivity('${a.id}')"><span class="activity-ico">${a.icon}</span><span class="activity-info"><strong>${a.title}</strong><small>${islandName(a.island)} · ${a.mode==='field'?'Field activity':'Learn online'} · ${a.time}</small></span><span class="status ${status}">${status==='earned'?'Complete':status==='locked'?'Start':status}</span></button>`;
}

function explorePage(){
  let list=activities.filter(a=>(state.islandFilter==='all'||a.island===state.islandFilter)&&(state.modeFilter==='all'||a.mode===state.modeFilter));
  return `<div class="page"><div class="page-intro"><div><span class="eyebrow">Learning library</span><h1>Explore the islands</h1><p>Use the digital guide anywhere, then take your learning outside when you can. Field and online pathways both belong in your passport.</p></div><div class="segmented"><button class="${state.modeFilter==='all'?'active':''}" onclick="filterMode('all')">All</button><button class="${state.modeFilter==='online'?'active':''}" onclick="filterMode('online')">Learn online</button><button class="${state.modeFilter==='field'?'active':''}" onclick="filterMode('field')">In the field</button></div></div>
    <div class="filter-row"><button class="filter-chip ${state.islandFilter==='all'?'active':''}" onclick="filterIsland('all')">All islands</button>${islands.map(i=>`<button class="filter-chip ${state.islandFilter===i.id?'active':''}" onclick="filterIsland('${i.id}')">${i.name}</button>`).join('')}</div>
    <div class="module-grid">${list.map(moduleCard).join('')}</div></div>`;
}
function moduleCard(a){
  const done=state.completed.includes(a.id); const sub=state.submissions.find(s=>s.activityId===a.id&&s.student==='Siti Rahmawati');
  return `<article class="module-card"><div class="module-card-top"><span class="module-icon">${a.icon}</span><span class="module-mode ${a.mode}">${a.mode==='field'?'Field activity':'Learn online'}</span></div><h3>${a.title}</h3><p>${a.description}</p><div class="module-meta"><span>${icons.clock} ${a.time} · ${islandName(a.island)}</span><button onclick="openActivity('${a.id}')">${done?'Review':sub?.status==='pending'?'View submission':'Begin'} →</button></div></article>`;
}
function filterMode(v){ state.modeFilter=v; save(); render(); }
function filterIsland(v){ state.islandFilter=v; save(); render(); }
function openIsland(id){ state.islandFilter=id; state.modeFilter='all'; setPage('explore'); }

function passportPage(){
  return `<div class="page"><div class="page-intro"><div><span class="eyebrow">Personal learning record</span><h1>My Ocean Passport</h1><p>A growing record of the places you explore, the questions you ask, and the care you show for the ocean.</p></div><button class="btn outline" onclick="window.print()">Print passport</button></div>
    <section class="passport"><div class="passport-main"><div class="passport-label">Republic of ocean stewards · learner passport</div><div class="passport-person"><div class="avatar">SR</div><div><h2>Siti Rahmawati</h2><p>SDN Labuhan Pandan · Grade 5</p></div></div><div class="passport-id"><div><span>Passport no.</span><strong>LSK-2026-0142</strong></div><div><span>Home village</span><strong>Labuhan Pandan</strong></div><div><span>Joined LSK</span><strong>2026</strong></div></div></div><div class="passport-side"><div class="seal"><div><span>≈</span><strong>Ocean Learner</strong><small>Alas Strait</small></div></div></div></section>
    <section class="section"><div class="section-head"><div><span class="eyebrow">Achievement collection</span><h2>Passport badges</h2><p>Field evidence is reviewed by a teacher before a badge is awarded.</p></div><button class="text-btn" onclick="setPage('badges')">See badge details →</button></div><div class="badge-grid">${Object.entries(badgeInfo).slice(0,3).map(([n,b])=>badgeCard(n,b)).join('')}</div></section>
  </div>`;
}
function badgesPage(){
  const earned=Object.values(state.badgeStatus).filter(s=>s==='earned').length;
  return `<div class="page"><div class="page-intro"><div><span class="eyebrow">Achievement collection</span><h1>Your ocean badges</h1><p>Badges celebrate learning, outdoor exploration, and actions that care for marine places and communities.</p></div><div class="segmented"><button class="active">${earned} earned</button><button>${Object.keys(badgeInfo).length-earned} in progress</button></div></div><div class="badge-grid">${Object.entries(badgeInfo).map(([n,b])=>badgeCard(n,b)).join('')}</div></div>`;
}
function badgeCard(name,b){
  const status=state.badgeStatus[name]||'locked';
  return `<article class="badge-card ${status}"><span class="badge-status status ${status}">${status}</span><div><div class="badge-medal">${b.icon}</div><h3>${name}</h3><p>${b.note}</p></div></article>`;
}
function journalPage(){
  const mine=state.submissions.filter(s=>s.student==='Siti Rahmawati');
  return `<div class="page"><div class="page-intro"><div><span class="eyebrow">Field notes & reflections</span><h1>My learning journal</h1><p>Your observations are evidence of learning. They become more valuable every time you return and notice something new.</p></div><button class="btn" onclick="setPage('explore')">Add an observation</button></div><div class="panel"><div class="activity-list">${mine.length?mine.map(s=>{const a=activityFor(s.activityId);return `<button class="activity-row" style="width:100%;text-align:left" onclick="viewSubmission(${s.id})"><span class="activity-ico">${a.icon}</span><span class="activity-info"><strong>${a.title}</strong><small>${s.date} · “${s.reflection}”</small></span><span class="status ${s.status}">${s.status}</span></button>`}).join(''):'<div class="empty"><span>✎</span><strong>No journal entries yet</strong>Start an activity and record what you notice.</div>'}</div></div></div>`;
}

function teacherHome(){
  const pending=state.submissions.filter(s=>s.status==='pending');
  return `<div class="page"><section class="teacher-hero"><div><span class="eyebrow" style="color:#a5cec9">Saturday, 1 August 2026</span><h1>Good afternoon, Ibu Aminah</h1><p>Here is how your young ocean explorers are progressing this week.</p></div><div class="queue-pill"><span>Awaiting<br>your review</span><strong>${pending.length}</strong><button class="btn light sm" onclick="setPage('review')">Review now</button></div></section>
    <section class="section"><div class="stat-grid">${stat('♙','24','Active students')}${stat('✓','68','Activities complete')}${stat('✦','31','Badges approved')}${stat('⌁','3','Field trips')}</div></section>
    <section class="dashboard-grid"><div class="panel"><div class="panel-head"><h3>Recent submissions</h3><button class="text-btn" onclick="setPage('review')">View queue →</button></div>${reviewList(pending.slice(0,4))}</div><div class="panel"><div class="panel-head"><h3>Island participation</h3><span class="status earned">This term</span></div><div class="chart">${[['Bidara',82],['Range',58],['Sarang',31]].map(([n,v])=>`<div class="bar-wrap"><strong>${v}%</strong><div class="bar" style="height:${v}%"></div><span>${n}</span></div>`).join('')}</div></div></section>
    <section class="section panel"><div class="panel-head"><h3>Class progress</h3><button class="text-btn" onclick="setPage('students')">All students →</button></div>${studentTable()}</section>
  </div>`;
}
function reviewList(list){
  return `<div class="review-list">${list.length?list.map(s=>{const a=activityFor(s.activityId);return `<div class="review-card"><button class="thumb" onclick="viewSubmission(${s.id})">${s.image?`<img src="${s.image}" alt="Student evidence">`:a.icon}</button><div class="review-info"><strong>${s.student} · ${a.title}</strong><span>${s.date} · ${s.reflection}</span></div><div class="review-actions"><button class="approve" title="Approve" onclick="approveSubmission(${s.id})">✓</button><button class="reject" title="Return for changes" onclick="returnSubmission(${s.id})">↶</button></div></div>`}).join(''):'<div class="empty"><span>✓</span><strong>You are all caught up</strong>No submissions are waiting for review.</div>'}</div>`;
}
function reviewPage(){
  const pending=state.submissions.filter(s=>s.status==='pending');
  const reviewed=state.submissions.filter(s=>s.status!=='pending');
  return `<div class="page"><div class="page-intro"><div><span class="eyebrow">Evidence review</span><h1>Badge approval queue</h1><p>Review each student’s photo and reflection. Approve clear evidence or return it with encouragement to try again.</p></div><span class="status pending">${pending.length} pending</span></div><section class="panel"><div class="panel-head"><h3>Needs your review</h3></div>${reviewList(pending)}</section>${reviewed.length?`<section class="section panel"><div class="panel-head"><h3>Recently reviewed</h3></div><div class="activity-list">${reviewed.map(s=>{const a=activityFor(s.activityId);return `<button class="activity-row" style="width:100%;text-align:left" onclick="viewSubmission(${s.id})"><span class="activity-ico">${a.icon}</span><span class="activity-info"><strong>${s.student} · ${a.title}</strong><small>${s.date}</small></span><span class="status ${s.status}">${s.status}</span></button>`}).join('')}</div></section>`:''}</div>`;
}
const students=[['Siti Rahmawati','SR','5A','3 / 9','2'],['Bima Aditya','BA','5A','5 / 9','3'],['Nur Aisyah','NA','5A','4 / 9','2'],['Rafi Pratama','RP','5A','2 / 9','1'],['Dewi Lestari','DL','5A','6 / 9','4']];
function studentTable(){ return `<table class="student-table"><thead><tr><th>Student</th><th>Class</th><th>Activities</th><th>Badges</th></tr></thead><tbody>${students.map(s=>`<tr><td><div class="student-name"><span class="avatar">${s[1]}</span>${s[0]}</div></td><td>${s[2]}</td><td>${s[3]}</td><td>${s[4]}</td></tr>`).join('')}</tbody></table>`; }
function studentsPage(){ return `<div class="page"><div class="page-intro"><div><span class="eyebrow">SDN Labuhan Pandan · Grade 5A</span><h1>Student progress</h1><p>See participation across online learning, field activities, reflections, and approved badges.</p></div><button class="btn outline" onclick="showToast('Class report prepared for download')">Export report</button></div><section class="panel">${studentTable()}</section></div>`; }

function openActivity(id){ activeModal={type:'activity',id}; pendingImage=null; renderModal(); }
function viewSubmission(id){ activeModal={type:'submission',id}; renderModal(); }
function closeModal(){ activeModal=null; pendingImage=null; document.querySelector('#modal-root').innerHTML=''; }
function renderModal(){
  const root=document.querySelector('#modal-root'); if(!activeModal){root.innerHTML='';return;}
  if(activeModal.type==='submission'){
    const s=state.submissions.find(x=>x.id===activeModal.id), a=activityFor(s.activityId);
    root.innerHTML=`<div class="modal-backdrop" onclick="backdropClose(event)"><div class="modal"><div class="modal-head"><div><span class="eyebrow">Student evidence · ${s.date}</span><h2>${a.title}</h2></div><button class="close" onclick="closeModal()">×</button></div><div class="modal-body">${s.image?`<img class="detail-photo" src="${s.image}" alt="Evidence uploaded by ${s.student}">`:`<div class="detail-photo" style="display:grid;place-items:center;font-size:55px">${a.icon}</div>`}<div class="quote">“${s.reflection}”<br><small>— ${s.student}</small></div><div class="field"><label>Badge</label><div class="activity-row"><span class="activity-ico">${badgeInfo[a.badge]?.icon||'✦'}</span><span class="activity-info"><strong>${a.badge}</strong><small>${badgeInfo[a.badge]?.note||''}</small></span><span class="status ${s.status}">${s.status}</span></div></div>${state.role==='teacher'&&s.status==='pending'?`<div class="modal-actions"><button class="btn outline" onclick="returnSubmission(${s.id})">Return for changes</button><button class="btn" onclick="approveSubmission(${s.id})">Approve badge ✓</button></div>`:''}</div></div></div>`;
    return;
  }
  const a=activityFor(activeModal.id), done=state.completed.includes(a.id), sub=state.submissions.find(s=>s.activityId===a.id&&s.student==='Siti Rahmawati');
  root.innerHTML=`<div class="modal-backdrop" onclick="backdropClose(event)"><div class="modal"><div class="modal-head"><div><span class="eyebrow">${islandName(a.island)} · ${a.mode==='field'?'Field activity':'Learn online'}</span><h2>${a.title}</h2></div><button class="close" onclick="closeModal()">×</button></div><form class="modal-body" onsubmit="submitActivity(event,'${a.id}')"><p>${a.description}</p><div class="steps">${a.steps.map((s,i)=>`<div class="step"><b>${i+1}</b><span>${s}</span></div>`).join('')}</div>${sub?`<div class="quote">Your reflection: “${sub.reflection}”</div><div class="modal-actions"><span class="status ${sub.status}">${sub.status==='pending'?'Waiting for teacher approval':sub.status}</span></div>`:done?`<div class="empty"><span>✓</span><strong>Activity complete</strong>This learning is saved in your passport.</div>`:`${a.mode==='field'?`<div class="field"><label>Photo evidence</label><div class="upload"><input id="photo" type="file" accept="image/*" onchange="previewPhoto(event)"><strong>Tap to add a field photo</strong><small>JPG or PNG · Ask permission before photographing people</small></div><div id="photo-preview"></div></div>`:''}<div class="field"><label>${a.mode==='field'?'What did you notice?':'Your reflection'}</label><textarea id="reflection" required minlength="10" placeholder="Write a few sentences in your own words..."></textarea></div><div class="modal-actions"><button type="button" class="btn outline" onclick="closeModal()">Save for later</button><button type="submit" class="btn">${a.mode==='field'?'Send to teacher':'Complete activity'} →</button></div>`}</form></div></div>`;
}
function backdropClose(e){ if(e.target.classList.contains('modal-backdrop')) closeModal(); }
function previewPhoto(e){
  const file=e.target.files[0]; if(!file)return;
  if(file.size>3*1024*1024){ showToast('Please choose an image smaller than 3 MB'); e.target.value=''; return; }
  const reader=new FileReader(); reader.onload=()=>{pendingImage=reader.result; document.querySelector('#photo-preview').innerHTML=`<img class="preview" src="${pendingImage}" alt="Photo preview">`;}; reader.readAsDataURL(file);
}
function submitActivity(e,id){
  e.preventDefault(); const a=activityFor(id), reflection=document.querySelector('#reflection')?.value.trim(); if(!reflection)return;
  if(a.mode==='field'){
    if(!pendingImage && !confirm('Submit without a photo? Your teacher may ask you to add evidence.')) return;
    state.submissions.push({id:Date.now(),activityId:id,student:'Siti Rahmawati',date:new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),reflection,status:'pending',image:pendingImage});
    state.badgeStatus[a.badge]='pending'; showToast('Sent to your teacher for approval');
  } else {
    if(!state.completed.includes(id)) state.completed.push(id);
    state.badgeStatus[a.badge]='earned'; showToast(`${a.badge} learning added to your passport`);
  }
  save(); closeModal(); render();
}
function approveSubmission(id){
  const s=state.submissions.find(x=>x.id===id); if(!s)return; s.status='approved'; const a=activityFor(s.activityId);
  if(s.student==='Siti Rahmawati'){ if(!state.completed.includes(a.id))state.completed.push(a.id); state.badgeStatus[a.badge]='earned'; }
  save(); closeModal(); render(); showToast(`${a.badge} approved for ${s.student}`);
}
function returnSubmission(id){ const s=state.submissions.find(x=>x.id===id); if(!s)return; s.status='returned'; save(); closeModal(); render(); showToast(`Submission returned to ${s.student}`); }

function render(){
  if(state.role==='student' && ['teacher','review','students'].includes(state.page)) state.page='home';
  if(state.role==='teacher' && !['teacher','review','students'].includes(state.page)) state.page='teacher';
  const pages={home:studentHome,explore:explorePage,passport:passportPage,badges:badgesPage,journal:journalPage,teacher:teacherHome,review:reviewPage,students:studentsPage};
  document.querySelector('#app').innerHTML=shell(pages[state.page]()); renderModal();
}

window.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
