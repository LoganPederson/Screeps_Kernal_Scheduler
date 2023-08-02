const Process = require('./process');

class RepairerProcess extends Process {

  constructor(pid, data){
        super({id:pid, data:data, type:'RepairerProcess'}) // super is a special function that calls the constructor of the parent, in this case Process. 
        this.pid = pid,
        this.data = data, // creepName, // 
        this.type = 'RepairerProcess'
    }

    run() { 
        
        // Variables + Upgrade Info
        const room = Game.rooms[this.data.roomName];
        const spawn = room.find(FIND_MY_SPAWNS)[0]
        const buildingsBelow90 = room.find(FIND_STRUCTURES, {
            filter: function(element){
                return (((element.hits / element.hitsMax) < 0.9 && element.structureType === 'road' || element.structureType === 'container'))
            }
        })
        console.log(`buildings below 0.9 ${Object.values(buildingsBelow90)}`)
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
        // If energy, build
        if(buildingsBelow90.length > 0){
        const target = creep.pos.findClosestByRange(buildingsBelow90);
            

            // TODO : once target set, don't switch target until hits 100% - unless well, then stop at 10% unless no 10% then 20% etc. 
            if(target) {
                creep.memory.target = target
                if(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
                    if(creep.repair(target) === ERR_NOT_IN_RANGE) {
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

                // taget mmeory logic
            }
        }
    }   
}
RepairerProcess.type = 'RepairerProcess';
module.exports = RepairerProcess;