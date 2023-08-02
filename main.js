const Kernel = require("./kernal");
const scheduler = require("./scheduler");


module.exports.loop = function () {
    
    //Delete old creeps from memory
    for(var i in Memory.creeps) {
        if(!Game.creeps[i]) {
            delete Memory.creeps[i];
        }
    }

    const kernel = new Kernel();

    kernel.start();
}

