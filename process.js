class Process {
    constructor(processInfo) {
      this.id = processInfo.id;
      this.data = processInfo.data;
      this.type = processInfo.type;
      this.finished = false;
    }
  
    run() {
      // Implement logic for the specific process in a derived class
    }
  }
  
  module.exports = Process;