
class CreepManager{

    constructor(kernal){
        this.kernal = kernal
    }

    run(){
        for(let creepName in Game.creeps){
            let creep = Game.creeps[creepName]
            if (creep.memory.processCompleted){
                delete creep.memory.process
                delete creep.memory.processCompleted
                console.log('After deleting memory: '+ creep.memory.processCompleted)
            }
            else if(creep.memory.process && !creep.memory.processCompleted){
                //console.log(this.kernal.scheduler.hasProcess(creep.memory.process))
            }
        }
    }
    identifyAvailableCreeps() {
        let availableCreeps = [];
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (!creep.memory.process || creep.memory.processCompleted && creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
                availableCreeps.push(creep);
            }
        }
        return availableCreeps;
      }

    idenitfyAvailableMiners() {
        let minersAvailable = []
        Object.values(Game.creeps).forEach((each)=>{
            let creep = Game.creeps[each.name]
            if (creep.memory.role === 'miner' && (!creep.memory.process || creep.memory.processCompleted)){
                console.log(`pushing ${creep.name} to minersAvailable`)
                minersAvailable.push(creep)
            }
        })
        console.log('miners available: '+minersAvailable)
        return(minersAvailable)
    }
    
    assignProcesses(availableCreeps, processes) {
        console.log('processes: '+processes)
        let index = 0;
        for (let process of processes) {
            console.log('----------------------------- '+process.data.creepName)
            let creep = Game.creeps[process.data.creepName];
            creep.memory.process = process.id;
            creep.memory.processCompleted = false;
            index++;
        }
    }

    createMinerBody(energy) {
        const workCost = 100;
        const moveCost = 50;
        const carryCost = 50;
      
        // Calculate the available energy after adding one CARRY part
        const availableEnergy = energy - (carryCost+moveCost);
      
        // Calculate the cost for a single set of WORK and MOVE parts
        const workAndMoveCost = workCost + moveCost;
      
        // Calculate the maximum number of WORK and MOVE parts that can be created with the available energy
        const numberOfWorkAndMove = Math.floor(availableEnergy / workAndMoveCost);
      
        // Initialize the body array with one CARRY part
        const body = [CARRY,MOVE];
      
        // Add the required WORK and MOVE parts
        for (let i = 0; i < numberOfWorkAndMove; i++) {
          body.push(WORK);
          body.push(MOVE);
        }
      
        return body;
      }
    
    createMuleBody(energy) {
        const moveCost = 50;
        const carryCost = 50;

        // Calculate the available energy after adding one CARRY part
        const availableEnergy = energy - (carryCost+moveCost);

        // Calculate the cost for a single set of WORK and MOVE parts
        const carryAndMoveCost = carryCost + moveCost;

        // Calculate the maximum number of WORK and MOVE parts that can be created with the available energy
        const numberOfCarryAndMove = Math.floor(availableEnergy / carryAndMoveCost);

        // Initialize the body array with one CARRY part
        const body = [CARRY,MOVE];

        // Add the required WORK and MOVE parts
        for (let i = 0; i < numberOfCarryAndMove; i++) {
        body.push(CARRY);
        body.push(MOVE);
        }
        
        return body;
    }




    getBodyCost(bodyArray){
    let bodyCost = 0
    console.log(`body Array: ${bodyArray}`)
    for(let part in bodyArray){
        if(bodyArray[part] === WORK){
            bodyCost = bodyCost+100
        }
        if(bodyArray[part]   === MOVE){
            bodyCost= bodyCost+50
        }
        if(bodyArray[part]   === CARRY){
            bodyCost= bodyCost+50
        }
        if(bodyArray[part]   === ATTACK){
            bodyCost= bodyCost+80
        }
        if(bodyArray[part]   === RANGED_ATTACK){
            bodyCost= bodyCost+150
        }
        if(bodyArray[part]   === HEAL){
            bodyCost= bodyCost+50
        }
        if(bodyArray[part]   === TOUGH){
            bodyCost= bodyCost+10
        }
        if(bodyArray[part]   === CLAIM){
            bodyCost= bodyCost+600
        }
    }
    console.log(`bodyCost = ${bodyCost}`)
    return bodyCost
    }
}

module.exports = CreepManager;