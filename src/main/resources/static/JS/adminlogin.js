async function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    try {
        const response = await fetch('/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ username, password }),
        });

        if (response.ok) {
            window.location.href = '/HTML/admin.html';
        } else {
            const error = await response.text();
            alert('Login failed: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
}