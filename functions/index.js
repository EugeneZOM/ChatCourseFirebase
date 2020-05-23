const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

const admin = require('firebase-admin');
admin.initializeApp();

exports.sendAdminNotification = functions.database.ref('/chat/{msgId}').onWrite(async (change) => {
    const msg = change.after.val();
    const tokens = [];


    const tokenRef = admin.database().ref('/users/');
    const snapshots = await tokenRef.once('value');
    snapshots.forEach((snapshot) => {
        console.log("Snapshot: ", snapshot.val());
        tokens.push(snapshot.val().token);
    });

    
    const payload = {
        webpush: {
            notification: {
                title: 'New message',
                body: `${msg.userName}: ${msg.content}`,
                icon: 'https://pwa-chat-e5003.web.app/images/icons/icon-128x128.png',
                tag: 'PWA-Chat_Notification',
                renotify: true
            }
        },
        tokens: tokens
    };

    console.log(msg);
    console.log(tokens);

    return admin.messaging().sendMulticast(payload).then((response) => {
        console.log("OK: ", response);
        console.log(response.responses[0].error);
        return true;
    }).catch((error) => {
        console.log("Error: ", error);
    });
});
