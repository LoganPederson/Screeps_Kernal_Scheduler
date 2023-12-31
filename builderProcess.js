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
        if(!Game.creeps[this.data.creepName]){
            this.finished = true;
            return
        }
        // Define creep once we know it's alive
        const creep = Game.creeps[this.data.creepName];

        // Initialize Process into Memory
        if(!creep.memory.process){
            creep.memory.process = this.pid
        }


        // 
        // Set construction_site priority by structureType property
        //
        const priority1 = room.find(FIND_CONSTRUCTION_SITES, {
            filter: function(object){
                return object.structureType === 'container'
            }
        });
        const priority2 = room.find(FIND_CONSTRUCTION_SITES, {
            filter: function(object){
                return object.structureType === 'extension'
            }
        });
        const priority3 = room.find(FIND_CONSTRUCTION_SITES);

        const determineTarget = function(){
            if(priority1 && priority1.length > 0){
                return creep.pos.findClosestByPath(priority1)
            }
            else if(priority2 && priority2.length > 0){  
                return creep.pos.findClosestByPath(priority2)
            }
            else if(priority3 && priority3.length > 0){  
                return creep.pos.findClosestByPath(priority3)
            }
        }
        const target = determineTarget()

        // If energy, build
        if(target) {
            console.log(target)
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