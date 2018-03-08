// Message resolution strategy for sending a message to all registered handlers.
// This is typically useful for state information updates.
var AlwaysNotifyStrategy = function() {
    this._registeredHandlers = [];
}

AlwaysNotifyStrategy.prototype.register = function(handler) {
    if (handler == null) throw new TypeError("handler cannot be null");
    if (handler == undefined) throw new TypeError("handler cannot be undefined");
    this._registeredHandlers.push(handler);
}

AlwaysNotifyStrategy.prototype.notify = function(message) {
    this._registeredHandlers.forEach((handler) => handler.notify(message));
}

module.exports = AlwaysNotifyStrategy;
