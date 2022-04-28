var dbPromise = idb.open('damageStore', 1, function(db) {
    if (!db.objectStoreNames.contains('damages')) {
        db.createObjectStore('damages', {keyPath: 'id'});
    }
    if (!db.objectStoreNames.contains('sync-damages')) {
        db.createObjectStore('sync-damages', {keyPath: 'id'});
    }   
});

function writeData(st, data) {
    return dbPromise
    .then(function(db) {
        var tx = db.transaction(st, 'readwrite'); //or readonly.... create transaction
        var store = tx.objectStore(st); //get store
        store.put(data); //write to store
        
        return tx.complete; //close transaction and save
    });
}

function readAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        });
}

function clearAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.clear();
            return tx.complete;
        });
}

function deleteItemFromData(st, id) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.delete(id);
            return tx.complete;
        })
        .then(function() {
            console.log('item deleted from indexeddb');
        });
}