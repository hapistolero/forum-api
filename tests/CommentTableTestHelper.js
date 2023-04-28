const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentTableTestHelper = {

  async addComment({
    id = 'comment-1621821707',
    content = 'comment',
    date = '2023-04-27 01:36:57.923284+07',
    threadId = 'thread-123',
    userId = 'user-19109901',
    isDeleted = false,
  }) {
    const query = {
      text: 'insert into comments (id , content, date, thread_id, owner_id, is_delete) values ($1, $2, $3, $4, $5, $6)',
      values: [id, content, date, threadId, userId, isDeleted],

    };

    await pool.query(query);
  },

  async findCommentBydId(id) {
    const query = {
      text: 'select * from comments where id = $1',
      values: [id],
    };

    const result = await pool.query(query);

    return result.rows;
  },

  async addReply({
    id = 'reply-123', content = 'content', date = '2023-04-27 01:36:57.923284+07', threadId = 'thread-181982812',
    userId = 'user-1912812989', isDeleted = false, commentId = 'comment-1289819',
  }) {
    const query = {
      text: `insert into comments (id, content,date, thread_id, owner_id, reply_to, is_delete)
                    values($1, $2, $3, $4, $5, $6, $7)`,
      values: [id, content, date, threadId, userId, commentId, isDeleted],

    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('delete from comments where 1=1');
  },

};

module.exports = CommentTableTestHelper;
