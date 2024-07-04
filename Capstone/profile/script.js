document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();
    updateProfile();
});

document.getElementById('upload-picture').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-picture').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
});

function updateProfile() {
    const userName = document.getElementById('user-name').value;
    const userBio = document.getElementById('user-bio').value;
    const about = document.getElementById('about').value;
    const userEmail = document.getElementById('user-email').value;
    const userPhone = document.getElementById('user-phone').value;
    const userLocation = document.getElementById('user-location').value;

    // Update the profile data
    // In a real application, you would save this data to a server or database
    console.log({
        userName,
        userBio,
        about,
        userEmail,
        userPhone,
        userLocation
    });

    alert('Profile updated successfully!');
}
