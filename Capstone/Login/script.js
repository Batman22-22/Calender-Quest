// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBqppTifuvWf98uJN5bSeIEcMtkg0rXEcc",
    authDomain: "calenderquest.firebaseapp.com",
    projectId: "calenderquest",
    storageBucket: "calenderquest.appspot.com",
    messagingSenderId: "973937610484",
    appId: "1:973937610484:web:f65149ac65eb06c81f98a1",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  const auth = firebase.auth();
  
  // Google Sign-In
  document.getElementById('google-login').addEventListener('click', function () {
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
      .then(function (result) {
        console.log(result.user);
        handleUser(result.user);
      })
      .catch(handleAuthError);
  });
  
  // Phone Sign-In
  document.getElementById('phone-login').addEventListener('click', function () {
    var phoneNumber = prompt("Please enter your phone number (in international format, e.g., +1234567890):");
    if (phoneNumber) {
      var appVerifier = new firebase.auth.RecaptchaVerifier('phone-login', {
        'size': 'invisible',
        'callback': function (response) {
          console.log("reCAPTCHA solved, allow signInWithPhoneNumber.");
        },
        'expired-callback': function () {
          console.log("reCAPTCHA expired. Please solve again.");
        }
      });
  
      auth.signInWithPhoneNumber(phoneNumber, appVerifier)
        .then(function (confirmationResult) {
          var verificationCode = prompt("Please enter the verification code sent to your phone:");
          return confirmationResult.confirm(verificationCode);
        })
        .then(function (result) {
          console.log(result.user);
          handleUser(result.user);
        })
        .catch(handleAuthError);
    }
  });
  
  // Forgot Password
  document.getElementById('forgot-password').addEventListener('click', function () {
    var email = prompt("Please enter your email address:");
    if (email) {
      auth.sendPasswordResetEmail(email)
        .then(function () {
          alert('Password reset email sent.');
        })
        .catch(handleAuthError);
    }
  });
  
  // Function to handle user data (replace with your own logic)
  function handleUser(user) {
    // Example: Save user data to sessionStorage or redirect to dashboard
    sessionStorage.setItem('user', JSON.stringify(user));
    window.location.href = '../Dashboard/dashboard.html';
  }
  
  // Function to handle authentication errors
  function handleAuthError(error) {
    console.error(error);
    alert('An error occurred: ' + error.message);
  }
  