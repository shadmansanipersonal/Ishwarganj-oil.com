// Dashboard logic

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user') || localStorage.getItem('currentUser') || Storage.get('users')[0]?.id;
    
    if (userId) {
        localStorage.setItem('currentUser', userId);
        loadUserDashboard(userId);
    } else {
        document.getElementById('user-info').innerHTML = '<p>No user selected. Please register first. / কোনো ইউজার নির্বাচিত নেই। দয়া করে রেজিস্টার করুন।</p>';
    }
    
    // Notification check
    checkNotifications();
});

function loadUserDashboard(userId) {
    const users = Storage.get('users');
    const user = users.find(u => u.id === userId);
    const receipts = Storage.get('receipts');
    
    if (!user) {
        Toast.show('User not found / ইউজার পাওয়া যায়নি', 'error');
        return;
    }
    
    // Update user info
    document.getElementById('user-info').innerHTML = `
        <h2>${user.name}</h2>
        <p><strong>ID:</strong> ${user.id}</p>
        <p><strong>Phone:</strong> ${user.phone}</p>
        <p><strong>Vehicle:</strong> ${user.vehicle}</p>
        <p><strong>Last Fuel:</strong> ${user.lastFuel ? new Date(user.lastFuel).toLocaleString('bn-BD') : 'Never / কখনো না'}</p>
        <canvas id="user-qr-dashboard" class="qr-canvas" style="max-width: 150px;"></canvas>
    `;
    
    QRGenerator.generate(userId, 'user-qr-dashboard');
    
    // Check eligibility
    checkEligibility(user);
    
    // Load history
    const userReceipts = receipts.filter(r => r.userId === userId);
    const historyList = document.getElementById('fuel-history');
    if (userReceipts.length === 0) {
        historyList.innerHTML = '<li>No fuel history / কোনো ফুয়েল ইতিহাস নেই</li>';
    } else {
        historyList.innerHTML = userReceipts.map(receipt => 
            `<li>${new Date(receipt.date).toLocaleString('bn-BD')} - REC-${receipt.id.padStart(4, '0')}</li>`
        ).join('');
    }
}

function checkEligibility(user) {
    const now = Date.now();
    const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;
    
    if (!user.lastFuel || new Date(user.lastFuel) < threeDaysAgo) {
        showEligible();
    } else {
        showNotEligible(user.lastFuel);
    }
}

function showEligible() {
    const status = document.getElementById('eligibility-status');
    const message = document.getElementById('eligibility-message');
    
    status.innerHTML = '✅ Eligible / যোগ্য';
    status.className = 'status-badge eligible';
    message.textContent = 'You can get fuel now / আপনি এখন তেল নিতে পারবেন';
}

function showNotEligible(lastFuel) {
    const status = document.getElementById('eligibility-status');
    const message = document.getElementById('eligibility-message');
    const timerEl = document.getElementById('countdown-timer');
    
    status.innerHTML = '❌ Not Eligible / যোগ্য নয়';
    status.className = 'status-badge not-eligible';
    message.textContent = 'Please wait 3 days / ৩ দিন অপেক্ষা করুন';
    
    // Start countdown
    startCountdown(lastFuel);
}

function startCountdown(lastFuelDate) {
    const endTime = new Date(lastFuelDate).getTime() + 3 * 24 * 60 * 60 * 1000;
    
    const timerEl = document.getElementById('countdown-timer');
    
    const interval = setInterval(() => {
        const now = Date.now();
        const remaining = endTime - now;
        
        if (remaining <= 0) {
            clearInterval(interval);
            timerEl.innerHTML = '';
            showEligible();
            showNotification('You are now eligible! / আপনি এখন তেল নিতে পারবেন!');
            return;
        }
        
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        
        timerEl.innerHTML = `
            ⏰ Remaining: ${days}d ${hours}h ${minutes}m ${seconds}s
            অবশিষ্ট: ${days}দিন ${hours}ঘন্টা ${minutes}মিনিট ${seconds}সেকেন্ড
        `;
    }, 1000);
}

function showNotification(message) {
    // Simple alert + toast
    Toast.show(message);
    if (Notification.permission === 'granted') {
        new Notification('Ishwarganjoil', { body: message });
    }
}

function checkNotifications() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Add CSS classes via JS for status badges
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.2rem;
        font-weight: 600;
        margin: 1rem 0;
        display: inline-block;
    }
    .status-badge.eligible {
        background: var(--primary-green);
        color: white;
    }
    .status-badge.not-eligible {
        background: #ef4444;
        color: white;
    }
    .countdown {
        font-size: 1.1rem;
        color: var(--text-secondary);
        font-family: monospace;
    }
    .user-info-section {
        text-align: center;
    }
    .dashboard-page {
        padding-top: 100px;
        min-height: 100vh;
    }
    .user-header, .eligibility-section, .history-section {
        margin-bottom: 2rem;
    }
    .history-section ul {
        list-style: none;
    }
    .history-section li {
        padding: 0.8rem;
        background: rgba(255,255,255,0.5);
        margin-bottom: 0.5rem;
        border-radius: 12px;
        border-left: 4px solid var(--primary-green);
    }
`;
document.head.appendChild(style);
