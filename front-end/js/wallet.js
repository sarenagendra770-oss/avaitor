document.addEventListener('DOMContentLoaded', () => {
  const balance = document.querySelector('.balance');
  const depositForm = document.getElementById('depositForm');
  const customAmountInput = document.getElementById('customAmount');
  const paymentMethodSelect = document.getElementById('paymentMethod');
  const utrInput = document.getElementById('utrValue');
  const depositStatus = document.getElementById('depositStatus');
  const referenceCodeEl = document.getElementById('referenceCode');
  const depositHistoryList = document.getElementById('depositHistoryList');
  const presetButtons = document.querySelectorAll('.amount-chip');
  const bankForm = document.getElementById('bankForm');
  const bankStatus = document.getElementById('bankStatus');
  const savedBanks = document.getElementById('savedBanks');
  const selectedBankSelect = document.getElementById('selectedBank');
  const withdrawForm = document.getElementById('withdrawForm');
  const withdrawStatus = document.getElementById('withdrawStatus');
  const withdrawHistoryList = document.getElementById('withdrawHistoryList');

  const userKey = getCurrentUserKey();
  const depositStorageKey = `${userKey}_depositRequests`;
  const withdrawalStorageKey = `${userKey}_withdrawalRequests`;
  const bankStorageKey = `${userKey}_bankAccounts`;
  let selectedPresetAmount = null;

  function getDepositRequests() {
    try {
      return JSON.parse(localStorage.getItem(depositStorageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveDepositRequests(requests) {
    localStorage.setItem(depositStorageKey, JSON.stringify(requests));
  }

  function getWithdrawalRequests() {
    try {
      return JSON.parse(localStorage.getItem(withdrawalStorageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveWithdrawalRequests(requests) {
    localStorage.setItem(withdrawalStorageKey, JSON.stringify(requests));
  }

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

  function getBankAccounts() {
    try {
      return JSON.parse(localStorage.getItem(bankStorageKey) || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveBankAccounts(accounts) {
    localStorage.setItem(bankStorageKey, JSON.stringify(accounts));
  }

  function renderDepositHistory() {
    if (!depositHistoryList) return;

    const requests = getDepositRequests().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!requests.length) {
      depositHistoryList.innerHTML = '<li>No deposit requests yet.</li>';
      return;
    }

    depositHistoryList.innerHTML = requests
      .map((request) => `
        <li>
          <strong>${request.username}</strong> requested ${formatCurrency(request.amount)} via ${request.method} — <span>${request.status}</span>
          <br />UTR: ${request.utr || '—'} • Ref: ${request.referenceCode} • ${request.createdAt}
        </li>
      `)
      .join('');
  }

  function renderBankAccounts() {
    const accounts = getBankAccounts();
    if (!savedBanks) return;
    if (!accounts.length) {
      savedBanks.innerHTML = '<p>No bank accounts added yet.</p>';
      if (selectedBankSelect) selectedBankSelect.innerHTML = '<option value="">No accounts saved</option>';
      return;
    }

    savedBanks.innerHTML = accounts.map((account) => `
      <div class="bank-card">
        <div>
          <strong>${account.bankName}</strong><br />
          ${account.accountHolderName} • ${account.accountNumber} • ${account.ifscCode}
        </div>
        <button type="button" data-id="${account.id}" class="delete-bank">Delete</button>
      </div>
    `).join('');

    if (selectedBankSelect) {
      selectedBankSelect.innerHTML = accounts.map((account) => `<option value="${account.id}">${account.bankName} - ${account.accountHolderName}</option>`).join('');
    }
  }

  function renderWithdrawalHistory() {
    if (!withdrawHistoryList) return;
    const requests = getWithdrawalRequests().slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (!requests.length) {
      withdrawHistoryList.innerHTML = '<li>No withdrawal requests yet.</li>';
      return;
    }

    withdrawHistoryList.innerHTML = requests.map((request) => `
      <li>
        <strong>${request.username}</strong> requested ${formatCurrency(request.amount)} to ${request.bankName} — <span>${request.status}</span>
        <br />Ref: ${request.referenceCode} • ${request.createdAt}
      </li>
    `).join('');
  }

  function setSelectedPreset(amount) {
    selectedPresetAmount = amount;
    presetButtons.forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.amount) === amount);
    });
  }

  if (balance) {
    balance.textContent = formatCurrency(getWalletBalance());
  }

  presetButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const amount = Number(button.dataset.amount);
      setSelectedPreset(amount);
      if (customAmountInput) customAmountInput.value = '';
    });
  });

  if (customAmountInput) {
    customAmountInput.addEventListener('input', () => {
      if (customAmountInput.value) {
        setSelectedPreset(null);
      }
    });
  }

  if (depositForm) {
    depositForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const amount = Number(selectedPresetAmount || customAmountInput?.value || 0);
      const method = paymentMethodSelect?.value || 'UPI';
      const utr = utrInput?.value?.trim() || '';

      if (!amount || amount < 100 || !utr) {
        if (depositStatus) {
          depositStatus.textContent = 'Please enter a valid amount and a UTR before submitting.';
        }
        return;
      }

      const referenceCode = `AERO-${Date.now().toString().slice(-6)}`;
      const authUser = JSON.parse(localStorage.getItem('aeroXAuthUser') || 'null');
      const requests = getDepositRequests();
      const transaction = {
        id: Date.now(),
        userId: authUser?.id || 'guest',
        username: localStorage.getItem('aeroXUserName') || 'Guest User',
        type: 'deposit',
        amount,
        method,
        utr,
        referenceCode,
        status: 'pending',
        createdAt: new Date().toLocaleString(),
      };

      requests.push(transaction);
      saveDepositRequests(requests);

      const adminTransactions = getAdminTransactions();
      adminTransactions.push(transaction);
      saveAdminTransactions(adminTransactions);
      if (referenceCodeEl) referenceCodeEl.textContent = `Reference: ${referenceCode}`;
      if (depositStatus) depositStatus.textContent = `Deposit request submitted for ${formatCurrency(amount)}. Waiting for admin approval.`;
      depositForm.reset();
      setSelectedPreset(null);
      renderDepositHistory();
    });
  }

  if (bankForm) {
    bankForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const accounts = getBankAccounts();
      if (accounts.length >= 2) {
        if (bankStatus) bankStatus.textContent = 'You can save up to two bank accounts only.';
        return;
      }

      const account = {
        id: Date.now(),
        accountNumber: document.getElementById('accountNumber').value.trim(),
        accountHolderName: document.getElementById('accountHolderName').value.trim(),
        ifscCode: document.getElementById('ifscCode').value.trim(),
        bankName: document.getElementById('bankName').value.trim(),
      };

      accounts.push(account);
      saveBankAccounts(accounts);
      if (bankStatus) bankStatus.textContent = 'Bank account saved successfully.';
      bankForm.reset();
      renderBankAccounts();
    });
  }

  if (savedBanks) {
    savedBanks.addEventListener('click', (event) => {
      const button = event.target.closest('.delete-bank');
      if (!button) return;
      const accounts = getBankAccounts().filter((account) => String(account.id) !== button.dataset.id);
      saveBankAccounts(accounts);
      renderBankAccounts();
    });
  }

  if (withdrawForm) {
    withdrawForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const selectedBankId = selectedBankSelect?.value;
      const withdrawAmount = Number(document.getElementById('withdrawAmount').value || 0);
      const balance = getWalletBalance();

      if (!selectedBankId) {
        if (withdrawStatus) withdrawStatus.textContent = 'Please save and select a bank account.';
        return;
      }

      if (withdrawAmount < 100) {
        if (withdrawStatus) withdrawStatus.textContent = 'Withdrawal amount must be at least 100.';
        return;
      }

      if (withdrawAmount > balance) {
        if (withdrawStatus) withdrawStatus.textContent = 'Withdrawal amount cannot exceed wallet balance.';
        return;
      }

      const bankAccounts = getBankAccounts();
      const selectedBank = bankAccounts.find((account) => String(account.id) === String(selectedBankId));
      const referenceCode = `WDR-${Date.now().toString().slice(-6)}`;
      const authUser = JSON.parse(localStorage.getItem('aeroXAuthUser') || 'null');
      const requests = getWithdrawalRequests();
      const transaction = {
        id: Date.now(),
        userId: authUser?.id || 'guest',
        username: localStorage.getItem('aeroXUserName') || 'Guest User',
        type: 'withdrawal',
        amount: withdrawAmount,
        bankName: selectedBank ? selectedBank.bankName : 'Bank',
        referenceCode,
        status: 'pending',
        createdAt: new Date().toLocaleString(),
      };

      requests.push(transaction);
      saveWithdrawalRequests(requests);

      const adminTransactions = getAdminTransactions();
      adminTransactions.push(transaction);
      saveAdminTransactions(adminTransactions);

      const nextBalance = balance - withdrawAmount;
      setWalletBalance(nextBalance);
      if (withdrawStatus) withdrawStatus.textContent = `Withdrawal request submitted for ${formatCurrency(withdrawAmount)}. Awaiting admin approval.`;
      withdrawForm.reset();
      renderWithdrawalHistory();
    });
  }

  renderDepositHistory();
  renderBankAccounts();
  renderWithdrawalHistory();

  document.addEventListener('wallet:updated', () => {
    if (balance) {
      balance.textContent = formatCurrency(getWalletBalance());
    }
  });
});
