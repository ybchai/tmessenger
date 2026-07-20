const User = require('./user.model');

async function createUser(data) {
    return User.create(data);
}

module.exports = {
    createUser
};