const firebaseConfig = {
  apiKey: "AIzaSyAXdCVZuu6RnHWt74xj4UZKS72N6ezMMko",
  authDomain: "compta-plus-9b5cd.firebaseapp.com",
  projectId: "compta-plus-9b5cd",
  storageBucket: "compta-plus-9b5cd.firebasestorage.app",
  messagingSenderId: "195125249103",
  appId: "1:195125249103:web:2baec0a97eaa3fabdc563a",
  measurementId: "G-KBHF5BJVVE"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true }).catch(err => {
  if (err.code === 'failed-precondition') console.warn('Multi-onglets détecté');
  else if (err.code === 'unimplemented') console.warn('Navigateur non supporté');
});

auth.useDeviceLanguage();