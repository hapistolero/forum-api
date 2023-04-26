/* eslint-disable camelcase */
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentsRepository');
const CreatedComment = require('../../Domains/comments/entities/CreatedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createComment(newComment) {
    const { content, threadId, userId } = newComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: `insert into  comments(id, content, thread_id, owner_id)
                    values($1, $2, $3, $4)
                    returning id, content, owner_id as owner`,
      values: [id, content, threadId, userId],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async getCommentById(id) {
    const query = {
      text: `select id, owner_id as owner from comments
                    where is_delete = false and id= $1
                    fetch first row only`,
      values: [id],
    };

    const result = await this._pool.query(query);
    await this.verifyIsCommentExist(id);
    return result.rows[0];
  }

  async getCommentByIdAndVerifyByUserId(id, userId) {
    const query = {
      text: `select id, owner_id as owner from comments
                    where is_delete = false and id= $1
                    fetch first row only`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }

    const { owner } = result.rows[0];
    if (owner !== userId) {
      throw new AuthorizationError('tidak dapat menghapus komen yang bukan milikmu');
    }

    return result.rows[0];
  }

  async getCommentByThreadId(threadId) {
    const query = {
      text: `select  comments.id, users.username, comments.date, comments.content, comments.is_delete as isDeleted                    
                    from comments
                    join users on comments.owner_id = users.id
                    where thread_id =$1 and reply_to is null
                    order by comments.date`,
      values: [threadId],
    };

    const resultComments = await this._pool.query(query);

    if (!resultComments.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
    return resultComments.rows;
  }

  async verifyIsCommentExist(id) {
    const query = {
      text: `select id from comments
                    where is_delete = false and id = $1
                    fetch first row only`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async deleteCommentById(id) {
    const query = {
      text: `UPDATE comments SET is_delete = true
                where  id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }

  async addReply(newReply) {
    const {
      content, threadId, commentId, userId,
    } = newReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: ` insert into comments (id, content, thread_id, reply_to, owner_id)
                    values($1, $2, $3, $4, $5)
                    returning id, content, owner_id as owner`,
      values: [id, content, threadId, commentId, userId],
    };

    const result = await this._pool.query(query);

    return new CreatedComment({ ...result.rows[0] });
  }

  async getReplies(threadId, commentId) {
    const query = {
      text: ` select comments.id, users.username, comments.date, comments.content, comments.is_delete as isDeleted, reply_to as reply_to
                 from comments 
                 join users on comments.owner_id = users.id
                 where thread_id = $1 and reply_to=$2
                 order by comments.date`,
      values: [threadId, commentId],
    };
    const resultReplies = await this._pool.query(query);
    return resultReplies.rows;
  }

  async getRepliesByThreadId(thread_id) {
    const query = {
      text: `
        
      SELECT comments.id, comments.content, comments.date, users.username, comments.is_delete
      FROM threads
      INNER JOIN comments ON threads.id = comments.thread_id
      INNER JOIN users ON comments.owner_id = users.id        
      WHERE comments.thread_id = $1 
      ORDER BY comments.date ASC`,
      values: [thread_id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('tidak ada reply');
    }

    return result.rows;
  }
}

module.exports = CommentRepositoryPostgres;
