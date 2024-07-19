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

    function login() {
			const username = document.getElementById('username').value;
			const password = document.getElementById('password').value;

			loggedInUser = userData.find(user => user.username === username && user.password === password);

			if (loggedInUser) {
				displayUserData(loggedInUser);
				//document.getElementById('loginForm').style.display = 'none';
				//document.getElementById('manageNotesForm').style.display = 'block';
			} else {
				alert('Invalid username or password');
			}
		}

		function displayUserData(user) {
			const userDataDiv = document.getElementById('userData');
			userDataDiv.innerHTML = `<div class="user-info">
									<h2>Username: ${user.username}</h2>
									<p>Email: ${user.email}</p>
									<p>Password: ${user.password}</p>
									<h3>Notes:</h3>
									<div id="notesList"></div>
									</div>`;
		}