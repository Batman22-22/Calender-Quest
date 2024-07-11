// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBqppTifuvWf98uJN5bSeIEcMtkg0rXEcc",
    authDomain: "calenderquest.firebaseapp.com",
    projectId: "calenderquest",
    storageBucket: "calenderquest.appspot.com",
    messagingSenderId:"973937610484",
    appId: "1:973937610484:web:f65149ac65eb06c81f98a1",
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
  
// Google Sign-Up
document.getElementById('google-signup').addEventListener('click', function() {
  var provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
      .then(function(result) {
          console.log(result.user);
          // Redirect to dashboard or save user data to MongoDB
          saveUserData(result.user);
      })
      .catch(function(error) {
          console.log(error);
      });
});

 // Phone Sign-Up
document.getElementById('phone-signup').addEventListener('click', function() {
  var phoneNumber = prompt("Please enter your phone number (in international format, e.g., +1234567890):");
  if (phoneNumber) {
      var appVerifier = new firebase.auth.RecaptchaVerifier('phone-signup', {
          'size': 'invisible',
          'callback': function(response) {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
              // This will only be called after a successful reCAPTCHA response.
              console.log("reCAPTCHA solved, allow signInWithPhoneNumber.");
          },
          'expired-callback': function() {
              // Response expired. Ask user to solve reCAPTCHA again.
              console.log("reCAPTCHA expired. Please solve again.");
          }
      });

      auth.signInWithPhoneNumber(phoneNumber, appVerifier)
          .then(function(confirmationResult) {
              // SMS sent. Prompt user to type the code from the SMS message.
              var verificationCode = prompt("Please enter the verification code sent to your phone:");
              return confirmationResult.confirm(verificationCode);
          })
          .then(function(result) {
              // Phone number verified and user signed in.
              console.log(result.user);
              // Redirect to dashboard or save user data to MongoDB
              saveUserData(result.user);
          })
          .catch(function(error) {
              console.error(error);
              // Handle errors here
          });
  }
});

  
// Forgot Password
document.getElementById('forgot-password').addEventListener('click', function() {
  var email = prompt("Please enter your email address:");
  if (email) {
      auth.sendPasswordResetEmail(email)
          .then(function() {
              alert('Password reset email sent.');
          })
          .catch(function(error) {
              console.log(error);
          });
  }
});

// Handle form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
  event.preventDefault();
  var username = event.target.username.value;
  var email = event.target.email.value;
  var password = event.target.password.value;

  auth.createUserWithEmailAndPassword(email, password)
      .then(function(userCredential) {
          var user = userCredential.user;
          console.log(user);
          // Save user data to MongoDB or backend API
          saveUserData(user);
      })
      .catch(function(error) {
          console.error('Error:', error);
      });
});

// Function to save user data
function saveUserData(user) {
  // Example: Send user data to backend API
  fetch('/api/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: user.displayName, email: user.email, uid: user.uid })
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
      // Redirect to dashboard or another page
      window.location.href = '../Dashboard/dashboard.html';
  })
  .catch(error => {
      console.error('Error:', error);
  });
}
