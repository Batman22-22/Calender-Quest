const jsonBinUrl = 'https://api.jsonbin.io/v3/b/66994ca8ad19ca34f88978e8'; // Replace with your JSONBin URL
		const apiKey = '$2a$10$qppk3etiMyZ4D1QdhAlWLuVs0cp2gdQhn6JTELTti.STVtTfK5FkO'; // Replace with your API key

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



async function addUser() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const newEmail = document.getElementById('newEmail').value;

    const newUser = {
        username: newUsername,
        password: newPassword,
        email: newEmail,
        calendarEvents: [],
        mealPlans: [],
        notes: []
    };

    userData.push(newUser);
    await updateUserData(userData);

    alert('New user added successfully');
    document.getElementById('newUsername').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('newEmail').value = '';
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