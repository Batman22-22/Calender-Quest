document.getElementById("userName").addEventListener("click", editProfileName);

// Function to edit profile name
function editProfileName() {
    const newName = prompt("Enter new name:");
    if (newName !== null && newName.trim() !== "") {
        const formattedName = capitalizeWords(newName.trim());
        document.getElementById("userName").textContent = formattedName;
    } else {
        alert("Name cannot be empty.");
    }
}

// Function to capitalize each word
function capitalizeWords(str) {
    return str.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
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

// Function to edit user bio
function editUserBio() {
    const newBio = prompt("Enter new bio:");
    if (newBio !== null && newBio.trim() !== "") {
        document.getElementById("userBio").textContent = newBio.trim();
    } else {
        alert("Bio cannot be empty.");
    }
}

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
    if (newEmail !== null && newEmail.trim() !== "" && validateEmail(newEmail.trim())) {
        document.getElementById("userEmail").textContent = newEmail.trim();
    } else {
        alert("Please enter a valid email.");
    }

    const newPhone = prompt("Enter new phone:");
    if (newPhone !== null && newPhone.trim() !== "" && validatePhone(newPhone.trim())) {
        const formattedPhone = formatPhoneNumber(newPhone.trim());
        document.getElementById("userPhone").textContent = formattedPhone;
    } else {
        alert("Please enter a valid phone number.");
    }

    const newLocation = prompt("Enter new location:");
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

// Function to format phone number as (123) 456-7890
function formatPhoneNumber(phone) {
    // Remove any non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    // Check if the cleaned phone number is valid
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length === 11) {
        return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
    }
    // Return the cleaned phone number if it's not exactly 10 or 11 digits
    return phone;
}

