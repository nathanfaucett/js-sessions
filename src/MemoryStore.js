function MemoryStore() {
    this.database = {};
}

MemoryStore.prototype.get = function(id, callback) {
    var database = this.database;

    process.nextTick(function() {
        var store = database[id];

        if (store == null) {
            callback(new Error("MemoryStore.get(id, callback) no store found with id " + id));
        } else {
            callback(null, JSON.parse(store));
        }
    });

    return this;
};

MemoryStore.prototype.set = function(id, json, callback) {
    var database = this.database;

    process.nextTick(function() {
        database[id] = JSON.stringify(json);
        callback(null);
    });

    return this;
};

MemoryStore.prototype.destroy = function(id, callback) {
    var database = this.database;

    process.nextTick(function() {
        delete database[id];
        callback(null);
    });

    return this;
};


module.exports = MemoryStore;
