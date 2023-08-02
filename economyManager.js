class economyManager{
    constructor(kernal){
        this.kernal = kernal
    }

    run(){
        this.evaluateSources();
        this.evaluate();
    }

    evaluate(){
        const rooms = Object.values(Game.rooms);
        rooms.forEach((room) => {
            // Initiate variables 
            const sources = room.find(FIND_SOURCES);
            const containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_CONTAINER,
            });
            const constructionSites = room.find(FIND_CONSTRUCTION_SITES);
            const controller = room.controller;
            const spawns = room.find(FIND_MY_SPAWNS);


            // Evaluate controller upgrades
            if (controller) {
                const progress = controller.progress / controller.progressTotal;
                if(room.memory.controller === undefined){
                    room.memory.controller = {}

                }
                if(room.memory.controller.upgraders === undefined){
                    room.memory.controller.upgraders = []
                }
                if (controller) {
                    // Initialize room.memory.upgraders

                    if(room.memory.controller.upgraders.length < 2){
                        const data = { 
                            roomName: room.name,
                            //kernal: processData.kernal,
                            controllerId: room.controller.id,
                            type: 'UpgraderProcess',
                        }
                        this.kernal.requestUpgrader(data);
                    }

                // Request an upgrader to work on the controller
                //this.kernel.requestUpgrader(controller);
                }
            }

            // Evaluate energy sources
            sources.forEach((source) => {
                    let sourceMemory = room.memory.sources[source.id]

                    // Evaluate containers nearby
                    const nearbyContainers = source.pos.findInRange(containers, 1);
                    if (nearbyContainers.length === 0) {
                        // Request construction of a container near the source
                        //this.kernel.requestConstruction(source.pos, STRUCTURE_CONTAINER);
                    }
                });
                
            // Evaluate builders
            if(room.find(FIND_CONSTRUCTION_SITES).length > 0){
                
                let strayBuilders = (room.find(FIND_MY_CREEPS, {
                    filter: function(object) {
                        return (object.memory.role === 'builder' && !object.memory.process) ;
                        }
                    }).length)

                if((room.find(FIND_MY_CREEPS, {
                    filter: function(object) {
                        return (object.memory.role === 'builder' && object.memory.process) ;
                        }
                    }).length < 1)){
                    const data = { 
                        roomName: room.name,
                        type: 'BuilderProcess',
                    }
                    this.kernal.requestBuilder(data);

                }
                else if (strayBuilders > 0){
                    const data = { 
                        roomName: room.name,
                        type: 'BuilderProcess',
                    }
                    this.kernal.requestBuilder(data)
                }
                else{
                    this.removeFromQueue('builder', room)
                }
            }
            // Evaluate Repair Creeps
            if((room.find(FIND_MY_CREEPS, {
                filter: function(object) {
                    return (object.memory.role === 'repairer' && object.memory.process) ;
                    }
                }).length < 1)){
                const data = { 
                    roomName: room.name,
                    type: 'RepairerProcess',
                }
                this.kernal.requestRepairer(data);

            }
            else{
                this.removeFromQueue('repairer', room)
            }
            // Evaluate Mules
            let strayMules = (room.find(FIND_MY_CREEPS, {
                filter: function(object) {
                    return (object.memory.role === 'mule' && !object.memory.process) ;
                    }
                }).length)

            if((room.find(FIND_MY_CREEPS, {
                filter: function(object) {
                    return (object.memory.role === 'mule') ;
                    }
                }).length <= 3)){

                let toLog = (room.find(FIND_MY_CREEPS, {
                    filter: function(object) {
                        return (object.memory.role === 'mule') ;
                        }
                    }).length)
                
                console.log(`number of mules: ${toLog}`) 
                console.log(`number of stray mules: ${strayMules}`)   
                const data = { 
                    roomName: room.name,
                    type: 'MuleProcess',
                }
                this.kernal.requestMule(data);

            }
            else if(strayMules > 0){
                const data = { 
                    roomName: room.name,
                    type: 'MuleProcess',
                }
                this.kernal.requestMule(data)
            }
            else{
                this.removeFromQueue('mule', room)
            }


    })

    }

    evaluateSources(){
        const rooms = Object.values(Game.rooms);
        rooms.forEach((room) =>{ // for each room controlled
            const sources = room.find(FIND_SOURCES);
            if (room.memory.sources === undefined){
                room.memory.sources = {}
            }
            let sourcesRequesting = 0
            sources.forEach((source)=>{// for each source
                // Initialize Memory
                if (room.memory.sources[source.id] === undefined){
                    room.memory.sources[source.id] = {
                        miners: [],
                        minerNeeded: false
                    }
                    console.log(`room.memory.sources[source.id] ${JSON.stringify(room.memory.sources[source.id])}`)
                }
                let sourceMemory = room.memory.sources[source.id]

                // Get Available Spaces

                const terrain = room.getTerrain();
                let x = source.pos.x;
                let y = source.pos.y;
                let availableSpaces = 0;
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        // Skip the center tile (source position)
                        if (dx === 0 && dy === 0) {
                            continue;
                        }
                
                        let newX = x + dx;
                        let newY = y + dy;
                
                        if (terrain.get(newX, newY) === 0 || terrain.get(newX, newY) === 2) {
                            availableSpaces++;
                        }
                    }
                }
                // Determine if more miners are needed
                if (sourceMemory.miners.length >0){
                    
                    let totalWorkBodyParts = 0
                    // Clean up memory if assigned creep is dead
                    for (let key in sourceMemory.miners){
                        console.log`Checking if miner alive for source ${source} - checking ${sourceMemory.miners[key]} - is creep alive? ${Game.creeps[sourceMemory.miners[key]]}`
                        if(!Game.creeps[sourceMemory.miners[key]]) {
                            if(sourceMemory.miners.length === 1){
                                sourceMemory.miners = []
                            }
                            console.log(`Miner ${sourceMemory.miners[key]} is not in Game.creeps!`)
                            sourceMemory.miners.splice(key, 1);
                            console.log(`After slicing, let's see if creep is still in sourceMemory.miners array: ${sourceMemory.miners[key]}`)
                            continue
                        }
                        // Calculate total WORK parts of miners currently assigned
                        let miner = Game.creeps[sourceMemory.miners[key]]
                        let minerBody = miner.body
                        for (let bodyPart in minerBody){
                            //console.log(`bodypart: ${miner.body[bodyPart]} stringified: ${JSON.stringify(miner.body[bodyPart])} and type: ${miner.body[bodyPart].type}`)
                            if (minerBody[bodyPart].type === 'work'){
                                totalWorkBodyParts++
                            }
                        }
                    } 
                    console.log(`total 'work' parts for source ${source} = ${totalWorkBodyParts}`)
                    
                    // 5 WORK parts required for efficient mining a single source
                    if (totalWorkBodyParts >= 5){
                        sourceMemory.minerNeeded = false
                        return
                    }
                    else if(sourceMemory.miners.length >= availableSpaces){
                        sourceMemory.minerNeeded = false;
                    }
                    else if(sourceMemory.miners.length < availableSpaces){
                        sourceMemory.minerNeeded = true;
                    }
                }
                // If no miners assigned to source
                else {
                    sourceMemory.minerNeeded = true;
                }
                if(sourceMemory.minerNeeded){
                    const processData = {
                        type: 'RequestMinerProcess',
                        roomName: room.name,
                        kernal: this.kernal,
                        sourceId: source.id,
                    }
                    console.log(`Requesting miner!`)
                    this.kernal.requestMiner(processData)
                    sourcesRequesting++ 
                }
            })

            if(sourcesRequesting === 0){
                this.removeFromQueue('miner', room)
            }
        })
    }
    removeFromQueue(creepRole, room){
        for(let index in room.memory.spawnQueue){
            if(room.memory.spawnQueue[index].memory.role === creepRole){
                room.memory.spawnQueue.splice(index)
            }
        }
    }       
}

module.exports = economyManager;