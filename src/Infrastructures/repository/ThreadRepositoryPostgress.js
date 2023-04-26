const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ThreadRepository = require('../../Domains/threads/threadsRepository');
const PostedThread = require('../../Domains/threads/entities/postedThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(newThread) {
    const { title, body, owner } = newThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO THREADS VALUES($1, $2, $3, $4, $5) returning id, title, body, owner',
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);
    return new PostedThread(result.rows[0]);
  }

  async verifyThreadIsExist(threadId) {
    const query = {
      text: 'SELECT id from threads where id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('thread tidak ditemukan');
    }
  }

  async getThreadDetailById(threadId) {
    const query = {
      text: `
            SELECT threads.id, threads.title, threads.body, threads.date, users.username
            from threads
            inner join users ON threads.owner = users.id
            where threads.id =$1`,
      values: [threadId],

    };

    const result = await this._pool.query(query);
    if (result.rows < 1) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
