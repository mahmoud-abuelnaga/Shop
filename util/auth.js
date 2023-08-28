// Packages
const Tokens = require('csrf');

// Constants
const tokens = new Tokens()

// Vars
let globalSecret;

exports.genGlobalSecret = async () => {
    globalSecret = await tokens.secret();
}

exports.getGlobalSecret = () => {
    return globalSecret;
}