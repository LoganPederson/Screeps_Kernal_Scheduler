const room = Game.rooms[processData.roomName]
const mulesAvailable = room.find(FIND_MY_CREEPS, {
    filter: function(object) {
        return (!object.memory.process && object.memory.role === 'mule') ;
    }
});
let targetMule = mulesAvailable[0]    
// If unassigned mule, assign process
if(mulesAvailable.length > 0){
    const data = { 
        roomName: processData.roomName,
        type: 'MuleProcess',
        creepName: targetMule.name};

    this.scheduler.createProcess(MuleProcess, data);
    targetMule.memory.process = true
}
else{
    let muleInQueue = false
    for(let element in room.memory.spawnQueue){
        if(room.memory.spawnQueue[element].memory.role === 'mule'){
            muleInQueue = true;
        }
    }
    // Add Mule to Spawn Queue 
    if(room.memory.spawnQueue && !muleInQueue){
        room.memory.spawnQueue.push({
            body: [WORK,MOVE,CARRY],
            name: '--Mule'+(new Date().toLocaleTimeString()),
            memory: {
                role: 'mule',
            }
        })
    }
}