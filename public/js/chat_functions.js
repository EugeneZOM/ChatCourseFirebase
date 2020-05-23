if(!isOffline)
  var fChat = database.ref('chat');		// Firebase Database Data
let iChat = null;						// IndexedDB Data
const amountOfMessages = 100;

// Chat functions
function printMessage(messageData) {
	own = messageData.uid == getUserID();	// Default value
	if(messageData.own) own = messageData.own;
	const chatArea = document.getElementById('chatArea');

	// Create elements
	const chatRow = document.createElement('div');
	const messageElement = document.createElement('div');
	const userName = document.createElement('p');
	const content = document.createElement('p');
	const dateTime = document.createElement('p');
	// Init classes elements
	chatRow.className = 'chatRow';
	messageElement.className = 'chatMessage '+((own)?'right':'left');
	userName.className = 'messageAuthor';
	content.className = 'messageContent';
	dateTime.className = 'messageDateTime';
	// Init content
	userName.innerHTML = messageData['userName'] || 'Anon';
	if(own) userName.innerHTML = 'You';
	content.innerHTML = messageData['content'];
	dateTime.innerHTML = dateTimeFromTimestamp(messageData['timestamp']);
	// Combine elements
	messageElement.append(userName, content, dateTime);
	chatRow.append(messageElement);
	chatArea.append(chatRow);
}

function scrollChat() {
	let chatArea = document.getElementById('chatArea');
	chatArea.scrollTop = chatArea.scrollHeight;
}

function chatMessageToDatabase(text) {
	if(!isUserSignedIn()) return;
	if(text.trim() == '' || !text) return;

	let messageData = {
		content: text,
		timestamp: Date.now(),
		uid: getUserID(),
		userName: getUserName()
	};

	fChat.push(messageData);
}

function initMessageListener() {
	fChat.limitToLast(amountOfMessages).on('child_added', (snapshot) => {
		printMessage(snapshot.val());
		scrollChat();
		// Save locally
		writeToIndexedDb('messages', snapshot.val(), snapshot.key);
	});
	fChat.limitToLast(amountOfMessages).once('value', (snapshots) => {
		document.getElementsByTagName('progress')[0].remove();
		syncWithIndexedDBChat(snapshots);
	});
}


// IndexedDB
function isAvailableLocalDB() {
	return !!iChat;
}

function initIndexedDBChat() {
	if(!('indexedDB' in window)) {
		console.log('[IndexedDB] Nope');
		return null;
	}

	const request = indexedDB.open('Chat', 1);

	request.onupgradeneeded = (event) => {
		iChat = request.result;

		iChat.onerror = function(event) {
			console.log('[IndexedDB] Error ', request.error);
		}
		if(event.oldVersion < 1) {
			let messagesOS = iChat.createObjectStore('messages');
		}
	};
	request.onsuccess = (event) => {
		console.log('[IndexedDB] Success');
		iChat = event.target.result;
	};
	request.onerror = (event) => {
		console.log('[IndexedDB] Error', request.error);
	};
}

function syncWithIndexedDBChat(snapshots) {
	if(!isAvailableLocalDB()) {
		console.log('[IndexedDB] Sync: No DB');
	}
	// Remove last session's messages
	iChat.transaction('messages', 'readwrite').objectStore('messages').clear();

	snapshots.forEach((snap) => {
		const key = snap.key;
		const value = snap.val();

		writeToIndexedDb('messages', value, key);
	});

	console.log('[IndexedDB] Sync: Done');
}

function writeToIndexedDb(objectStoreName, content, key) {
	if(!isAvailableLocalDB()) return false;

	const transaction = iChat.transaction(objectStoreName, 'readwrite');
	const store = transaction.objectStore(objectStoreName);

	// Mark OWN message
	if(isUserSignedIn() && content.uid == getUserID()) {
		content.own = true;
	}

	store.add(content, key);

	return transaction.complete;
}

function getAllSavedMessages(callback) {
	if(!isAvailableLocalDB()) return null;

	const transaction = iChat.transaction('messages', 'readonly');
	const store = transaction.objectStore('messages');

	const data = store.getAll();

	data.onsuccess = () => {
		callback(data.result);
	}
}
