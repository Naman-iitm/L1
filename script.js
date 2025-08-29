// ===== Helpers =====
const $ = (q, ctx=document) => ctx.querySelector(q);
const $$ = (q, ctx=document) => Array.from(ctx.querySelectorAll(q));
const toast = (msg) => {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(()=> t.classList.remove('show'), 1700);
};

// ===== Theme & Language Toggle =====
const themeBtn = $('#themeBtn');
themeBtn.addEventListener('click', () => {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
  themeBtn.textContent = html.dataset.theme === 'light' ? '☾' : '☼';
  toast(`Theme: ${html.dataset.theme}`);
});

let lang = 'EN'; // EN or HI
const langBtn = $('#langBtn');
langBtn.addEventListener('click', () => {
  lang = lang === 'EN' ? 'HI' : 'EN';
  langBtn.textContent = lang === 'EN' ? 'EN/हिं' : 'हिं/EN';
  if(currentSummary) renderSummary(currentSummary); // rerender in selected language
  toast(`Language: ${lang === 'EN' ? 'English' : 'Hindi'}`);
});

// ===== Mobile Nav =====
const navToggle = $('.nav-toggle');
const navList = $('#nav-list');
navToggle.addEventListener('click', () => {
  const open = navList.classList.toggle('show');
  navToggle.setAttribute('aria-expanded', String(open));
});

// Smooth scroll
$$('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){ e.preventDefault(); $(id)?.scrollIntoView({behavior:'smooth', block:'start'}) }
  });
});
$('#toTop').addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// ===== Scroll animations =====
const observer = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.remove('fade-in'); observer.unobserve(e.target); }});
},{threshold:.15});
$$('.fade-in').forEach(el=>observer.observe(el));

// ===== Uploader + Sample =====
const fileInput = $('#fileInput');
const sourceText = $('#sourceText');
const sampleBtn = $('#sampleBtn');
const clearBtn = $('#clearBtn');

const SAMPLE = `RENTAL AGREEMENT
This agreement is made on 01/10/2025 between LANDLORD: RAVI KUMAR and TENANT: PRIYA SHARMA.
Rent amount is ₹15,000 per month, payable on or before 5th of every month via UPI or bank transfer.
Security deposit of ₹30,000 is refundable at the end of the term subject to damages.
Late fee: ₹500 per day after due date.
Term: 11 months starting from 01/10/2025 to 31/08/2026.
Utilities to be paid by tenant. Premises at 21, Green Park, New Delhi.
Termination: 30 days written notice by either party.`;

sampleBtn.addEventListener('click', ()=>{
  sourceText.value = SAMPLE;
  toast('Loaded sample agreement');
});
clearBtn.addEventListener('click', ()=>{
  sourceText.value = '';
  clearClauses();
  $('#summary').innerHTML = `<div class="placeholder">Cleared. Add text or load sample.</div>`;
});

fileInput.addEventListener('change', async (e)=>{
  const file = e.target.files[0];
  if(!file){ return }
  if(file.type === 'text/plain'){
    const text = await file.text();
    sourceText.value = text.slice(0, 80000);
    toast('Loaded .txt file');
  } else {
    // For demo, fallback to sample
    sourceText.value = SAMPLE;
    toast('Preview uses sample for PDF/DOCX in demo');
  }
});

// Quick insert chips
$$('.panel-footer .chip').forEach(ch=>{
  ch.addEventListener('click', ()=>{
    const v = ch.dataset.insert || '';
    sourceText.value = (sourceText.value + '\n' + v).trim();
  });
});

// ===== Summarize (Mock AI) =====
const summarizeBtn = $('#summarizeBtn');
const summaryEl = $('#summary');
const copyBtn = $('#copySummary');
const dlBtn = $('#downloadSummary');

let extracted = null;
let currentSummary = null;

summarizeBtn.addEventListener('click', ()=>{
  const text = sourceText.value.trim();
  if(!text){ toast('Add some text or load the sample'); return }
  summarizeBtn.disabled = true;
  summarizeBtn.innerHTML = 'Summarizing… <span class="spinning">⏳</span>';

  // Simulate processing
  setTimeout(()=>{
    extracted = extractClauses(text);
    currentSummary = buildSummary(extracted);
    renderSummary(currentSummary);
    renderClauses(extracted);
    addChatAI("Summary ready. Ask me anything about payments, penalties, dates, or parties.");
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = 'Summarize';
    toast('Summary generated');
  }, 700);
});

// Clause extraction heuristics (regex-ish mock)
function extractClauses(text){
  const lines = text.split(/\n+/);
  const money = [...text.matchAll(/₹\s?[\d,]+/g)].map(m=>m[0]);
  const amounts = money.length ? money : [...text.matchAll(/\b(INR|Rs\.?)\s?[\d,]+/gi)].map(m=>m[0]);

  const dates = [...text.matchAll(/\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})\b/g)].map(m=>m[0]);
  const due = (text.match(/(due|payable).*?(on|by|before)\s+(\d{1,2}(st|nd|rd|th)?)/i)||[])[0];
  const rentLine = lines.find(l=>/rent/i.test(l)) || '';
  const penaltyLine = lines.find(l=>/(late fee|penalty|fine)/i.test(l)) || '';
  const depositLine = lines.find(l=>/(security deposit|deposit)/i.test(l)) || '';
  const termLine = lines.find(l=>/(term|tenure|months|duration)/i.test(l)) || '';
  const terminationLine = lines.find(l=>/termination|notice/i.test(l)) || '';

  const parties = [...new Set(
    [...text.matchAll(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)+)\b/g)]
      .map(m=>m[1])
      .filter(n=>!/\b(RENTAL|AGREEMENT|BANK|DELHI|NOTICE|TERM|MONTH)\b/i.test(n))
  )].slice(0,8);

  const payments = [];
  if(rentLine) payments.push(rentLine.trim());
  if(depositLine) payments.push(depositLine.trim());
  if(due) payments.push('Due: ' + due.trim());

  const penalties = [];
  if(penaltyLine) penalties.push(penaltyLine.trim());

  const dateBits = [];
  if(termLine) dateBits.push(termLine.trim());
  if(terminationLine) dateBits.push(terminationLine.trim());
  dates.forEach(d=>dateBits.push('Date: '+d));

  return {amounts, payments, penalties, dates:dateBits, parties};
}

function buildSummary(x){
  const rent = (x.payments.find(p=>/rent/i.test(p))||'').match(/₹\s?[\d,]+/);
  const deposit = (x.payments.find(p=>/deposit/i.test(p))||'').match(/₹\s?[\d,]+/);
  const late = (x.penalties[0]||'').match(/₹\s?[\d,]+/);
  const term = x.dates.find(d=>/term|months|tenure/i.test(d)) || '';
  const people = x.parties.length ? x.parties.join(', ') : 'Parties not clearly found';

  const en = `Plain-language Summary
• Parties: ${people}
• Payments: ${rent?rent[0]:'N/A'} per month; Deposit ${deposit?deposit[0]:'N/A'}
• Penalties: ${late?('Late fee '+late[0]+'/day'):'N/A'}
• Key Dates: ${x.dates.slice(0,3).join(' • ') || 'N/A'}
• What you must do: Pay on time, keep property in good condition, give notice before leaving.
• Risks: Late payment charges, deposit deductions for damage, termination if terms breached.
• Quick actions: Save receipts, set reminders before due date, document any issues.`;

  const hi = `सरल सारांश
• पक्ष: ${people}
• भुगतान: ${rent?rent[0]:'N/A'} प्रति माह; डिपॉज़िट ${deposit?deposit[0]:'N/A'}
• जुर्माना: ${late?('लेट फीस '+late[0]+'/दिन'):'N/A'}
• महत्वपूर्ण तिथियाँ: ${x.dates.slice(0,3).join(' • ') || 'N/A'}
• आपको क्या करना है: समय पर भुगतान, प्रॉपर्टी की देखभाल, छोड़ने से पहले नोटिस दें।
• जोखिम: लेट फीस, डिपॉज़िट कटौती, शर्तें तोड़ने पर टर्मिनेशन।
• त्वरित कदम: भुगतान रसीद रखें, रिमाइंडर सेट करें, किसी समस्या को लिखित में रखें।`;

  return {en, hi};
}

function renderSummary(s){
  const text = (lang === 'EN') ? s.en : s.hi;
  $('#summary').textContent = text;
}

function clearClauses(){
  ['Payment','Penalty','Dates','Parties'].forEach(k=>{
    $('#clause'+k).innerHTML = '';
  });
}

function renderClauses(x){
  clearClauses();
  const make = (arr, id)=> arr.forEach(v=>{
    const li = document.createElement('li'); li.textContent = v; $(id).appendChild(li);
  });
  make(x.payments, '#clausePayment');
  make(x.penalties, '#clausePenalty');
  make(x.dates, '#clauseDates');
  make(x.parties, '#clauseParties');
}

// Copy & Download
$('#copySummary').addEventListener('click', async ()=>{
  const t = $('#summary').innerText.trim();
  if(!t) return;
  await navigator.clipboard.writeText(t);
  toast('Summary copied');
});
$('#downloadSummary').addEventListener('click', ()=>{
  const t = $('#summary').innerText.trim();
  if(!t) return;
  const blob = new Blob([t], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'legalclear-summary.txt';
  a.click();
  URL.revokeObjectURL(a.href);
});

// ===== Chat (mock) =====
const chatLog = $('#chatLog');
const chatInput = $('#chatInput');
const chatSend = $('#chatSend');

function addMsg(text, who='ai'){
  const div = document.createElement('div');
  div.className = `msg ${who==='me'?'me':'ai'}`;
  div.textContent = text;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}
function addChatAI(text){ addMsg(text, 'ai'); }

function answerQuestion(q){
  const t = q.toLowerCase();
  const pick = (list, hint) => {
    const m = list.find(x=>x.toLowerCase().includes(hint));
    return m || list[0] || 'Not found';
  };
  if(!extracted){
    return lang==='EN' ? "Summarize first so I can read the document." : "पहले सारांश बनाइए ताकि मैं डॉक्यूमेंट पढ़ सकूँ।";
  }
  if(t.includes('rent') || t.includes('kiraya') || t.includes('rent?')){
    const rent = extracted.payments.find(p=>/rent/i.test(p)) || 'Not found';
    return lang==='EN' ? `Rent details: ${rent}` : `किराये की जानकारी: ${rent}`;
  }
  if(t.includes('penalty') || t.includes('late') || t.includes('jurmana') || t.includes('लेट')){
    const pen = extracted.penalties[0] || 'Not found';
    return lang==='EN' ? `Penalty clause: ${pen}` : `जुर्माने की धारा: ${pen}`;
  }
  if(t.includes('deposit') || t.includes('security')){
    const dep = extracted.payments.find(p=>/deposit/i.test(p)) || 'Not found';
    return lang==='EN' ? `Security deposit: ${dep}` : `सिक्योरिटी डिपॉज़िट: ${dep}`;
  }
  if(t.includes('date') || t.includes('notice') || t.includes('termination') || t.includes('term')){
    const d = extracted.dates.slice(0,3).join(' • ') || 'Not found';
    return lang==='EN' ? `Key dates/term: ${d}` : `महत्वपूर्ण तिथियाँ/अवधि: ${d}`;
  }
  if(t.includes('parties') || t.includes('party') || t.includes('kone')){
    const p = extracted.parties.join(', ') || 'Not found';
    return lang==='EN' ? `Parties: ${p}` : `पक्ष: ${p}`;
  }
  // fallback
  return lang==='EN'
    ? "I couldn't match that. Try asking about rent, penalty, deposit, dates, or parties."
    : "यह नहीं मिला। किराया, जुर्माना, डिपॉज़िट, तिथियाँ या पक्षों के बारे में पूछें।";
}

chatSend.addEventListener('click', ()=>{
  const q = chatInput.value.trim(); if(!q) return;
  addMsg(q, 'me'); chatInput.value='';
  setTimeout(()=> addChatAI(answerQuestion(q)), 350);
});
chatInput.addEventListener('keydown', (e)=>{
  if(e.key==='Enter'){ chatSend.click(); }
});
$$('.chip.ask').forEach(b=>{
  b.addEventListener('click', ()=>{ chatInput.value = b.textContent; chatSend.click(); });
});

// ===== Keyboard Shortcuts =====
document.addEventListener('keydown', (e)=>{
  if(e.ctrlKey && e.key.toLowerCase()==='b'){ $('#themeBtn').click(); e.preventDefault(); }
  if(e.ctrlKey && e.key.toLowerCase()==='l'){ $('#langBtn').click(); e.preventDefault(); }
  if(e.ctrlKey && e.key.toLowerCase()==='s'){ $('#summarizeBtn').click(); e.preventDefault(); }
});

// Initial AI greeting
addChatAI("Hi! Load or paste your document, click Summarize, then ask me specific questions.");
