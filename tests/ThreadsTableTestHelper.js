const pool = require('../src/Infrastructures/database/postgres/pool');

const threadsTableTestHelper = {

  async addThread({
    id = 'thread-123', title = 'Thread Title', body = 'Thread Body',
    owner = 'user-123', date = '2023-04-27 01:36:57.923284+07',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  async findThreadsById(id) {
    const query = {
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },

};

module.exports = threadsTableTestHelper;
