const Message = require('./message.model');

async function createMessage(data) {
    return Message.create(data);
}

module.exports = {
    createMessage
}