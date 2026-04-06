// Register page logic

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const successSection = document.getElementById('success-section');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const vehicle = document.getElementById('vehicle').value.trim();
        
        if (!name || !phone || !vehicle) {
            Toast.show('সব ফিল্ড পূরণ করুন', 'error');
            return;
        }
        
        // Simple Bangladesh phone validation
        const phoneNum = phone.replace(/[^0-9]/g, '');
        if (phoneNum.length !== 11 || !phoneNum.startsWith('01')) {
            Toast.show('সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)', 'error');
            return;
        }
        
        // Generate unique ID
        const users = Storage.get('users');
        const lastId = users.length > 0 ? Math.max(...users.map(u => parseInt(u.id.split('-').pop()))) : 0;
        const newId = `USER-2026-${String(lastId + 1).padStart(3, '0')}`;
        
        // Create user
        const newUser = {
            id: newId,
            name,
            phone,
            vehicle,
            lastFuel: null,
            registrations: [{date: new Date().toISOString()}]
        };
        
        // Save
        users.push(newUser);
        Storage.set('users', users);
        
        // Show success
        document.getElementById('user-id').textContent = newId;
        document.getElementById('reg-name').textContent = name;
        document.getElementById('reg-phone').textContent = phone;
        document.getElementById('reg-vehicle').textContent = vehicle;
        
        // Generate QR
        QRGenerator.generate(newId, 'user-qr');
        
        form.style.display = 'none';
        successSection.style.display = 'block';
        
        Toast.show('Registration successful! / রেজিস্ট্রেশন সফল!', 'success');
        
        // Update global stats
        if (window.updateStats) updateStats();
    });
});
