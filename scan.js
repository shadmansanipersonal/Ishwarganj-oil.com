// Scan page logic (simulation)

document.addEventListener('DOMContentLoaded', () => {
    loadUsersForScan();
    
    document.getElementById('scan-btn').addEventListener('click', performScan);
});

function loadUsersForScan() {
    const users = Storage.get('users');
    const select = document.getElementById('user-select');
    
    select.innerHTML = '<option value="">Select user / ইউজার নির্বাচন করুন</option>' + 
        users.map(user => `<option value="${user.id}">${user.name} (${user.vehicle})</option>`).join('');
}

function performScan() {
    const userId = document.getElementById('user-select').value;
    if (!userId) {
        Toast.show('Please select a user / দয়া করে একটি ইউজার নির্বাচন করুন', 'error');
        return;
    }
    
    showScanResult(userId);
}

function showScanResult(userId) {
    const users = Storage.get('users');
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    const isEligible = !user.lastFuel || new Date(user.lastFuel) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    document.getElementById('scanned-user-info').innerHTML = `
        <div class="user-summary">
            <h3>${user.name}</h3>
            <p>ID: ${user.id}</p>
            <p>Vehicle: ${user.vehicle}</p>
            <canvas id="scanned-qr" class="qr-canvas" style="width: 120px; height: 120px;"></canvas>
        </div>
    `;
    
    QRGenerator.generate(userId, 'scanned-qr');
    
    const statusEl = document.getElementById('scan-status');
    const linkEl = document.getElementById('scan-dashboard-link');
    
    if (isEligible) {
        statusEl.innerHTML = '<div class="status-badge eligible">✅ Eligible for Fuel / তেলের জন্য যোগ্য</div>';
        linkEl.href = `dashboard.html?user=${userId}`;
        linkEl.style.display = 'inline-block';
        linkEl.textContent = 'View Dashboard / ড্যাশবোর্ড দেখুন';
    } else {
        statusEl.innerHTML = '<div class="status-badge not-eligible">❌ Not Eligible / যোগ্য নয় (3 day restriction)</div>';
        linkEl.style.display = 'none';
    }
    
    document.getElementById('scan-result').style.display = 'block';
    document.querySelector('.scan-hero').style.display = 'none';
    
    // Scroll to result
    document.getElementById('scan-result').scrollIntoView({ behavior: 'smooth' });
}

// Scan again button
const scanAgainStyle = document.createElement('style');
scanAgainStyle.textContent = `
    .scan-page { padding-top: 100px; min-height: 100vh; }
    .scan-hero { text-align: center; margin-bottom: 2rem; }
    .scan-camera { margin: 2rem 0; }
    .camera-placeholder { 
        width: 300px; height: 300px; 
        border: 3px solid var(--glass-border); 
        border-radius: 24px; 
        margin: 0 auto 2rem; 
        position: relative; 
        background: var(--glass-bg);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }
    .scanner-animation {
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, transparent, var(--primary-green), transparent);
        position: absolute;
        top: 0;
        animation: scan 2s infinite;
    }
    @keyframes scan {
        0% { top: 0; }
        50% { top: 100%; }
        100% { top: 0; }
    }
    .scan-selector { display: flex; gap: 1rem; max-width: 400px; margin: 0 auto; flex-wrap: wrap; }
    .scan-selector select { flex: 1; min-width: 200px; padding: 1rem; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--glass-bg); }
    .scan-result { text-align: center; }
    .user-summary { margin-bottom: 1rem; }
    .user-summary canvas { margin: 1rem auto; display: block; }
`;
document.head.appendChild(scanAgainStyle);
