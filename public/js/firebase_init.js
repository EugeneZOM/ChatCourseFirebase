var firebaseConfig = {
  apiKey: "AIzaSyBjV9M-Yvl8ffoqYFvYjNdV5NB-ZAYj5vU",
  authDomain: "pwa-chat-e5003.firebaseapp.com",
  databaseURL: "https://pwa-chat-e5003.firebaseio.com",
  projectId: "pwa-chat-e5003",
  storageBucket: "pwa-chat-e5003.appspot.com",
  messagingSenderId: "49804087554",
  appId: "1:49804087554:web:f590282701671aa7ef721b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth;
const database = firebase.database();
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BD3ihA1bJhbXIkpEzUJ9tWM4aOUZ81rb-jErL2VpCRdSph6K5USoGtg8OXgTgaKkPOK3Yv9H1GRqSIdVHAapC_I");


function sendTokenToServer(currentToken) {
  if(!isTokenSentToServer()) {
    console.log("Sending token to server...");
    setTokenSentToServer(true);

    const users = database.ref("users");
    const uData = {
      token: currentToken,
      uid: getUserID()
    };

    const result = users.push(uData);
    window.localStorage.setItem('tokenKey', result.key);
  } else {
    console.log("Token already sent to server so won't send it again unless it changes");
  }
}

function isTokenSentToServer() {
  return window.localStorage.getItem("sentToServer") === '1';
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function requestPermission() {
  console.log("Requesting permissions...");
  Notification.requestPermission().then((permission) => {
    if(permission === 'granted') {
      console.log('Notification permission granted');
    } else {
      console.log("Unable to get permission to notify.");
    }
  });
}

function deleteToken() {
  messaging.getToken().then((currentToken) => {
    messaging.deleteToken(currentToken).then(() => {
      console.log('Token deleted');
      setTokenSentToServer(false);
    }).catch((err) => {
      console.log("Unable to delete token ", err);
    });
  }).catch((err) => {
    console.log("Error retrieving Instance ID token. ", err);
  });
}






// Authorization's functions
function initFirebaseAuth() {
  // Listen on auth state changes
  auth().onAuthStateChanged(authStateObserver);
}
function signInWithGoogle() {
	let provider = new auth.GoogleAuthProvider();
	// Sign into Firebase using popup auth
	auth().signInWithPopup(provider).then((response) => {
		window.location.reload();
	});
}
function signOut() {
	// Sign out of Firebase
	auth().signOut();
	window.location.reload();
}
function isUserSignedIn() {
	return !!auth().currentUser;
}
function getUserID() {
	let uid = '';
	if( isUserSignedIn() )
		uid = auth().currentUser.uid;
	return uid;
}
function getUserName() {
	let userName = '';
	if( isUserSignedIn() )
		userName = auth().currentUser.displayName;
	return userName;
}
function getPhofilePicURL() {
	let photoURL = '';
	if( isUserSignedIn() )
		photoURL = auth().currentUser.photoURL;
	return photoURL;
}
