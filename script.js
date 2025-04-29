document.addEventListener('DOMContentLoaded', function() {
    // Elemen DOM
    const currentBalanceEl = document.getElementById('currentBalance');
    const initialAmountEl = document.getElementById('initialAmount');
    const setBalanceBtn = document.getElementById('setBalance');
    const transactionTypeEl = document.getElementById('transactionType');
    const amountEl = document.getElementById('amount');
    const descriptionEl = document.getElementById('description');
    const transactionDateEl = document.getElementById('transactionDate');
    const addTransactionBtn = document.getElementById('addTransaction');
    const transactionsListEl = document.getElementById('transactionsList');
    const filterTypeEl = document.getElementById('filterType');
    const filterMonthEl = document.getElementById('filterMonth');
    const totalIncomeEl = document.getElementById('totalIncome');
    const totalExpenseEl = document.getElementById('totalExpense');

    // Inisialisasi tanggal
    const today = new Date();
    transactionDateEl.valueAsDate = today;
    filterMonthEl.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    // Load data dari localStorage
    let currentBalance = parseFloat(localStorage.getItem('currentBalance')) || 0;
    let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

    // Inisialisasi aplikasi
    initApp();

    // Event listeners
    setBalanceBtn.addEventListener('click', setInitialBalance);
    addTransactionBtn.addEventListener('click', addTransaction);
    filterTypeEl.addEventListener('change', renderTransactions);
    filterMonthEl.addEventListener('change', renderTransactions);

    function initApp() {
        updateBalance();
        renderTransactions();
    }

    function setInitialBalance() {
        const amount = parseFloat(initialAmountEl.value);
        
        if (isNaN(amount)) {
            showAlert('Masukkan jumlah yang valid!', 'error');
            return;
        }

        if (amount < 0) {
            showAlert('Saldo tidak boleh negatif!', 'error');
            return;
        }

        if (transactions.length > 0 && !confirm('Anda sudah memiliki transaksi. Set saldo awal baru akan menghapus semua transaksi. Lanjutkan?')) {
            return;
        }

        currentBalance = amount;
        transactions = [{
            type: 'income',
            amount: amount,
            description: 'Saldo Awal',
            date: today.getTime()
        }];

        saveToStorage();
        updateBalance();
        renderTransactions();
        initialAmountEl.value = '';
        
        showAlert(`Saldo awal berhasil diatur: Rp ${formatCurrency(amount)}`, 'success');
    }

    function addTransaction() {
        if (currentBalance === 0 && transactions.length === 0) {
            showAlert('Silakan set saldo awal terlebih dahulu!', 'error');
            return;
        }

        const type = transactionTypeEl.value;
        const amount = parseFloat(amountEl.value);
        const description = descriptionEl.value.trim();
        const date = new Date(transactionDateEl.value);

        if (isNaN(amount) || amount <= 0) {
            showAlert('Masukkan jumlah yang valid (lebih dari 0)!', 'error');
            return;
        }

        if (description === '') {
            showAlert('Masukkan keterangan transaksi!', 'error');
            return;
        }

        if (type === 'expense' && amount > currentBalance) {
            showAlert('Saldo tidak mencukupi!', 'error');
            return;
        }

        // Update saldo
        if (type === 'income') {
            currentBalance += amount;
        } else {
            currentBalance -= amount;
        }

        // Tambahkan transaksi
        transactions.push({
            type,
            amount,
            description,
            date: date.getTime()
        });

        saveToStorage();
        updateBalance();
        renderTransactions();

        // Reset form
        amountEl.value = '';
        descriptionEl.value = '';
        transactionDateEl.valueAsDate = new Date();
        
        showAlert('Transaksi berhasil ditambahkan!', 'success');
    }

    function saveToStorage() {
        localStorage.setItem('currentBalance', currentBalance.toString());
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }

    function updateBalance() {
        currentBalanceEl.textContent = `Rp ${formatCurrency(currentBalance)}`;
        
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        totalIncomeEl.textContent = `Pemasukan: Rp ${formatCurrency(totalIncome)}`;
        totalExpenseEl.textContent = `Pengeluaran: Rp ${formatCurrency(totalExpense)}`;
    }

    function renderTransactions() {
        const filterType = filterTypeEl.value;
        const filterMonth = filterMonthEl.value;
        
        let filteredTransactions = transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
            
            return (filterType === 'all' || transaction.type === filterType) &&
                   (!filterMonth || transactionMonth === filterMonth);
        }).sort((a, b) => b.date - a.date);
        
        transactionsListEl.innerHTML = filteredTransactions.length === 0
            ? '<p class="empty-message">Tidak ada transaksi yang sesuai dengan filter</p>'
            : filteredTransactions.map(transaction => `
                <div class="transaction-item transaction-${transaction.type}">
                    <div class="transaction-info">
                        <div class="transaction-desc">${transaction.description}</div>
                        <div class="transaction-date">${formatDate(transaction.date)}</div>
                    </div>
                    <div class="transaction-amount ${transaction.type}-amount">
                        ${transaction.type === 'income' ? '+' : '-'}Rp ${formatCurrency(transaction.amount)}
                    </div>
                </div>
            `).join('');
    }

    function formatDate(timestamp) {
        return new Intl.DateTimeFormat('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(timestamp));
    }

    function formatCurrency(amount) {
        return amount.toLocaleString('id-ID');
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        
        setTimeout(() => alert.remove(), 3000);
    }
});