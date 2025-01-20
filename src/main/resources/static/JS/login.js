async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password }),
      });

      if (response.ok) {
        window.location.href = '/HTML/proflogin1.html';
      } else {
        const error = await response.text();
                    alert('Login failed: ' + error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while logging in.');
    }
  }
