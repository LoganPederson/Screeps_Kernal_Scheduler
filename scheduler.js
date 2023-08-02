const Process = require('./process');
const HarvesterProcess = require('./harvesterProcess');
const UpgraderProcess = require('./upgraderProcess');
const BuilderProcess = require('./builderProcess');
const RepairerProcess = require('./repairerProcess');
const MuleProcess = require('./muleProcess');

class Scheduler {
    constructor() {
        if (!Memory.os){
            Memory.os = {}
        }
        if (!Memory.os.processTable) {
            Memory.os = {
                processTable: Object.create(null),
            };
        }
        this.processTable = Memory.os.processTable;
        this.instanceTable = {}
    }

    init(){
        this.logProcessTable();
    }

    run() {
        this.logProcessTable();
        for (let pid in this.processTable) {
            let processInfo = this.processTable[pid];
            const processClass = Scheduler.processClassMapping[processInfo.class]
            let processInstance = new Scheduler.processClassMapping[processInfo.class](pid, processInfo.data)
            this.instanceTable[pid] = processInstance;
            console.log(`Spawning and executing new processInstance: ${processInstance.id} of type ${processInstance.type}`)
            processInstance.run();
        if (processInstance.finished){
            delete this.processTable[pid];
            delete this.instanceTable[pid];
        }
        }
    }

    createProcess(processClass, data) {
        const pid = this.generatePID();
        const processInfo = {
        id: pid,
        class: processClass.type,
        data: data,
        };
        console.log('Creating process with id:', pid);
        this.processTable[pid] = processInfo;
        console.log('Creating processTable element:', this.processTable[pid].data.type);
        Memory.os.processTable[pid] = this.processTable[pid]

        return pid;
    }

    addProcess(process){
        const processInfo ={
            id: process.pid,
            
        }
        this.processTable[process.pid] = process.data
    }

    generatePID() {
        return Math.random().toString(36).substr(2, 9);
    }

    hasProcess(pid){
        if(this.processTable[pid]){
            return true
        }
        else{
            return false
        }
    }
    logProcessTable() {
        console.log('Process Table:');
        for (let pid in this.processTable) {
            const processInfo = this.processTable[pid];
            if (processInfo) {
                let processType = processInfo.type;
                console.log(`PID: ${pid}, processInfo Type: ${processInfo.data.type} + Data.keys: ${Object.keys(processInfo.data)}`);
            } else {
                console.log(`PID: ${pid}, Instance not found, Data: ${JSON.stringify(processInfo.data)}`);
            }
        }
    }

    logInstanceTable(){
        console.log('Instance Table:');
        for (let pid in this.instanceTable) {
            const instanceInfo = this.instanceTable[pid];
            if (instanceInfo) {
                let instanceType = instanceInfo.type;
                console.log(`PID: ${pid}, instanceInfo Type: ${instanceInfo.data.type} + Data.keys: ${Object.keys(instanceInfo.data)} + data.data ${instanceInfo.data.data} `);
            } else {
                console.log(`PID: ${pid}, Instance not found, Data: ${JSON.stringify(processInfo.data)}`);
            }
        }
    }

}

Scheduler.processClassMapping = {
    "HarvestProcess": HarvesterProcess,
    "UpgraderProcess": UpgraderProcess,
    "BuilderProcess": BuilderProcess,
    "RepairerProcess": RepairerProcess,
    "MuleProcess": MuleProcess
};

module.exports = Scheduler;