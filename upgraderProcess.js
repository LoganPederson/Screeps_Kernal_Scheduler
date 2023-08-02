const Process = require('./process');

class UpgraderProcess extends Process {

  constructor(pid, data){
        super({id:pid, data:data, type:'UpgraderProcess'}) // super is a special function that calls the constructor of the parent, in this case Process. 
        this.pid = pid,
        this.data = data, // creepName, // 
        this.type = 'UpgraderProcess'
    }

    run() { 
        
        // Variables + Upgrade Info
        const room = Game.rooms[this.data.roomName];
        const spawn = room.find(FIND_MY_SPAWNS)[0]
        const controller = room.controller;

        if(!Game.creeps[this.data.creepName]){
            this.finished = true;
            for(let key in room.memory.controller.upgraders){
                if(room.memory.controller.upgraders[key] === this.data.creepName){
                    room.memory.controller.upgraders.splice(key)
                    
                }
            }
            return
        }
        // Define creep once we know it's alive
        const creep = Game.creeps[this.data.creepName];
        
        // Initialize Process into Memory
        if(!creep.memory.process){
            creep.memory.process = this.pid
        }


        //
        // Check RCL (room controller level) and if 0, claim room
        //
        if(controller.level === 0){
            if(creep.claimController(controller) === ERR_NOT_IN_RANGE){
                creep.moveTo(controller)
            }
        }


        // If energy, upgrade
        if(creep.room.controller) {
            if(!creep.room.memory.controller.upgraders.includes(creep.name)){
                creep.room.memory.controller.upgraders.push(creep.name)
            }
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller);
                }
            }
            // Otherwise, withdraw from source --TODO: Add container logic
            else{
                if (creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
                }
            }
        }
        
    }   
}
UpgraderProcess.type = 'UpgraderProcess';
module.exports = UpgraderProcess;