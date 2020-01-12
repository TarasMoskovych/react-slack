import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/storage';

firebase.initializeApp({
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
});

export const databases = {
  connected: () => firebase.database().ref('.info/connected'),
  storage: () => firebase.storage().ref(),
  timestamp: () => firebase.database.ServerValue.TIMESTAMP,

  // Custom
  channels: () => firebase.database().ref('channels'),
  messages: () => firebase.database().ref('messages'),
  presence: () => firebase.database().ref('presence'),
  privateMessages: () => firebase.database().ref('privateMessages'),
  user: () => firebase.auth().currentUser,
  users: () => firebase.database().ref('users'),
};

export default firebase;
