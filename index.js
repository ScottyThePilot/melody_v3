'use strict';
const { fork } = require('child_process');
const { makeLogEntry } = require('./src/core/modules/utils/logging.js');

function launch() {
  log('PARENT', 'Launching Bot...');

  const subprocess = fork('./src/melody.js');

  subprocess.on('exit', (code) => {
    log('PARENT', 'Child Exiting with Code: ' + code);
    if (code === 0) {
      log('PARENT', 'Relaunching in 10 Seconds...');
      setTimeout(launch, 10000);
    } else {
      process.exit();
    }
  });
}

launch();

function log(...args) {
  console.log(makeLogEntry(...args));
}
