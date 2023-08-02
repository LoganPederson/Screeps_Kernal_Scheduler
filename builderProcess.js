const Process = require('./process');

class BuilderProcess extends Process {

  constructor(pid, data){
        super({id:pid, data:data, type:'BuilderProcess'}) // super is a special function that calls the constructor of the parent, in this case Process. 
        this.pid = pid,
        this.data = data, // creepName, // 
        this.type = 'BuilderProcess'
    }

    run() { 
        
        // Variables + Upgrade Info
        const room = Game.rooms[this.data.roomName];
        const spawn = room.find(FIND_MY_SPAWNS)[0]
        const constructionSites = room.find(FIND_CONSTRUCTION_SITES)
        if(!Game.creeps[this.data.creepName]){
            this.finished = true;
            return
        }
        // Define creep once we know it's alive
        const creep = Game.creeps[this.data.creepName];
        const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        
        // Initialize Process into Memory
        if(!creep.memory.process){
            creep.memory.process = this.pid
        }
        // If energy, build
        if(target) {
            if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                if(creep.build(target) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);
                }
            }
            // Otherwise, withdraw from storage/spawn 
            else{
                // If storage, collect from storage
                let storages = room.find(FIND_MY_STRUCTURES,{
                    filter: function(object){
                        return object.structureType === STRUCTURE_STORAGE
                    }
                })
                if(storages.length > 0){
                    if(creep.withdraw(storages[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(storages[0]);
                        }
                }
                else if(creep.withdraw(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(spawn);
                }
            }
        }
        
    }   
}
BuilderProcess.type = 'BuilderProcess';
module.exports = BuilderProcess;