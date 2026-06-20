'use strict';

// ── Dummy data ──────────────────────────────────────────────────────────────
const DUMMY_EXPENSES = [
  { id: 1,  date: '2026-06-02', submitDate: '2026-06-03', category: '交通費',  payee: 'JR東日本',        amount: 3200,  memo: '大阪出張 往復',              status: 'approved',         submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 2,  date: '2026-06-05', submitDate: '2026-06-05', category: '会議費',  payee: 'スターバックス',   amount: 2400,  memo: '取引先との打ち合わせ費用',    status: 'approved',         submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 3,  date: '2026-06-08', submitDate: '2026-06-09', category: '宿泊費',  payee: 'ホテルグランヴィア', amount: 12000, memo: '大阪出張 1泊',               status: 'manager_approved', submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: null },
  { id: 4,  date: '2026-06-10', submitDate: '2026-06-10', category: '接待費',  payee: '銀座 ○○',         amount: 28000, memo: 'A社接待 3名',                status: 'pending',          submitter: '佐藤 花子', approvedBy: null, financeBy: null },
  { id: 5,  date: '2026-06-11', submitDate: '2026-06-11', category: '交通費',  payee: '東京メトロ',       amount: 540,   memo: '訪問営業 往復',              status: 'pending',          submitter: '田中 太郎', approvedBy: null, financeBy: null },
  { id: 6,  date: '2026-06-13', submitDate: '2026-06-13', category: '消耗品費', payee: 'Amazon',          amount: 4800,  memo: 'オフィス用コピー用紙',       status: 'pending',          submitter: '鈴木 次郎', approvedBy: null, financeBy: null },
  { id: 7,  date: '2026-06-14', submitDate: '2026-06-14', category: '通信費',  payee: 'ソフトバンク',     amount: 6600,  memo: '6月分 携帯電話費用',         status: 'rejected',         submitter: '田中 太郎', approvedBy: null, financeBy: null, rejectReason: '領収書の添付が必要です' },
  { id: 8,  date: '2026-06-16', submitDate: '2026-06-17', category: '交通費',  payee: '東海道新幹線',     amount: 13640, memo: '名古屋出張 往復',            status: 'pending',          submitter: '佐藤 花子', approvedBy: null, financeBy: null },
  { id: 9,  date: '2026-06-18', submitDate: '2026-06-18', category: '会議費',  payee: '椿屋珈琲',         amount: 1800,  memo: '社内勉強会 お茶代',          status: 'approved',         submitter: '鈴木 次郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 10, date: '2026-06-20', submitDate: '2026-06-20', category: 'その他',  payee: '〇〇書店',         amount: 3200,  memo: 'PM研修テキスト',            status: 'pending',          submitter: '田中 太郎', approvedBy: null, financeBy: null },
  // past months for trend chart
  { id: 11, date: '2026-05-10', submitDate: '2026-05-11', category: '交通費',  payee: 'JR東日本',        amount: 5600,  memo: '福岡出張',                  status: 'approved',         submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 12, date: '2026-05-18', submitDate: '2026-05-19', category: '接待費',  payee: '六本木 △△',       amount: 35000, memo: 'B社接待',                   status: 'approved',         submitter: '佐藤 花子', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 13, date: '2026-04-05', submitDate: '2026-04-06', category: '宿泊費',  payee: 'ホテルニッコー',   amount: 18000, memo: '京都出張',                  status: 'approved',         submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 14, date: '2026-04-22', submitDate: '2026-04-22', category: '消耗品費', payee: 'ヨドバシカメラ',   amount: 9800,  memo: 'Webカメラ購入',             status: 'approved',         submitter: '鈴木 次郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 15, date: '2026-03-15', submitDate: '2026-03-16', category: '会議費',  payee: '会議室レンタル',   amount: 22000, memo: '四半期レビュー会場費',      status: 'approved',         submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 16, date: '2026-02-08', submitDate: '2026-02-09', category: '交通費',  payee: '東海道新幹線',     amount: 27000, memo: '大阪・名古屋 出張',         status: 'approved',         submitter: '佐藤 花子', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
  { id: 17, date: '2026-01-20', submitDate: '2026-01-21', category: '接待費',  payee: '丸の内 ◇◇',       amount: 42000, memo: 'C社新年会接待',             status: 'approved',         submitter: '田中 太郎', approvedBy: '山田 部長', financeBy: '鈴木 経理' },
];

let expenses = JSON.parse(localStorage.getItem('expenses') || 'null') || DUMMY_EXPENSES;
let nextId = Math.max(...expenses.map(e => e.id)) + 1;

function save() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// ── State ────────────────────────────────────────────────────────────────────
let currentView = 'dashboard';
let currentMonth = new Date(2026, 5, 1); // June 2026
let approvalRole = 'manager';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = n => '¥' + n.toLocaleString('ja-JP');

const STATUS_LABEL = {
  pending:          '承認待ち',
  manager_approved: '上長承認済み',
  approved:         '承認完了',
  rejected:         '差し戻し',
};

function statusBadge(s) {
  return `<span class="status-badge status-${s}">${STATUS_LABEL[s] || s}</span>`;
}

function formatDate(d) {
  if (!d) return '—';
  const [y,m,day] = d.split('-');
  return `${y}/${m}/${day}`;
}

// ── Navigation ───────────────────────────────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    switchView(view);
  });
});

function switchView(view) {
  currentView = view;
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
  renderView(view);
}

function renderView(view) {
  if (view === 'dashboard') renderDashboard();
  if (view === 'approval')  renderApproval();
  if (view === 'history')   renderHistory();
  updateBadge();
}

// ── Dashboard ────────────────────────────────────────────────────────────────
let categoryChart, trendChart;

function renderDashboard() {
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  const monthExpenses = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === y && d.getMonth() === m;
  });

  // Stats
  const total    = monthExpenses.reduce((s, e) => s + e.amount, 0);
  const approved = monthExpenses.filter(e => e.status === 'approved');
  const pending  = monthExpenses.filter(e => e.status === 'pending' || e.status === 'manager_approved');
  const rejected = monthExpenses.filter(e => e.status === 'rejected');

  document.getElementById('statTotal').textContent = fmt(total);
  document.getElementById('statCount').textContent = `${monthExpenses.length}件`;
  document.getElementById('statApproved').textContent = fmt(approved.reduce((s,e)=>s+e.amount,0));
  document.getElementById('statApprovedCount').textContent = `${approved.length}件`;
  document.getElementById('statPending').textContent = fmt(pending.reduce((s,e)=>s+e.amount,0));
  document.getElementById('statPendingCount').textContent = `${pending.length}件`;
  document.getElementById('statRejected').textContent = fmt(rejected.reduce((s,e)=>s+e.amount,0));
  document.getElementById('statRejectedCount').textContent = `${rejected.length}件`;

  // Category chart
  const cats = {};
  monthExpenses.forEach(e => { cats[e.category] = (cats[e.category]||0) + e.amount; });
  const catLabels = Object.keys(cats);
  const catData   = Object.values(cats);
  const COLORS = ['#4F46E5','#7C3AED','#0284C7','#059669','#D97706','#DC2626','#6B7280'];

  if (categoryChart) categoryChart.destroy();
  categoryChart = new Chart(document.getElementById('categoryChart'), {
    type: 'doughnut',
    data: {
      labels: catLabels,
      datasets: [{ data: catData, backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
    },
    options: {
      plugins: {
        legend: { position: 'right', labels: { font: { size: 12 }, padding: 12 } },
        tooltip: { callbacks: { label: ctx => ` ${fmt(ctx.raw)}` } },
      },
      cutout: '62%',
    },
  });

  // Trend chart (past 6 months)
  const trendMonths = [];
  const trendData   = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(y, m - i, 1);
    const label = `${d.getMonth()+1}月`;
    trendMonths.push(label);
    const sum = expenses.filter(e => {
      const ed = new Date(e.date);
      return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth();
    }).reduce((s,e)=>s+e.amount, 0);
    trendData.push(sum);
  }

  if (trendChart) trendChart.destroy();
  trendChart = new Chart(document.getElementById('trendChart'), {
    type: 'bar',
    data: {
      labels: trendMonths,
      datasets: [{
        label: '経費合計（円）',
        data: trendData,
        backgroundColor: 'rgba(79,70,229,.15)',
        borderColor: '#4F46E5',
        borderWidth: 2,
        borderRadius: 6,
      }],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => '¥' + v.toLocaleString() }, grid: { color: '#F3F4F6' } },
        x: { grid: { display: false } },
      },
    },
  });

  // Recent table (top 5 in current month)
  const recent = [...monthExpenses].sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
  const tbody = document.getElementById('recentTableBody');
  tbody.innerHTML = recent.length ? recent.map(e => `
    <tr style="cursor:pointer" onclick="openDetail(${e.id})">
      <td>${formatDate(e.date)}</td>
      <td>${e.memo}</td>
      <td><span style="font-size:12px;background:var(--gray-100);padding:2px 8px;border-radius:4px">${e.category}</span></td>
      <td class="amount">${fmt(e.amount)}</td>
      <td>${statusBadge(e.status)}</td>
    </tr>
  `).join('') : '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--gray-400)">この月の申請はありません</td></tr>';
}

// Month nav
document.getElementById('prevMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  updateMonthLabel();
  renderDashboard();
});
document.getElementById('nextMonth').addEventListener('click', () => {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
  updateMonthLabel();
  renderDashboard();
});

function updateMonthLabel() {
  document.getElementById('currentMonthLabel').textContent =
    `${currentMonth.getFullYear()}年 ${currentMonth.getMonth()+1}月`;
}

// ── Submit Form ───────────────────────────────────────────────────────────────
document.getElementById('expDate').valueAsDate = new Date();

document.getElementById('expenseForm').addEventListener('submit', e => {
  e.preventDefault();
  submitExpense(false);
});
document.getElementById('saveDraft').addEventListener('click', () => {
  // just show info, not implementing draft persistence
  showToast('下書きを保存しました', 'success');
});

function submitExpense(isDraft) {
  const expense = {
    id: nextId++,
    date:        document.getElementById('expDate').value,
    submitDate:  new Date().toISOString().slice(0,10),
    category:    document.getElementById('expCategory').value,
    amount:      parseInt(document.getElementById('expAmount').value, 10),
    payee:       document.getElementById('expPayee').value || '—',
    memo:        document.getElementById('expMemo').value,
    status:      'pending',
    submitter:   '田中 太郎',
    approvedBy:  null,
    financeBy:   null,
  };
  expenses.unshift(expense);
  save();
  document.getElementById('expenseForm').reset();
  document.getElementById('expDate').valueAsDate = new Date();
  document.getElementById('filePreview').classList.add('hidden');
  showToast('経費申請を提出しました ✓', 'success');
  updateBadge();
}

// File drop
const fileDrop = document.getElementById('fileDrop');
const fileInput = document.getElementById('expFile');
const filePreview = document.getElementById('filePreview');

fileInput.addEventListener('change', () => {
  const f = fileInput.files[0];
  if (f) {
    filePreview.classList.remove('hidden');
    filePreview.innerHTML = `✓ ${f.name} (${(f.size/1024).toFixed(0)} KB)`;
  }
});

// ── Approval ─────────────────────────────────────────────────────────────────
document.getElementById('approvalRole').addEventListener('change', e => {
  approvalRole = e.target.value;
  renderApproval();
});

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === tab));
  });
});

function renderApproval() {
  let pendingItems, doneItems;
  if (approvalRole === 'manager') {
    pendingItems = expenses.filter(e => e.status === 'pending');
    doneItems    = expenses.filter(e => ['manager_approved','approved','rejected'].includes(e.status));
  } else {
    pendingItems = expenses.filter(e => e.status === 'manager_approved');
    doneItems    = expenses.filter(e => e.status === 'approved');
  }

  document.getElementById('approvalList').innerHTML = renderApprovalCards(pendingItems, true);
  document.getElementById('doneList').innerHTML     = renderApprovalCards(doneItems, false);
}

function renderApprovalCards(list, showActions) {
  if (!list.length) return `
    <div class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/></svg>
      <p>処理待ちの申請はありません</p>
    </div>`;
  return list.map(e => `
    <div class="approval-card">
      <div class="approval-card-info">
        <div class="approval-card-title">${e.memo}</div>
        <div class="approval-card-meta">
          <span>📅 ${formatDate(e.date)}</span>
          <span>🏷 ${e.category}</span>
          <span>🏪 ${e.payee}</span>
          <span>👤 ${e.submitter}</span>
          <span>提出日: ${formatDate(e.submitDate)}</span>
        </div>
        ${e.rejectReason ? `<div style="color:var(--danger);font-size:12px;margin-top:6px">差し戻し理由: ${e.rejectReason}</div>` : ''}
      </div>
      <div style="text-align:right">
        <div class="approval-card-amount">${fmt(e.amount)}</div>
        <div style="margin-top:4px">${statusBadge(e.status)}</div>
      </div>
      ${showActions ? `
      <div class="approval-card-body">
        <div class="approval-actions">
          <button class="btn-success" onclick="approveExpense(${e.id})">承認</button>
          <button class="btn-danger"  onclick="openRejectModal(${e.id})">差し戻し</button>
          <button class="btn-sm"      onclick="openDetail(${e.id})">詳細</button>
        </div>
      </div>` : `
      <div class="approval-card-body">
        <button class="btn-sm" onclick="openDetail(${e.id})">詳細を見る</button>
      </div>`}
    </div>
  `).join('');
}

function approveExpense(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  if (approvalRole === 'manager') {
    e.status = 'manager_approved';
    e.approvedBy = '山田 部長';
    showToast('上長承認しました', 'success');
  } else {
    e.status = 'approved';
    e.financeBy = '鈴木 経理';
    showToast('経理確認完了しました', 'success');
  }
  save();
  renderApproval();
  updateBadge();
}

function openRejectModal(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  document.getElementById('modalTitle').textContent = '差し戻し';
  document.getElementById('modalContent').innerHTML = `
    <p style="margin-bottom:14px;color:var(--gray-600)">差し戻し理由を入力してください。</p>
    <p style="font-weight:600;margin-bottom:8px">${e.memo} — ${fmt(e.amount)}</p>
    <textarea id="rejectReason" rows="3" placeholder="理由を入力..." style="width:100%;margin-bottom:16px"></textarea>
    <div style="display:flex;gap:10px;justify-content:flex-end">
      <button class="btn-secondary" onclick="closeModal()">キャンセル</button>
      <button class="btn-danger" onclick="rejectExpense(${id})">差し戻す</button>
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

function rejectExpense(id) {
  const e = expenses.find(x => x.id === id);
  const reason = document.getElementById('rejectReason').value.trim() || '要確認';
  if (e) {
    e.status = 'rejected';
    e.rejectReason = reason;
    save();
  }
  closeModal();
  renderApproval();
  updateBadge();
  showToast('差し戻しました', 'error');
}

// ── History ───────────────────────────────────────────────────────────────────
document.getElementById('filterStatus').addEventListener('change', renderHistory);
document.getElementById('filterCategory').addEventListener('change', renderHistory);

function renderHistory() {
  const statusFilter   = document.getElementById('filterStatus').value;
  const categoryFilter = document.getElementById('filterCategory').value;
  let filtered = expenses.filter(e => e.submitter === '田中 太郎');
  if (statusFilter   !== 'all') filtered = filtered.filter(e => e.status   === statusFilter);
  if (categoryFilter !== 'all') filtered = filtered.filter(e => e.category === categoryFilter);
  filtered.sort((a,b) => b.submitDate.localeCompare(a.submitDate));

  document.getElementById('historyTableBody').innerHTML = filtered.length
    ? filtered.map(e => `
      <tr>
        <td>${formatDate(e.submitDate)}</td>
        <td>${formatDate(e.date)}</td>
        <td><span style="font-size:12px;background:var(--gray-100);padding:2px 8px;border-radius:4px">${e.category}</span></td>
        <td>${e.payee}</td>
        <td class="amount">${fmt(e.amount)}</td>
        <td>${statusBadge(e.status)}</td>
        <td><button class="btn-sm" onclick="openDetail(${e.id})">詳細</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--gray-400)">該当する申請はありません</td></tr>';
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function openDetail(id) {
  const e = expenses.find(x => x.id === id);
  if (!e) return;
  document.getElementById('modalTitle').textContent = '申請詳細';

  const flow = [
    { label: '申請', done: true, who: e.submitter, date: e.submitDate },
    { label: '上長承認', done: ['manager_approved','approved'].includes(e.status), who: e.approvedBy, date: null },
    { label: '経理確認', done: e.status === 'approved', who: e.financeBy, date: null },
  ];

  document.getElementById('modalContent').innerHTML = `
    <div class="detail-row"><span class="detail-label">申請日</span><span class="detail-value">${formatDate(e.submitDate)}</span></div>
    <div class="detail-row"><span class="detail-label">使用日</span><span class="detail-value">${formatDate(e.date)}</span></div>
    <div class="detail-row"><span class="detail-label">カテゴリ</span><span class="detail-value">${e.category}</span></div>
    <div class="detail-row"><span class="detail-label">支払先</span><span class="detail-value">${e.payee}</span></div>
    <div class="detail-row"><span class="detail-label">金額</span><span class="detail-value" style="font-size:20px;font-weight:700">${fmt(e.amount)}</span></div>
    <div class="detail-row"><span class="detail-label">メモ</span><span class="detail-value">${e.memo}</span></div>
    <div class="detail-row"><span class="detail-label">申請者</span><span class="detail-value">${e.submitter}</span></div>
    <div class="detail-row"><span class="detail-label">ステータス</span><span class="detail-value">${statusBadge(e.status)}</span></div>
    ${e.rejectReason ? `<div class="detail-row"><span class="detail-label">差し戻し理由</span><span class="detail-value" style="color:var(--danger)">${e.rejectReason}</span></div>` : ''}
    <div style="margin-top:20px">
      <div style="font-size:13px;font-weight:600;color:var(--gray-700);margin-bottom:12px">承認フロー</div>
      <div style="display:flex;gap:0;align-items:center">
        ${flow.map((f,i) => `
          <div style="flex:1;text-align:center">
            <div style="width:36px;height:36px;border-radius:50%;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:16px;
              background:${f.done ? (e.status==='rejected'&&i>0?'var(--danger-light)':'var(--success-light)') : 'var(--gray-100)'};
              color:${f.done ? (e.status==='rejected'&&i>0?'var(--danger)':'var(--success)') : 'var(--gray-400)'}">
              ${f.done ? (e.status==='rejected'&&i>0?'✕':'✓') : '○'}
            </div>
            <div style="font-size:11px;font-weight:600;color:var(--gray-700)">${f.label}</div>
            <div style="font-size:11px;color:var(--gray-400)">${f.who || '—'}</div>
          </div>
          ${i < flow.length-1 ? `<div style="flex:0 0 40px;height:2px;background:${flow[i+1].done?'var(--success)':'var(--gray-200)'}"></div>` : ''}
        `).join('')}
      </div>
    </div>
    <div style="text-align:right;margin-top:20px">
      <button class="btn-secondary" onclick="closeModal()">閉じる</button>
    </div>
  `;
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ── Badge ─────────────────────────────────────────────────────────────────────
function updateBadge() {
  const n = expenses.filter(e => e.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  badge.textContent = n;
  badge.classList.toggle('visible', n > 0);
}

// ── Toast ─────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
updateMonthLabel();
renderDashboard();
updateBadge();
