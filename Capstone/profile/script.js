// Function to edit profile name
function editProfileName() {
    const newName = prompt("Enter new name:");
    if (newName !== null && newName.trim() !== "") {
        document.getElementById("userName").textContent = newName.trim();
    } else {
        alert("Name cannot be empty.");
    }
}

// Function to handle profile picture upload
document.getElementById("profilePictureInput").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("profilePicture").src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image file.");
    }
});

// Function to edit about section
function editAbout() {
    const newAbout = prompt("Enter new about:");
    if (newAbout !== null && newAbout.trim() !== "") {
        document.getElementById("userAbout").textContent = newAbout.trim();
    } else {
        alert("About section cannot be empty.");
    }
}

// Function to edit contact information
function editContactInfo() {
    const newEmail = prompt("Enter new email:");
    const newPhone = prompt("Enter new phone:");
    const newLocation = prompt("Enter new location:");

    if (newEmail !== null && newEmail.trim() !== "" && validateEmail(newEmail.trim())) {
        document.getElementById("userEmail").textContent = newEmail.trim();
    } else {
        alert("Please enter a valid email.");
    }

    if (newPhone !== null && newPhone.trim() !== "" && validatePhone(newPhone.trim())) {
        document.getElementById("userPhone").textContent = newPhone.trim();
    } else {
        alert("Please enter a valid phone number.");
    }

    if (newLocation !== null && newLocation.trim() !== "") {
        document.getElementById("userLocation").textContent = newLocation.trim();
    } else {
        alert("Location cannot be empty.");
    }
}

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Phone validation function
function validatePhone(phone) {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
}
