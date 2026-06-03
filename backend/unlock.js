const { pool } = require('./db/database');
pool.query('UPDATE users SET mb_locked=0 WHERE email=$1', ['napdjk@gmail.com'])
  .then(r => { console.log('done'); process.exit(); })
  .catch(e => { console.error(e); process.exit(1); });
