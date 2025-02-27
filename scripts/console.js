const repl = require('repl');
const fs = require('fs');
const path = require('path');

// Setup any necessary environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Function to initialize the console
async function startConsole() {
  // Initialize Knex and Models
  const knex = require('../config/database');
  const { Model } = require('objection');
  Model.knex(knex);

  // Set up history file
  const historyFile = path.join(__dirname, '.node_repl_history');

  // Create REPL with history enabled
  const replServer = repl.start({
    prompt: 'app > ',
    useColors: true,
    historySize: 1000, // Set how many commands to remember
    async eval(cmd, context, filename, callback) {
      try {
        const result = await (async () => eval(`(async () => { ${cmd} })()`) )();
        callback(null, result);
      } catch (err) {
        callback(err);
      }
    }
  });

  // Load history from file if it exists
  try {
    if (fs.existsSync(historyFile)) {
      fs.readFileSync(historyFile, 'utf8')
        .split('\n')
        .reverse()
        .filter(line => line.trim())
        .forEach(line => replServer.history.push(line));
    }
  } catch (err) {
    console.warn('Failed to load history:', err);
  }

  // Save history to file on exit
  replServer.on('exit', () => {
    try {
      fs.writeFileSync(historyFile, replServer.history.slice().reverse().join('\n'));
      console.log('Exiting console...');
    } catch (err) {
      console.warn('Failed to save history:', err);
    }
    process.exit();
  });

  // Add knex to context
  replServer.context.knex = knex;
}

// Start the console
startConsole().catch(console.error);