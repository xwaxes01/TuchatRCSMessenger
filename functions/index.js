let functions = require('firebase-functions');

let admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

exports.sendNotification = functions.firestore.document('chatrooms/{chatRoomId}/messages/{messageId}')
    .onWrite((snap, context) => {

       let message = snap.after.data().messageBody;
        let messageSender = snap.after.data().senderName;
        let messageUserId = snap.after.data().userId;
        let chatRoomId = context.params.chatRoomId;

        let tokens = [];
        let chatRoomRef = admin.firestore().collection("chatrooms").doc(chatRoomId);

        /*try {
            const transaction = await admin.firestore().runTransaction(t => {
                const chatroom = await t.get(chatRoomRef);
                const usersArray = chatroom.data().chatMembers;
                usersArray.forEach(user_id => {
                    let userIdRef = admin.firestore().collection("tokens").doc(user_id);
                    const tokenDoc = await t.get(userIdRef);

                    if (tokenDoc.exists) {
                        let user_token = doc.data().token;
                        functions.logger.log('token: ', user_token);
                        tokens.push(user_token);
                    }
                });
            });




        } catch (error) {
            //All errors that can pop up from our await statements are caught here
            functions.logger.error('Await error: ', err);
        }*/

        return admin.firestore().runTransaction(t => {
            return t.get(chatRoomRef)
                .then(chatroom => {
                    const usersArray = chatroom.data().chatMembers;

                    let i;
                    for (i = 0; i < usersArray.length; i++) {

                    if(usersArray[i] != messageUserId){
                        let userIdRef = admin.firestore().collection("tokens").doc(usersArray[i]);
                        return t.get(userIdRef).then(doc => {
                            if (doc.exists) {
                                let user_token = doc.data().token;
                                functions.logger.log('token: ', user_token);
                                tokens.push(user_token);
                            }
                        })
                    }
                    }
                });
        }).then(() => {
            //If we are at this stage the transaction should have run successfully

            //Check if length of tokens evaluates to a truthy value (Is not empty)
            if (tokens.length ) {
                functions.logger.log("Construction the notification message.");
                const payload = {

                    data: {
                        data_type: "data_type_chat_message",
                        title: "Tuchat",
                        message: message,
                        sender_id: messageUserId,
                        sender_name: messageSender,
                        chatRoom_id: chatRoomId
                    }
                };
                const options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };
                return admin.messaging().sendToDevice(tokens, payload).catch(err => {
                    functions.logger.error('Messaging error: ', err);
                });
            } else {
                functions.logger.log('Tokens array is empty');
            }
        }).catch(err => {
            functions.logger.error('Transaction error: ', err);
        });
    });