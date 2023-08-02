const Process = require('./process');

class MuleProcess extends Process {

  constructor(pid, data){
        super({id:pid, data:data, type:'MuleProcess'}) // super is a special function that calls the constructor of the parent, in this case Process. 
        this.pid = pid,
        this.data = data, // creepName, // 
        this.type = 'MuleProcess'
    }

    run() { 
        
        // Variables + Upgrade Info
        const room = Game.rooms[this.data.roomName];
        const spawn = room.find(FIND_MY_SPAWNS)[0]
        const controller = room.controller
        const containers = room.find(FIND_STRUCTURES, {
            filter: function(object){
                return (object.structureType === 'container')
            }
        })
        const containersWorthGetting = room.find(FIND_STRUCTURES, {
            filter: function(object){
                return (object.structureType === 'container' && object.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && (object.structureType === 'container' && controller.pos.getRangeTo(object) > 6))
            }
        })

        // dropoffs: spawn, extension, container within 5 of controller
        const droppOffs = room.find(FIND_STRUCTURES, {
            filter: function(object){
                return ((object.structureType === 'spawn' || object.structureType === 'extension' || (object.structureType === 'container' && controller.pos.getRangeTo(object) < 6)) && object.store.getUsedCapacity(RESOURCE_ENERGY) < object.store.getCapacity(RESOURCE_ENERGY))
            }
        })

        // pickups: containers less than 2 from a source
        const pickups = room.find(FIND_STRUCTURES, {
            filter: function(object){
                return (object.structureType === 'container' && controller.pos.getRangeTo(object) > 6) || object.structureType === 'storage'
            }
        })

        if(!Game.creeps[this.data.creepName]){
            this.finished = true;
            return
        }
        // Define creep once we know it's alive
        const creep = Game.creeps[this.data.creepName];
        const closestDropOff = creep.pos.findClosestByRange(droppOffs);
        const closestPickup = creep.pos.findClosestByRange(pickups)
        const closestContainer = creep.pos.findClosestByRange(containers);
        const closestContainerWorthGetting = creep.pos.findClosestByRange(containersWorthGetting);
        
        // Initialize Process into Memory
        creep.memory.process = this.pid
        // If dropoff and pickup exist, deposit if carrying
        if(closestDropOff && containers) {
            // If full - dropoff
            if(creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                if(creep.transfer(closestDropOff, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(closestDropOff);
                }
            }
            // If empty - pickup
            else if(closestPickup){
                if(creep.withdraw(closestPickup, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(closestContainerWorthGetting);
                }
            }
            else{
                creep.moveTo(spawn.pos.x,spawn.pos.y+3)
                // if(creep.withdraw(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                //     creep.moveTo(closestContainer);
                //     }
            }
        }
        
    }   
}
MuleProcess.type = 'MuleProcess';
module.exports = MuleProcess;