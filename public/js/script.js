const elemsForAuthed = document.getElementsByClassName('forAuthed');
const elemsForNotAuthed = document.getElementsByClassName('forNotAuthed');

document.getElementById('messageForm').addEventListener('submit', (e) => {
	e.preventDefault();

	let msgElement = document.getElementById('msg');
	chatMessageToDatabase(msgElement.value);
	msgElement.value = '';
	msgElement.focus();
});

document.getElementById('signIn').addEventListener('click', (e) => {
	e.preventDefault();

	signInWithGoogle();
});

document.getElementById('signOut').addEventListener('click', (e) => {
	e.preventDefault();

	signOut();
});

// Functions
function authStateObserver(user) {
	let photoURL = '';

	if(user) {
		// Authed
		console.log('[AuthObserver] Signed in');
		photoURL = getPhofilePicURL();

		for(let elem of elemsForAuthed) {
			elem.style.display = 'flex';
		}
		for(let elem of elemsForNotAuthed) {
			elem.style.display = 'none';
		}

		document.getElementById('notAuthedPanel').style.display = 'none';
		document.getElementById('authedPanel').style.display = 'flex';
		document.getElementById('msg').removeAttribute('disabled');
		document.getElementById('sendbtn').removeAttribute('disabled');
	} else {
		console.log('[AuthObserver] Unsigned');

    document.getElementById('chatArea').style.marginBottom = '0';
    document.getElementById('messageForm').style.display = 'none';

		const layout = document.getElementById('layoutForNotAuthed');

		layout.innerHTML = '<h2>You must be authorized to access this chat</h2>';

		if(isAvailableLocalDB()) {
			layout.innerHTML += '<p>or</p>';

			const watchButton = document.createElement('button');
			watchButton.innerHTML = 'Show last session';
			watchButton.addEventListener('click', (event) => {
				event.preventDefault();

				document.getElementsByClassName('coverContainer')[0].style.display = 'none';
				document.getElementsByClassName('mainContent')[0].style.display = 'flex';

				getAllSavedMessages((messages) => {
					document.getElementsByTagName('progress')[0].remove();
					for(let msg of messages)
						printMessage(msg);
				});
			})

			layout.appendChild(watchButton);
		}
	}
	document.getElementById('userPic').src = photoURL;
}

function dateTimeFromTimestamp(timestamp) {
	let date = new Date(timestamp);

	let year = date.getFullYear();
	let month = ("0" + (date.getMonth()+1)).substr(-2);
	let day = ("0" + date.getDate()).substr(-2);
	let hours = date.getHours();
	let minutes = ("0" + date.getMinutes()).substr(-2);
	let dateTime = `${day}.${month}.${year} ${hours}:${minutes}`;

	return dateTime;
}

initFirebaseAuth();
initIndexedDBChat();
initMessageListener();

// Register service worker
if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js').then((registration) => {
    messaging.useServiceWorker(registration);
    requestPermission();
    messaging.getToken().then((currentToken) => {
      if(currentToken) {
        sendTokenToServer(currentToken);
      } else {
        console.log("No Instance ID token available. Request permission to generate one.");
        setTokenSentToServer(false);
      }
    }).catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
      setTokenSentToServer(false);
    });

    messaging.onTokenRefresh(() => {
      messaging.getToken().then((refreshedToken) => {
        console.log("Token refreshed.");
        setTokenSentToServer(false);
        sendTokenToServer(refreshedToken);
      }).catch((err) => {
        console.log("Unable to retrieve refreshed token ", err);
      });
    });

		console.log('[ServiceWorker] Registration successful: ', registration);
	}, (err) => {
		console.log('[ServiceWorker] Registration failed: ', err);
	});
}
