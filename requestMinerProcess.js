const HarvestProcess = require("./harvesterProcess");
const Process = require("./process");

class RequestMinerProcess extends Process {
    constructor(pid, data){
        super({id:pid, data:data, type:'RequestMinerProcess'})
        this.pid = pid
        this.data = data
        this.roomName = data.roomName
        this.sourceId = data.sourceId
        this.kernal = data.kernal


    }

    run() {
        //const { roomName, sourceId } = this.data;
        const room = Game.rooms[this.roomName]
        const source = Game.getObjectById(this.sourceId);
        let minersAvailable = [];
        for (let name in Game.creeps) {
            let creep = Game.creeps[name];
            if (!creep.memory.process || creep.memory.processCompleted && creep.memory.role === 'miner' && !creep.spawning) {
                minersAvailable.push(creep);
            }
        }

        if (!room || !source) return;
        
        if (minersAvailable.length > 0){
            let source = Game.getObjectById(this.sourceId);
            let closestMiner = source.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(creep){
                    return minersAvailable.includes(creep);
                }}
            );
            console.log('CLOSEST MINER ===== '+closestMiner.name)
            let processData = {
                creepName: closestMiner.name,
                sourceId: this.sourceId,
                type: 'HarvestProcess',    
                roomName: this.roomName
            }
            console.log('Selected miner:', closestMiner.name);
            const minerPID = this.kernal.scheduler.createProcess(HarvestProcess, processData)
            console.log('Created HarvestProcess with pid:', minerPID);
            //console.log('ProcessTable with minerPID = '+this.kernal.scheduler.processTable[minerPID].class)

            
        }
        else{
            if(room.memory.spawnQueue){
                room.memory.spawnQueue.push({
                    body: [WORK,MOVE,CARRY],
                    name: this.pid+'--Miner',
                    memory: {
                        role: 'miner',
                        source: this.sourceId,
                    }
                })
                this.finished = true;
            }
                // spawnCreep(body, name, [opts])
    }
    }
}


module.exports = RequestMinerProcess;