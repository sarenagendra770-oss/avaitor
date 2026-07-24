document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('transactionList');
  if (!list) return;

  function getAdminTransactions() {
    try {
      return JSON.parse(localStorage.getItem('aeroXAdminTransactions') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveAdminTransactions(transactions) {
    localStorage.setItem('aeroXAdminTransactions', JSON.stringify(transactions));
  }

  function getUserBalance(userId) {
    const balanceKey = `aeroXUser_${userId}_walletBalance`;
    return Number(localStorage.getItem(balanceKey) || 12480);
  }

  function setUserBalance(userId, value) {
    const balanceKey = `aeroXUser_${userId}_walletBalance`;
    localStorage.setItem(balanceKey, value.toString());
    window.dispatchEvent(new CustomEvent('wallet:updated', { detail: value }));
  }

  function render() {
    const requests = getAdminTransactions().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (!requests.length) {
      list.innerHTML = '<p>No transactions yet.</p>';
      return;
    }

    list.innerHTML = requests.map((request) => {
      const isWithdrawal = request.type === 'withdrawal';
      const label = isWithdrawal ? `Withdrawal to ${request.bankName}` : `${request.method || 'Deposit'} payment`;
      return `
        <div class="transaction-item">
          <div class="transaction-meta">
            <strong>${request.username}</strong>
            <span>Type: ${isWithdrawal ? 'Withdrawal' : 'Deposit'} • Amount: ${formatCurrency(request.amount)} • ${label}</span>
            <span>Date: ${request.createdAt} • Ref: ${request.referenceCode || request.utr || '—'}</span>
            <span>Status: ${request.status}</span>
          </div>
          ${request.status === 'pending' ? `
            <div class="transaction-actions">
              <button class="approve" data-id="${request.id}" data-action="approve" data-type="${isWithdrawal ? 'withdrawal' : 'deposit'}">Approve</button>
              <button class="reject" data-id="${request.id}" data-action="reject" data-type="${isWithdrawal ? 'withdrawal' : 'deposit'}">Reject</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-id]');
    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    const type = button.dataset.type;
    const transactions = getAdminTransactions();
    const request = transactions.find((item) => item.id === id);

    if (!request) return;

    if (action === 'approve') {
      request.status = 'approved';
      if (type === 'deposit') {
        setUserBalance(request.userId, getUserBalance(request.userId) + request.amount);
      } else if (type === 'withdrawal') {
        setUserBalance(request.userId, Math.max(0, getUserBalance(request.userId) - request.amount));
      }
    } else if (action === 'reject') {
      request.status = 'rejected';
    }

    saveAdminTransactions(transactions);
    render();
  });

  render();
});
