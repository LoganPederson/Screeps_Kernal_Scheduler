const Process = require('./process');

class HarvestProcess extends Process {

  constructor(pid, data){
    super({id:pid, data:data, type:'HarvesterProcess'}) // super is a special function that calls the constructor of the parent, in this case Process. 
      this.pid = pid,
      this.data = data, // creepName, source, 
      this.type = 'HarvestProcess'
  }
  
  run() { 
    
    //
    // If creep assigned to process does not exist, remove process (TODO: transfer process if available creep/harvester)
    //
    
    if(!Game.creeps[this.data.creepName]){
        this.finished = true;
        return
      }

    //
    // Initialize variables
    //
    const creep = Game.creeps[this.data.creepName]
    const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS);
    const source = Game.getObjectById(this.data.sourceId)
    creep.memory.process = this.pid

    //
    // Add creep.name to sources.miners array if not present
    //

    if (!creep.room.memory.sources[this.data.sourceId].miners.find((element) => element === creep.name)){
      creep.room.memory.sources[this.data.sourceId].miners.push(creep.name)
      console.log(` Pushing to ${this.data.sourceId} ${creep.name}... ${JSON.stringify(creep.room.memory.sources[this.data.sourceId.miners])}`)
    }


    //
    // If not full, harvest
    //  
    if(creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
      //console.log(`creep ${creep.name} is not full, attempting to harvest from source: ${source}`)
      if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
      }
    }
    // If full, transfer to source -- TODO: Add container logic
    else{ 
      let containers = creep.room.find(FIND_STRUCTURES,{
        filter: function(object){
            return object.structureType === 'container'
        }
      })
      if(containers.length > 0){
        let closestContainer = creep.pos.findClosestByPath(containers)
        if(creep.transfer(closestContainer, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            let arrayHolder = [closestContainer]
            if(creep.transfer(creep.pos.findClosestByPath(arrayHolder), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE)
            creep.moveTo(creep.pos.findClosestByPath(arrayHolder));
            }
      }
      else if(creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(spawn);
      }
    }
      // Implement harvest process logic here


      
  }
}
HarvestProcess.type = 'HarvestProcess';
module.exports = HarvestProcess;