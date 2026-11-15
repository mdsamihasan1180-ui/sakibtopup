import { firebaseConfig as C, FB_VER as V } from './firebase-config.js';
const G = 'https://www.gstatic.com/firebasejs/' + V + '/';
const { initializeApp } = await import(G + 'firebase-app.js');
const A = await import(G + 'firebase-auth.js');
const D = await import(G + 'firebase-database.js');
const app = initializeApp(C), auth = A.getAuth(app), db = D.getDatabase(app);
const $ = id => document.getElementById(id), Q = (s, r = document) => r.querySelector(s), QA = (s, r = document) => [...r.querySelectorAll(s)];
const R = p => D.ref(db, p);
const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const r2 = n => Math.round(n * 100) / 100;

const PRODUCTS = [
  { n: 'FF Likes', g: 'pkGrid', i: 'uid', b: 'buyBtn', p: '' },
  { n: 'UID Topup (BD)', g: 'uidPkGrid', i: 'uidInp', b: 'uidBuy', p: 'uid' },
  { n: 'Weekly/Monthly', g: 'wmPkGrid', i: 'wmInp', b: 'wmBuy', p: 'wm' },
  { n: 'Weekly Lite', g: 'wlPkGrid', i: 'wlInp', b: 'wlBuy', p: 'wl' },
  { n: 'Level Up Pass', g: 'luPkGrid', i: 'luInp', b: 'luBuy', p: 'lu' },
  { n: 'Indonesia Server', g: 'inPkGrid', i: 'inInp', b: 'inBuy', p: 'in' }
];
let user = null, prof = null, settings = {}, orders = [], deposits = [], subs = [];

/* ---------- UI helpers ---------- */
const st = document.createElement('style');
st.textContent = `.fx-m{position:fixed;inset:0;z-index:9999;background:rgba(5,15,40,.62);display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(3px)}
.fx-b{background:#fff;width:100%;max-width:460px;max-height:92vh;overflow:auto;border-radius:22px 22px 0 0;padding:20px 18px 26px;font-family:inherit;color:#0f1b3d;animation:fxu .25s ease}
@media(min-width:600px){.fx-m{align-items:center}.fx-b{border-radius:22px}}
@keyframes fxu{from{transform:translateY(40px);opacity:0}}
.fx-b h3{margin:0 0 4px;font-size:20px}.fx-b p.s{margin:0 0 14px;color:#5b6786;font-size:13px}
.fx-b input,.fx-b select{width:100%;box-sizing:border-box;padding:13px 14px;margin:5px 0 9px;border:1.5px solid #d6deef;border-radius:12px;font:inherit;font-size:15px;outline:0;background:#f7f9ff}
.fx-b input:focus,.fx-b select:focus{border-color:#2563eb}
.fx-btn{width:100%;padding:14px;border:0;border-radius:12px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font:inherit;font-weight:700;font-size:15px;cursor:pointer;margin-top:4px}
.fx-btn.g{background:#fff;color:#0f1b3d;border:1.5px solid #d6deef}.fx-btn:disabled{opacity:.6}
.fx-x{float:right;border:0;background:#eef2fb;border-radius:50%;width:32px;height:32px;font-size:18px;cursor:pointer}
.fx-tabs{display:flex;background:#eef2fb;border-radius:12px;padding:4px;margin:10px 0 12px}.fx-tabs button{flex:1;border:0;background:0;padding:10px;border-radius:9px;font:inherit;font-weight:700;color:#5b6786;cursor:pointer}.fx-tabs button.on{background:#fff;color:#2563eb;box-shadow:0 1px 4px #0002}
.fx-pm{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.fx-pm label{border:1.5px solid #d6deef;border-radius:12px;padding:10px 4px;text-align:center;font-weight:700;font-size:13px;cursor:pointer}.fx-pm input{display:none}.fx-pm label.on{border-color:#2563eb;background:#eaf0ff;color:#2563eb}
.fx-no{background:#fff7e0;border:1px dashed #f0b429;border-radius:12px;padding:11px;font-size:13px;margin:6px 0 10px;line-height:1.55}.fx-no b{font-size:17px;letter-spacing:.5px;user-select:all}
.fx-l{text-align:center;font-size:13px;margin-top:10px;color:#2563eb;cursor:pointer}.fx-er{color:#d92d20;font-size:13px;min-height:18px}`;
document.head.appendChild(st);
function toast(m) { const t = $('toast'); if (!t) return alert(m); t.textContent = m; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
function modal(html) {
  closeM(); const m = document.createElement('div'); m.className = 'fx-m'; m.id = 'fxM';
  m.innerHTML = '<div class="fx-b"><button class="fx-x" type="button">×</button>' + html + '</div>';
  m.addEventListener('click', e => { if (e.target === m || e.target.classList.contains('fx-x')) closeM(); });
  document.body.appendChild(m); return m;
}
function closeM() { const m = $('fxM'); if (m) m.remove(); }
const fdate = ts => { if (!ts) return ''; const d = new Date(ts), p = n => String(n).padStart(2, '0'); let h = d.getHours(); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return p(d.getDate()) + '-' + p(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + p(h) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' ' + ap; };
const errBn = c => ({ 'auth/invalid-credential': 'ইমেইল বা পাসওয়ার্ড ভুল', 'auth/wrong-password': 'পাসওয়ার্ড ভুল', 'auth/user-not-found': 'এই ইমেইলে অ্যাকাউন্ট নেই', 'auth/email-already-in-use': 'এই ইমেইল আগে থেকেই ব্যবহৃত', 'auth/weak-password': 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের দিন', 'auth/invalid-email': 'ইমেইল ঠিক নেই', 'auth/too-many-requests': 'অনেকবার চেষ্টা হয়েছে, পরে আবার করুন', 'auth/popup-closed-by-user': 'লগইন বাতিল হয়েছে', 'PERMISSION_DENIED': 'অনুমতি নেই, আবার লগইন করুন' }[c] || 'সমস্যা হয়েছে, আবার চেষ্টা করুন');

/* ---------- Auth ---------- */
function authModal(tab) {
  let mode = tab || 'login';
  const m = modal(`<h3 id="fxT"></h3><p class="s" id="fxS"></p>
  <div class="fx-tabs"><button type="button" data-m="login">Login</button><button type="button" data-m="reg">Register</button></div>
  <div id="fxN"><input id="fxName" placeholder="আপনার নাম" autocomplete="name"></div>
  <input id="fxEm" type="email" placeholder="ইমেইল" autocomplete="email"><input id="fxPw" type="password" placeholder="পাসওয়ার্ড" autocomplete="current-password">
  <div class="fx-er" id="fxE"></div><button class="fx-btn" id="fxGo" type="button"></button>
  <button class="fx-btn g" id="fxGg" type="button" style="margin-top:9px">Google দিয়ে চালিয়ে যান</button><div class="fx-l" id="fxF">পাসওয়ার্ড ভুলে গেছেন?</div>`);
  const set = () => {
    $('fxT').textContent = mode === 'login' ? 'স্বাগতম ফিরে আসায়' : 'নতুন অ্যাকাউন্ট খুলুন';
    $('fxS').textContent = 'অর্ডার ও ওয়ালেট ব্যবহার করতে লগইন করুন';
    $('fxN').style.display = mode === 'reg' ? 'block' : 'none'; $('fxGo').textContent = mode === 'login' ? 'Login' : 'Register';
    QA('.fx-tabs button', m).forEach(b => b.classList.toggle('on', b.dataset.m === mode)); $('fxE').textContent = '';
  };
  QA('.fx-tabs button', m).forEach(b => b.onclick = () => { mode = b.dataset.m; set(); }); set();
  const run = async fn => { const b = $('fxGo'); b.disabled = true; try { await fn(); closeM(); } catch (e) { $('fxE').textContent = errBn(e.code); } b.disabled = false; };
  $('fxGo').onclick = () => run(async () => {
    const em = $('fxEm').value.trim(), pw = $('fxPw').value;
    if (!em || !pw) throw { code: 'auth/invalid-email' };
    if (mode === 'login') await A.signInWithEmailAndPassword(auth, em, pw);
    else { const nm = $('fxName').value.trim() || em.split('@')[0]; const c = await A.createUserWithEmailAndPassword(auth, em, pw); await A.updateProfile(c.user, { displayName: nm }); await ensureProfile(c.user, nm); }
  });
  $('fxGg').onclick = () => run(async () => { const c = await A.signInWithPopup(auth, new A.GoogleAuthProvider()); await ensureProfile(c.user); });
  $('fxF').onclick = async () => { const em = $('fxEm').value.trim(); if (!em) { $('fxE').textContent = 'আগে ইমেইল লিখুন'; return; } try { await A.sendPasswordResetEmail(auth, em); $('fxE').style.color = '#12803c'; $('fxE').textContent = 'রিসেট লিংক ইমেইলে পাঠানো হয়েছে'; } catch (e) { $('fxE').textContent = errBn(e.code); } };
}
async function ensureProfile(u, name) {
  const s = await D.get(R('users/' + u.uid));
  if (!s.exists()) await D.set(R('users/' + u.uid), { name: name || u.displayName || (u.email || '').split('@')[0], email: u.email || '', balance: 0, banned: false, pin: String(Math.floor(100000 + Math.random() * 900000)), createdAt: Date.now() });
}

/* ---------- Add money ---------- */
function addMoney() {
  if (!user) return authModal();
  const P = settings.payment || {}, min = +P.min || 10;
  const M = [['bKash', P.bkash], ['Nagad', P.nagad], ['Rocket', P.rocket]].filter(x => x[1]);
  if (!M.length) return toast('এখন অ্যাড মানি বন্ধ আছে, সাপোর্টে যোগাযোগ করুন');
  const m = modal(`<h3>Add Money</h3><p class="s">নিচের নম্বরে Send Money করে তথ্য দিন। যাচাইয়ের পর ব্যালেন্স যোগ হবে।</p>
  <img src="andmoney.jpg" alt="" style="width:100%;border-radius:12px;margin-bottom:6px">
  <div class="fx-pm">${M.map((x, i) => `<label class="${i ? '' : 'on'}"><input type="radio" name="fxpm" value="${x[0]}" ${i ? '' : 'checked'}>${x[0]}</label>`).join('')}</div>
  <div class="fx-no" id="fxNo"></div>
  <input id="fxAm" type="number" inputmode="numeric" placeholder="টাকার পরিমাণ (সর্বনিম্ন ${min}৳)"><input id="fxSn" inputmode="numeric" placeholder="যে নম্বর থেকে পাঠিয়েছেন"><input id="fxTx" placeholder="Transaction ID (TrxID)" style="text-transform:uppercase">
  <div class="fx-er" id="fxE"></div><button class="fx-btn" id="fxGo" type="button">সাবমিট করুন</button>`);
  const note = () => { const v = Q('input[name=fxpm]:checked', m).value, n = M.find(x => x[0] === v)[1]; QA('.fx-pm label', m).forEach(l => l.classList.toggle('on', l.firstChild.checked)); $('fxNo').innerHTML = v + ' Personal নম্বর: <b>' + esc(n) + '</b> <a href="#" id="fxCp">কপি</a>' + (P.note ? '<br>' + esc(P.note) : ''); $('fxCp').onclick = e => { e.preventDefault(); navigator.clipboard && navigator.clipboard.writeText(n); toast('নম্বর কপি হয়েছে'); }; };
  QA('input[name=fxpm]', m).forEach(r => r.onchange = note); note();
  $('fxGo').onclick = async () => {
    const amt = +$('fxAm').value, sn = $('fxSn').value.trim(), tx = $('fxTx').value.trim().toUpperCase();
    if (!(amt >= min)) return $('fxE').textContent = 'সর্বনিম্ন ' + min + '৳ অ্যাড করতে হবে';
    if (sn.length < 10 || tx.length < 6) return $('fxE').textContent = 'নম্বর ও TrxID সঠিক দিন';
    if (deposits.some(d => d.trx === tx)) return $('fxE').textContent = 'এই TrxID আগেই জমা দেওয়া হয়েছে';
    $('fxGo').disabled = true;
    try {
      await D.set(D.push(R('deposits')), { uid: user.uid, userName: prof ? prof.name : '', method: Q('input[name=fxpm]:checked', m).value, amount: amt, sender: sn, trx: tx, status: 'Pending', createdAt: Date.now() });
      closeM(); toast('রিকোয়েস্ট জমা হয়েছে, কিছুক্ষণের মধ্যে ব্যালেন্স যোগ হবে'); location.hash = 'my-transaction';
    } catch (e) { $('fxE').textContent = errBn(e.code); $('fxGo').disabled = false; }
  };
}

/* ---------- Buy ---------- */
async function buy(P) {
  if (!user || !prof) return authModal();
  if (settings.maintenance) return toast(settings.maintenanceText || 'ওয়েবসাইট এখন মেইনটেন্যান্সে আছে');
  if (prof.banned) return toast('আপনার অ্যাকাউন্ট ব্লক করা হয়েছে');
  const on = Q('#' + P.g + ' .pk.on'); if (!on) return toast('আগে একটি রিচার্জ প্যাকেজ সিলেক্ট করুন');
  const inp = $(P.i), pid = inp ? inp.value.trim() : '';
  if (pid.length < 6) { toast('সঠিক প্লেয়ার আইডি দিন'); inp && inp.focus(); return; }
  const price = +on.dataset.price, name = on.dataset.name, bal = +prof.balance || 0;
  if (bal < price) { toast('ওয়ালেটে ব্যালেন্স কম, আগে টাকা অ্যাড করুন'); return addMoney(); }
  if (!confirm(P.n + ' - ' + name + '\nPlayer ID: ' + pid + '\nমূল্য: ' + price + '৳\n\nঅর্ডার কনফার্ম করবেন?')) return;
  const btn = $(P.b); btn.style.pointerEvents = 'none';
  const key = D.push(R('orders')).key, now = Date.now();
  try {
    await D.update(R(''), {
      ['users/' + user.uid + '/balance']: r2(bal - price),
      ['orders/' + key]: { no: String(now).slice(-8), uid: user.uid, userName: prof.name, email: prof.email, product: P.n, package: name, price, playerId: pid, status: 'Pending', createdAt: now, updatedAt: now }
    });
    toast('অর্ডার সফল হয়েছে ✅'); location.hash = 'my-orders';
  } catch (e) { toast('অর্ডার হয়নি: ' + errBn(e.code)); }
  btn.style.pointerEvents = '';
}

/* ---------- Sync UI ---------- */
function syncUI() {
  const bal = prof ? (+prof.balance || 0) : 0, nm = prof ? prof.name : 'Guest';
  const w = Q('.hr .wallet'); if (w) w.lastChild.nodeValue = r2(bal) + '৳';
  const T = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  T('accName', 'Hi, ' + nm); T('accMail', user ? user.email || '' : 'লগইন করে অর্ডার করুন'); T('acName', nm); T('acMail', user ? user.email || '' : 'লগইন করে অর্ডার করুন');
  T('acBal', r2(bal)); T('acOrders', orders.length); T('acCodes', 0); T('acLoTx', user ? 'Logout' : 'Login');
  const lo = Q('#accLo span'); if (lo) lo.textContent = user ? 'Logout' : 'Login';
  if ($('acVf')) $('acVf').style.display = user ? '' : 'none';
  if ($('acPinBox')) { $('acPinBox').style.display = user && prof ? '' : 'none'; T('acPin', prof ? prof.pin || '' : ''); }
  if ($('accAv') && user && user.photoURL) $('accAv').innerHTML = '<img src="' + esc(user.photoURL) + '" style="width:100%;height:100%;border-radius:50%;object-fit:cover">';
  PRODUCTS.forEach(P => {
    T(P.p + 'Bal', r2(bal).toFixed(2)); const row = $(P.p + 'BalRow'), wr = $(P.p + 'LoginWarn'), b = $(P.b);
    if (P.p === '') return void (b && (b.textContent = user ? 'Buy Now' : 'Login'));
    if (row) row.style.display = user ? 'flex' : 'none'; if (wr) wr.style.display = user ? 'none' : 'flex'; if (b) b.textContent = user ? 'Buy Now' : 'Login';
  });
  if (window.renderOrders) window.renderOrders(orders.map(o => ({ id: o.no, status: o.status, date: fdate(o.createdAt), updated: fdate(o.updatedAt), package: o.package, price: o.price, playerId: o.playerId })));
  if (window.renderTransactions) window.renderTransactions(deposits.map(d => ({ number: d.method + ' • ' + (d.trx || d.sender), amount: d.amount, status: d.status })));
}
function applySettings() {
  if (settings.notice) { const p = $('popText'); if (p) p.innerHTML = esc(settings.notice).split(/\r?\n/).join('<br>'); }
  let bar = $('fxMt'); if (settings.maintenance) { if (!bar) { bar = document.createElement('div'); bar.id = 'fxMt'; bar.style.cssText = 'background:#b42318;color:#fff;text-align:center;padding:8px;font-size:13px;font-weight:700'; document.body.prepend(bar); } bar.textContent = settings.maintenanceText || 'অর্ডার সাময়িকভাবে বন্ধ আছে'; } else if (bar) bar.remove();
}

/* ---------- Events (capture, runs before the original handlers) ---------- */
document.addEventListener('click', e => {
  const t = e.target, hit = s => t.closest && t.closest(s);
  const stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
  for (const P of PRODUCTS) if (hit('#' + P.b)) { stop(); return void buy(P); }
  if (hit('[id$="LoginWarn"] a,[id$="LoginWarn"] button')) { stop(); return authModal(); }
  if (hit('.nav a.add,[data-go="addmoney"],#acAdd,.hr .wallet')) { stop(); const pn = $('accPanel'); if (pn) { pn.classList.remove('show'); document.body.style.overflow = ''; } return addMoney(); }
  if (hit('#accLo,#acLogout')) { stop(); return user ? A.signOut(auth).then(() => { toast('লগআউট হয়েছে'); location.hash = ''; }) : authModal(); }
  if (hit('#acRf,[id$="Rf"]')) setTimeout(syncUI, 30);
}, true);
// লগইন ছাড়া অর্ডার/ট্রানজেকশন/অ্যাকাউন্ট পেজে গেলে লগইন চাইবে
const gated = ['my-orders', 'my-transaction', 'account', 'my-codes'];
addEventListener('hashchange', () => { if (!user && gated.includes(location.hash.slice(1))) setTimeout(() => authModal(), 150); });

/* ---------- Data ---------- */
D.onValue(R('settings'), s => { settings = s.val() || {}; applySettings(); });
A.onAuthStateChanged(auth, u => {
  subs.forEach(f => f()); subs = []; user = u; prof = null; orders = []; deposits = [];
  if (u) {
    ensureProfile(u).catch(() => { });
    subs.push(D.onValue(R('users/' + u.uid), s => { prof = s.val(); syncUI(); }));
    subs.push(D.onValue(D.query(R('orders'), D.orderByChild('uid'), D.equalTo(u.uid)), s => { orders = []; s.forEach(c => { orders.push({ id: c.key, ...c.val() }); }); orders.sort((a, b) => b.createdAt - a.createdAt); syncUI(); }));
    subs.push(D.onValue(D.query(R('deposits'), D.orderByChild('uid'), D.equalTo(u.uid)), s => { deposits = []; s.forEach(c => { deposits.push({ id: c.key, ...c.val() }); }); deposits.sort((a, b) => b.createdAt - a.createdAt); syncUI(); }));
  }
  syncUI();
});
window.FFX = { addMoney, authModal };
