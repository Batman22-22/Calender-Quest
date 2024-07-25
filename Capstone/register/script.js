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
        // alert(JSON.stringify(userData));
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// function usernameExists(username){
//  return userData.find(user => user.username === username) !==undefined;
// }

async function addUser() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const newEmail = document.getElementById('newEmail').value;

    // Check if all required fields are filled
    if (!newUsername || !newPassword || !newEmail) {
        alert('All fields are required.');
        return;
    }

    // Check if the username or email already exists
    const userExists = userData.some(user => user.username === newUsername || user.email === newEmail);
    if (userExists) {
        alert('Username or email already exists.');
        return;
    }

    // Create new user object
    const newUser = {
        username: newUsername,
        password: newPassword,
        email: newEmail,
        events: [],
        notes: [],
        mealPlans: []
    };

    // Add new user to data
    userData.push(newUser);
    await updateUserData(userData);

    alert('New user added successfully');
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newEmail').value = '';

    // Redirect to the login page
    window.location.href = '/../Capstone/Login';
}



async function updateUserData(data) {
    try {
        const response = await fetch(jsonBinUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(data)
        });
        if (response.ok) {
            console.log('Data updated successfully');
        } else {
            console.error('Error updating data:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating data:', error);
    }
}

window.onload = fetchUserData;
