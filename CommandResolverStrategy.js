// Generic resolver strategy where a command factory can be registered
// and it will be selected. The factory must adhere to the following interface:
//      + boolean matches(msg) : returns 'true' if the message can be handled
//                               by commands created by this factory, or 'false'
//                               otherwise
//      + Command create(msg)  : returns a Command object for responding
var CommandResolverStrategy = function() {
    this._registeredFactories = [];
}


// Selects the appropriate Command object and returns it
// for the specified message. Returns null if there was no match.
CommandResolverStrategy.prototype.notify = function(msg) {
    // Try each factory
    for (let factory of this._registeredFactories) {
        if (factory.matches(msg)) {
            var command = factory.create(msg);
            command.execute();
        }
    };
};

// Registers the specified factory into the list
CommandResolverStrategy.prototype.register = function(factory) {
    if (factory === null) { throw new TypeError("factory cannot be null"); }
    if (factory === undefined) { throw new TypeError("factory cannot be undefined"); };

    this._registeredFactories.push(factory);
};

module.exports = CommandResolverStrategy;
