// reset-db.js
const { exec } = require('child_process');

console.log('Resetting the database...');

// Drop the database, recreate it, and apply migrations
exec('npx prisma migrate reset --force', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(stdout);
  console.log('Database has been reset successfully!');

  // Optionally, you can run seed data after reset
  // exec('npx prisma db seed', (seedError, seedStdout, seedStderr) => { ... });
});
