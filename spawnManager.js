class SpawnManager{
    constructor(kernal){
        this.kernal = kernal
    }

    run(){
        for (const roomName in Game.rooms){
            const room = Game.rooms[roomName];

            if (!room.memory.spawnQueue) {
                room.memory.spawnQueue = [];
                }

            const spawnQueue = room.memory.spawnQueue;
            const spawns = room.find(FIND_MY_SPAWNS);

            spawns.forEach((spawn) => {
                //
                // Recover Mode Check
                // -- Spawn miner if none exist work/move/carry
                //
                if (!spawn.spawning && spawnQueue.length > 0) {
                    console.log(room.find(FIND_MY_CREEPS, {
                        filter: function(object){
                            return object.role === 'miner'
                        }
                    }).length === 0 && !spawn.spawning)



                    if(room.energyAvailable >= 200 && room.find(FIND_MY_CREEPS, {
                        filter: function(object){
                            return object.role === 'miner'
                        }
                    }).length == 0 && !spawn.spawning){
                        console.log('test2')
                        spawn.spawnCreep([WORK,CARRY,MOVE], 'EmergencyMiner', {memory: {role: 'harvester'}})
                    }

                    // prioritize miners and mules
                    let index = 0
                    for(let element in room.memory.spawnQueue){
                        if(room.memory.spawnQueue[element].memory.role === 'miner'){
                            let bodyCost = this.kernal.creepManager.getBodyCost(room.memory.spawnQueue[element].body)
                
                            if(room.energyAvailable >= bodyCost){
                            this.spawnCreep(spawn, room.memory.spawnQueue[element])
                            room.memory.spawnQueue.splice(index, 1)
                            }
                            return
                        }
                        if(room.memory.spawnQueue[element].memory.role === 'mule'){
                            this.spawnCreep(spawn, room.memory.spawnQueue[element])
                            room.memory.spawnQueue.splice(index, 1)
                            return
                        }
                        index++
                    }
                    // spawn next in queue if top priorities met AND there exists a miner && mule
                    if(room.energyAvailable > 200){
                    const creepRequest = spawnQueue.shift();
                    this.spawnCreep(spawn, creepRequest);
                    }
                }
              });
        }
    }

    spawnCreep(spawn, creepRequest){
        // Spawn the creep
        const result = spawn.spawnCreep(creepRequest.body, creepRequest.name, {memory:creepRequest.memory} );
        if (result === OK) {
        console.log(`Spawned ${creepRequest.name}`);
        } 
        else {
        console.log(`Failed to spawn ${creepRequest.name} with error code: ${result}`);
        }

    }
}

module.exports = SpawnManager;