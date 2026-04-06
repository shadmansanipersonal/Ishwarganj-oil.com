// Admin panel logic

document.addEventListener('DOMContentLoaded', () => {
    loadAdminPanel();
    
    // Modal handlers
    document.querySelector('.close-btn').addEventListener('click', closeModal);
    document.getElementById('receipt-modal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) closeModal();
    });
});

function loadAdminPanel() {
    const users = Storage.get('users');
    
    // Update stats
    document.getElementById('admin-total-users').textContent = users.length;
    const pending = users.filter(u => !u.lastFuel || 
        new Date(u.lastFuel) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)).length;
    document.getElementById('admin-pending').textContent = pending;
    
    // Load users
    const usersGrid = document.getElementById('users-list');
    usersGrid.innerHTML = users.map(user => createUserCard(user)).join('');
}

function createUserCard(user) {
    const isEligible = !user.lastFuel || new Date(user.lastFuel) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const lastFuelDate = user.lastFuel ? new Date(user.lastFuel).toLocaleDateString('bn-BD') : 'Never';
    
    return `
        <div class="user-card glass-card">
            <div class="user-header">
                <h3>${user.name}</h3>
                <span class="status-badge ${isEligible ? 'eligible' : 'not-eligible'}">
                    ${isEligible ? '✅ Eligible' : '⏳ Waiting'}
                </span>
            </div>
            <div class="user-details">
                <p><strong>ID:</strong> ${user.id}</p>
                <p><strong>Phone:</strong> ${user.phone}</p>
                <p><strong>Vehicle:</strong> ${user.vehicle}</p>
                <p><strong>Last Fuel:</strong> ${lastFuelDate}</p>
            </div>
            <button class="btn-primary give-fuel-btn" data-userid="${user.id}">
                Give Fuel / তেল দিন
            </button>
        </div>
    `;
}

// Event delegation for Give Fuel buttons
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('give-fuel-btn')) {
        const userId = e.target.dataset.userid;
        giveFuel(userId);
    }
});

function giveFuel(userId) {
    const users = Storage.get('users');
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    // Generate receipt ID
    const receipts = Storage.get('receipts');
    const lastReceiptId = receipts.length > 0 ? Math.max(...receipts.map(r => r.id)) : 0;
    const receiptId = lastReceiptId + 1;
    
    // Create receipt
    const receipt = {
        id: receiptId,
        userId,
        userName: user.name,
        phone: user.phone,
        vehicle: user.vehicle,
        date: new Date().toISOString()
    };
    
    receipts.push(receipt);
    Storage.set('receipts', receipts);
    
    // Update user lastFuel
    user.lastFuel = receipt.date;
    Storage.set('users', users);
    
    // Show receipt modal
    showReceipt(receipt);
    
    Toast.show(`Fuel given to ${user.name} / ${user.name} এর জন্য তেল দেওয়া হয়েছে`);
    
    // Reload admin panel
    loadAdminPanel();
}

function showReceipt(receipt) {
    const modal = document.getElementById('receipt-modal');
    const content = document.getElementById('receipt-content');
    
    const receiptHtml = `
        <div class="receipt glass-card">
            <h3>Receipt ID: REC-2026-${String(receipt.id).padStart(4, '0')}</h3>
            <canvas id="receipt-qr" class="qr-canvas"></canvas>
            <div class="receipt-details">
                <p><strong>User:</strong> ${receipt.userName}</p>
                <p><strong>Phone:</strong> ${receipt.phone}</p>
                <p><strong>Vehicle:</strong> ${receipt.vehicle}</p>
                <p><strong>Date & Time:</strong> ${new Date(receipt.date).toLocaleString('bn-BD')}</p>
                <p><strong>Status:</strong> <span style="color: var(--primary-green); font-weight: bold;">Fuel Delivered / তেল সরবরাহিত</span></p>
            </div>
        </div>
    `;
    
    content.innerHTML = receiptHtml;
    
    // Generate QR for receipt
    setTimeout(() => QRGenerator.generate(`REC-2026-${String(receipt.id).padStart(4, '0')}`, 'receipt-qr'), 100);
    
    // Download button
    document.getElementById('download-receipt').onclick = () => downloadReceipt(receipt);
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('receipt-modal').classList.remove('active');
}

function downloadReceipt(receipt) {
    const receiptData = `Ishwarganjoil Fuel Receipt\n\nID: REC-2026-${String(receipt.id).padStart(4, '0')}\nUser: ${receipt.userName}\nPhone: ${receipt.phone}\nVehicle: ${receipt.vehicle}\nDate: ${new Date(receipt.date).toLocaleString('bn-BD')}\nStatus: Fuel Delivered`;
    
    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-REC-2026-${String(receipt.id).padStart(4, '0')}.txt`;
    a.click();
    
    Toast.show('Receipt downloaded / রশিদ ডাউনলোড হয়েছে');
}

// Add admin styles
const adminStyle = document.createElement('style');
adminStyle.textContent = `
    .admin-page { padding-top: 100px; min-height: 100vh; }
    .admin-header { text-align: center; margin-bottom: 3rem; }
    .admin-stats { display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; margin-top: 1rem; }
    .stat-item { background: var(--glass-bg); padding: 1rem 2rem; border-radius: 50px; }
    .users-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
    .user-card { display: flex; flex-direction: column; gap: 1rem; padding: 2rem; }
    .user-header { display: flex; justify-content: space-between; align-items: center; }
    .user-details p { margin: 0.5rem 0; }
    .give-fuel-btn { margin-top: auto; }
    .receipt { text-align: center; padding: 2rem; }
    .receipt-details { text-align: left; max-width: 300px; margin: 1rem auto; }
`;
document.head.appendChild(adminStyle);
