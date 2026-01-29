// js/firebase_init.js
const firebaseConfig = {
    apiKey: "AIzaSyAdIgcBMOax7Y8x9hNsZeOismgxG8BY5Rc",
    authDomain: "project-8765280450807238941.firebaseapp.com",
    projectId: "project-8765280450807238941",
    storageBucket: "project-8765280450807238941.firebasestorage.app",
    messagingSenderId: "145763246899",
    appId: "1:145763246899:web:d1471cf8efe13cc3ecd446",
    measurementId: "G-5N2JGJ68FD"
};

// Initialize Firebase using the global `firebase` from compat UMD
var app = firebase.initializeApp(firebaseConfig);

// Expose auth and db on window for other classic scripts (optional convenience)
window.auth = firebase.auth();
window.db = firebase.firestore();

// Now other scripts can use firebase.auth(), firebase.firestore() or the globals above.