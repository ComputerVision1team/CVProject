
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

//    try {
//      const response = await fetch('/login', {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/x-www-form-urlencoded',
//        },
//        body: new URLSearchParams({ username, password }),
//      });
//
//      if (response.ok) {
//
//              if (responseText === 'student') {
//                window.location.href = '/HTML/studentlogin1.html'; // Redirect to student view
//              } else if (responseText === 'professor') {
//                window.location.href = '/HTML/proflogin1.html'; // Redirect to professor view
//              }else {  alert('Unknown role: ' + responseText);
//      }
//    } catch (error) {
//      console.error('Error:', error);
//      alert('An error occurred while logging in.');
//    }
//  }
try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({ username, password }),
        });

        if (response.ok) {
            // No need to handle redirection here, as it will be handled by the server
           // alert('Login successful');
        } else {
            const error = await response.text();
            alert('Login failed: ' + error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while logging in.');
    }
    }