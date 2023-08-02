const Scheduler = require('./scheduler');
const CreepManager = require('./creepManager')
const EconomyManager = require('./economyManager');
const SpawnManager = require('./spawnManager');
const RequestMinerProcess = require('./requestMinerProcess')
const HarvesterProcess = require('./harvesterProcess')
const UpgraderProcess = require(`./upgraderProcess`)
const BuilderProcess = require('./builderProcess')
const RepairerProcess = require('./repairerProcess')
const MuleProcess = require('./muleProcess') 

class Kernel{
    constructor() {
        this.scheduler = new Scheduler();
        this.economymanager = new EconomyManager(this)
        this.SpawnManager = new SpawnManager(this)
        this.creepManager = new CreepManager(this)
    }

    start() {
        console.log(`------------------------------------------------`)
        console.log(`Kernal spinning up... initializing`)
        this.init();
        console.log(`Kernal starting main process!`)
        this.tick();
    }

    init() {
        this.scheduler.init()
    }

    tick() {
        // Run the Scheduler
        this.economymanager.run();
        this.SpawnManager.run();
        this.creepManager.run();
        this.scheduler.run();
    }


    registerProcess(ProcessClass, ...args){
        const pid = this.scheduler.generatePID();
        const process = new ProcessClass(pid, ...args);
        this.scheduler.createProcess(process);
        return pid;
    }

    evaluateGameState() {
        // Add logic to evaluate the game state and determine the number of processes needed for each category.
        // Example: Determine the number of Harvester processes needed.
        let numHarvestersNeeded = 5; // Replace with actual logic.
    
        // Create and register processes based on need.
        let processes = [];
        for (let i = 0; i < numHarvestersNeeded; i++) {
          let harvesterProcess = new HarvesterProcess(this.createPid());
          processes.push(harvesterProcess);
          this.scheduler.registerProcess(harvesterProcess);
        }
    
        // Identify available creeps and assign processes.
        let availableCreeps = this.creepManager.identifyAvailableCreeps();
        this.creepManager.assignProcesses(availableCreeps, processes);
      }
  
    requestMiner(processData) {
        const minersAvailable = this.creepManager.idenitfyAvailableMiners();
        const source = Game.getObjectById(processData.sourceId); 
        const room = Game.rooms[processData.roomName]
        let closestMiner = source.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: function(creep){
                return minersAvailable.includes(creep);
            }}
        );
        
        if(closestMiner){
            const data = { 
                roomName: processData.roomName,
                //kernal: processData.kernal,
                sourceId: processData.sourceId,
                type: 'HarvesterProcess',
                creepName: closestMiner.name};
                
            this.scheduler.createProcess(HarvesterProcess, data);
            closestMiner.memory.process = true
            source.room.memory.sources[processData.sourceId].miners.push(closestMiner.name)
        }
        else{
            let minerInQueue = false
            for(let element in room.memory.spawnQueue){
                if(room.memory.spawnQueue[element].memory.role === 'miner'){
                    minerInQueue = true;
                }
            }
            if(room.memory.spawnQueue && !minerInQueue){
                let body 
                if (room.find(FIND_MY_CREEPS).length > 0){ 
                    /* 
                    
                    Issue: 
                    
                    when first miner is created with starting 300 energy spawn1, 
                    while it is building a second miner is added to the queue of builders to build,
                    using the energy available instead of eneregy capacity because it appears as if there is no miners, despite
                    1 building

                    TempFix: Manully code a 1/1/1 miner




                    */ 
                    body = this.creepManager.createMinerBody(room.energyCapacityAvailable)
                }
                else{
                    body = this.creepManager.createMinerBody(200)
                }
                room.memory.spawnQueue.push({
                    body: body,
                    name: processData.sourceId+'--Miner'+(new Date().toLocaleTimeString()),
                    memory: {
                        role: 'miner',
                        source: processData.sourceId,
                    }
                })
            }
                // spawnCreep(body, name, [opts])
        }
    }


    requestUpgrader(processData) {
        const room = Game.rooms[processData.roomName]
        const controller = room.controller; 
        const availableUpgraders = room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return (!object.memory.process && object.memory.role === 'upgrader') ;
            }
        });
        const closestUpgrader = controller.pos.findClosestByPath(FIND_MY_CREEPS,{
            filter: function(creep){
                return availableUpgraders.includes(creep)
            }
        })
        let upgraderInQueue = false
        for(let element in room.memory.spawnQueue){
            if(room.memory.spawnQueue[element].memory.role === 'upgrader'){
                upgraderInQueue = true;
            }
        }

        if(availableUpgraders.length > 0){
            const data = { 
                roomName: processData.roomName,
                //kernal: processData.kernal,
                controllerId: processData.controllerId,
                type: 'UpgraderProcess',
                creepName: closestUpgrader.name
            }
            this.scheduler.createProcess(UpgraderProcess, data);
        }

        else{
            if(room.memory.spawnQueue && !upgraderInQueue){
                let body = this.creepManager.createMinerBody(room.energyCapacityAvailable)
                // Only push to queue if there are no other upgraders in queue
                    room.memory.spawnQueue.push({
                        body: body,
                        name: processData.controllerId+'--Upgrader'+(new Date().toLocaleTimeString()),
                        memory: {
                            role: 'upgrader'
                        }
                    })
            }
                // spawnCreep(body, name, [opts])
        }
    }

    requestBuilder(processData) {
        const room = Game.rooms[processData.roomName]
        const buildersAvailable = room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return (!object.memory.process && object.memory.role === 'builder') ;
            }
        });
        let targetBuilder = buildersAvailable[0]    
        // If unassigned builder, assign process
        if(buildersAvailable.length > 0){
            const data = { 
                roomName: processData.roomName,
                type: 'BuilderProcess',
                creepName: targetBuilder.name};
    
            this.scheduler.createProcess(BuilderProcess, data);
            // targetBuilder.memory.process = true
        }
        else{
            let builderInQueue = false
            for(let element in room.memory.spawnQueue){
                if(room.memory.spawnQueue[element].memory.role === 'builder'){
                    builderInQueue = true;
                }
            }
            let body = this.creepManager.createMinerBody(room.energyCapacityAvailable)
            // Add Builder to Spawn Queue 
            if(room.memory.spawnQueue && !builderInQueue){
                room.memory.spawnQueue.push({
                    body: body,
                    name: processData.room+'--Builder'+(new Date().toLocaleTimeString()),
                    memory: {
                        role: 'builder',
                    }
                })
            }
        }
    }

    requestRepairer(processData) {
        const room = Game.rooms[processData.roomName]
        const repairersAvailable = room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return (!object.memory.process && object.memory.role === 'repairer') ;
            }
        });
        let targetRepairer = repairersAvailable[0]    
        // If unassigned repairer, assign process
        if(repairersAvailable.length > 0){
            const data = { 
                roomName: processData.roomName,
                type: 'RepairerProcess',
                creepName: targetRepairer.name};
    
            this.scheduler.createProcess(RepairerProcess, data);
            targetRepairer.memory.process = true
        }
        else{
            let repairerInQueue = false
            for(let element in room.memory.spawnQueue){
                if(room.memory.spawnQueue[element].memory.role === 'repairer'){
                    repairerInQueue = true;
                }
            }
            // Add Repairer to Spawn Queue 
            if(room.memory.spawnQueue && !repairerInQueue){
                room.memory.spawnQueue.push({
                    body: [WORK,MOVE,CARRY],
                    name: processData.sourceId+'--Repairer'+(new Date().toLocaleTimeString()),
                    memory: {
                        role: 'repairer',
                    }
                })
            }
        }
    }
    requestMule(processData){
        const room = Game.rooms[processData.roomName]
        const mulesAvailable = room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return (!object.memory.process && object.memory.role === 'mule') ;
            }
        });
        // If unassigned mule, assign process
        if(mulesAvailable.length > 0){
            let targetMule = mulesAvailable[0]
            console.log(`targetMule: ${targetMule} name: ${targetMule.name}`)   
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
            let body = this.creepManager.createMuleBody(room.energyCapacityAvailable)
            if(room.memory.spawnQueue && !muleInQueue){
                room.memory.spawnQueue.push({
                    body: body,
                    name: '--Mule'+(new Date().toLocaleTimeString()),
                    memory: {
                        role: 'mule',
                    }
                })
            }
        }
    }
}

module.exports = Kernel;