const jsonBinUrl = 'https://api.jsonbin.io/v3/b/6699d64facd3cb34a868209e'; // Corrected JSONBin URL
const apiKey = '$2a$10$PAC1aWUZ1v6nYdASdlU9T.pSkUw29Ys.uKrdoYRZVL36dlUzxLRgK'; // Your API key

let userData = null;
let loggedInUser = null;

async function fetchUserData() {
    try {
        const response = await fetch(jsonBinUrl, {
            headers: {
                'X-Master-Key': apiKey
            }
        });
        const data = await response.json();
        userData = data.record;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function login() {
    if (!userData) {
        await fetchUserData();
    }

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    loggedInUser = userData.find(user => user.username === username && user.password === password);

    if (loggedInUser) {
        alert('Logging in');
        handleLoginSuccess(loggedInUser);
    } else {
        alert('Invalid username or password');
    }
}

function handleLoginSuccess(user) {
    // Clear existing session data
    sessionStorage.removeItem('loggedInUsername');
    sessionStorage.removeItem('loggedInUser');

    // Store new session data
    sessionStorage.setItem('loggedInUsername', JSON.stringify(user.username));
    sessionStorage.setItem('loggedInUser', JSON.stringify(user));

    // Redirect to the calendar page
    window.location.href = '../calendar2';
}

window.onload = async function () {
    await fetchUserData();
};
