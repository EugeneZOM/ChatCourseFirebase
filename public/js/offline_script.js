const elemsForAuthed = document.getElementsByClassName('forAuthed');
const elemsForNotAuthed = document.getElementsByClassName('forNotAuthed');

function init() {
	const layout = document.getElementById('layoutForNotAuthed');
  layout.innerHTML = '<h2>You must be online to access chat</h2>';

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

function getUserID() { return 0; }


initIndexedDBChat();
setTimeout(init, 1000);
