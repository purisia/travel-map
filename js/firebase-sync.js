// ═══ FIREBASE REAL-TIME SYNC ═══
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyBKGleE6L3U2wVhN6w7sqK-ko4o-W-E6Ek",
    authDomain: "travel-map-2e889.firebaseapp.com",
    databaseURL: "https://travel-map-2e889-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "travel-map-2e889",
    storageBucket: "travel-map-2e889.firebasestorage.app",
    messagingSenderId: "1026791703074",
    appId: "1:1026791703074:web:3151ab863ba2240fb9c07b"
  };

  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();
  var placesRef = db.ref('places');
  var deletedRef = db.ref('deletedIds');

  window.firebaseSync = {
    // Push entire dataset to Firebase (keyed by place id)
    push: function (data) {
      var obj = {};
      data.forEach(function (item) { obj[item.id] = item; });
      return placesRef.set(obj).then(function () {
        console.log('[Firebase] synced', data.length, 'places');
      }).catch(function (err) {
        console.warn('[Firebase] sync failed:', err);
      });
    },

    // Record a deleted ID so DEFAULT_DATA won't re-add it
    markDeleted: function (id) {
      return deletedRef.child(id).set(true);
    },

    // Read deleted IDs set
    readDeletedIds: function () {
      return deletedRef.once('value').then(function (snapshot) {
        var data = snapshot.val();
        return data ? new Set(Object.keys(data)) : new Set();
      });
    },

    // Listen for real-time changes
    listen: function (callback) {
      placesRef.on('value', function (snapshot) {
        var data = snapshot.val();
        if (data) {
          var arr = Array.isArray(data) ? data : Object.values(data);
          callback(arr);
        }
      });
    },

    // One-time read
    read: function () {
      return placesRef.once('value').then(function (snapshot) {
        var data = snapshot.val();
        if (!data) return null;
        return Array.isArray(data) ? data : Object.values(data);
      });
    },

    // Connection state listener
    onConnection: function (callback) {
      db.ref('.info/connected').on('value', function (snap) {
        callback(snap.val() === true);
      });
    }
  };
})();
