/* eslint-disable no-unused-vars */
const pool = require('../src/Infrastructures/database/postgres/pool');
const { cleanTable } = require('./ThreadsTableTestHelper');

const LikesTableTestHelper = {

  async addLike({
    id = 'like-123', owner = 'user-123', commentId = 'comment-123',
  }) {
    const query = {
      text: 'INSERT INTO likes VALUES($1, $2, $3)',
      values: [id, owner, commentId],
    };

    await pool.query(query);
  },

  async findLikesByCommentIdAndOwner(commentId, owner) {
    const query = {
      text: 'select * from likes where comment_id =$1 and owner $2',
      values: [commentId, owner],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('delete from likes where 1=1');
  },

};

module.exports = LikesTableTestHelper;
