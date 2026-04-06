// Global script for Ishwarganjoil.com
// Handles: nav mobile, dark mode, stats, demo data, toast

// Demo data - populate on first load
const DEMO_USERS = [
    {
        id: 'USER-2026-001',
        name: 'Rahim Khan',
        phone: '01712345678',
        vehicle: 'DHAKA-METRO-GA-123',
        lastFuel: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        registrations: [{date: new Date().toISOString()}]
    },
    {
        id: 'USER-2026-002',
        name: 'Fatema Begum',
        phone: '01987654321',
        vehicle: 'DHAKA-METRO-DA-456',
        lastFuel: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        registrations: [{date: new Date().toISOString()}]
    },
    {
        id: 'USER-2026-003',
        name: 'Admin User',
        phone: '01611112222',
        vehicle: 'ADMIN-001',
        lastFuel: null,
        registrations: [{date: new Date().toISOString()}]
    }
];

// LocalStorage helpers
const Storage = {
    get(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    },
    set(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },
    initDemo() {
        let users = this.get('users');
        if (users.length === 0) {
            this.set('users', DEMO_USERS);
            this.set('receipts', []);
        }
    }
};

// Toast notifications
const Toast = {
    show(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// QR Code Generator (simple canvas-based)
const QRGenerator = {
    generate(data, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        // Simple QR pattern (for demo - in real use a library like qrcode.js)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#fff';
        
        // Draw data as pattern
        const text = data.substring(0, 20);
        for (let i = 0; i < text.length; i++) {
            const x = (i % 10) * 20 + 10;
            const y = Math.floor(i / 10) * 20 + 10;
            ctx.fillRect(x, y, 16, 16);
        }
        
        // Finder patterns
        this.drawFinder(ctx, 0, 0, size);
        this.drawFinder(ctx, size - 25, 0, size);
        this.drawFinder(ctx, 0, size - 25, size);
    },
    drawFinder(ctx, x, y, size) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, 25, 25);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 5, y + 5, 15, 15);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 7, y + 7, 11, 11);
    }
};

// Stats calculator
function updateStats() {
    const users = Storage.get('users');
    const today = new Date().toDateString();
    
    let eligible = 0;
    let fuels = Storage.get('receipts').length;
    
    users.forEach(user => {
        if (!user.lastFuel || 
            new Date(user.lastFuel) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
            eligible++;
        }
    });
    
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('eligible-today').textContent = eligible;
    document.getElementById('fuels-delivered').textContent = fuels;
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    // Init demo data
    Storage.initDemo();
    
    // Navbar mobile & active
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    
    // Set active nav
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            document.querySelectorAll('.nav-menu a.active').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Logo click to home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => location.href = 'index.html');
    }
    
    // Update stats if home
    updateStats();
    
    // No dark mode toggle
    
    // Home-specific
    if (document.querySelector('.hero-stats')) {
        setInterval(updateStats, 30000);
    }
});

// Export for other modules
window.Storage = Storage;
window.Toast = Toast;
window.QRGenerator = QRGenerator;
window.updateStats = updateStats;
