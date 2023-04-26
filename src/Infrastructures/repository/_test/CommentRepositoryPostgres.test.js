const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const CreateNewComment = require('../../../Domains/comments/entities/CreateNewComment');
const NewReply = require('../../../Domains/comments/entities/NewReply');
const threadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return created comment correctly', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'thread-user' });
      await ThreadsTableTestHelper.addThread({
        id: threadId, title: 'thread-title', body: 'yayaya', userId,
      });

      const createNewComment = new CreateNewComment({
        content: 'new comment',
        threadId,
        userId,
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.createComment(createNewComment);

      const comments = await CommentTableTestHelper.findCommentBydId('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return created comment correctly', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'thread-user' });
      await ThreadsTableTestHelper.addThread({
        id: threadId, title: 'thread-title', body: 'oke fine', userId,
      });

      const newComment = new CreateNewComment({
        content: 'comment',
        threadId,
        userId,

      });
      const fakeIdGenerator = () => '1292109';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const createdComment = await commentRepositoryPostgres.createComment(newComment);

      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'comment-1292109',
        content: 'comment',
        owner: userId,

      }));
    });
  });

  describe('getCommentById function', () => {
    it('should throw error when not found any comments', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.getCommentById('unknown')).rejects.toThrow(NotFoundError);
    });

    it('should not throw anything when found', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-192091331';
      await UsersTableTestHelper.addUser({ id: userId, username: 'threadusernew' });
      await ThreadsTableTestHelper.addThread({ id: userId, username: 'thread-user' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'oke fine', threadId, userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const foundedComment = await commentRepositoryPostgres.getCommentById(commentId);

      expect(foundedComment).toStrictEqual({
        id: commentId,
        owner: userId,
      });
    });
  });

  describe('getCommentByIdAndVerifyByUserIdfunction', () => {
    it('should throw error when not found any comments', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.getCommentByIdAndVerifyByUserId('unknown')).rejects.toThrow(NotFoundError);
    });
    it('should throw authorization error when comment owner is not same with user id', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-1091028';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user-name' });
      await ThreadsTableTestHelper.addThread({ id: userId, username: 'user-name' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'yoman', threadId, userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.getCommentByIdAndVerifyByUserId(commentId, 'user-xxx')).rejects.toThrow(AuthorizationError);
    });

    it('should not throw anything when found', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-1920913312';
      await UsersTableTestHelper.addUser({ id: userId, username: 'threadusernew' });
      await ThreadsTableTestHelper.addThread({ id: userId, username: 'thread-user' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'oke fine', threadId, userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const foundedComment = await commentRepositoryPostgres
        .getCommentByIdAndVerifyByUserId(commentId, userId);

      expect(foundedComment).toStrictEqual({
        id: commentId,
        owner: userId,
      });
    });
  });

  describe('verifyCommentExist function', () => {
    it('should throw error when not found any comments', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.verifyIsCommentExist('unknown')).rejects.toThrow(NotFoundError);
    });

    it('should not throw anything when found', async () => {
      const userId = 'user-123';
      const threadId = 'thread-123';
      const commentId = 'comment-124';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: threadId, title: 'thread-title', body: 'im fine' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'oke fine', threadId, userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres
        .verifyIsCommentExist(commentId)).resolves.not.toThrow();
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      return expect(commentRepositoryPostgres.deleteCommentById('okeke'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should delete comment by id and return success correctly', async () => {
      const commentId = 'comment-192092091';
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentTableTestHelper.addComment({ id: commentId });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteCommentById(commentId);

      const comments = await CommentTableTestHelper.findCommentBydId(commentId);
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toEqual(true);
    });
  });

  describe('addreply function', () => {
    it('should persist new reply and return created comment correctly', async () => {
      const userId = 'user-91209288786701';
      const threadId = 'thread-81298881212';
      const commentId = 'comment-912792112989';
      await UsersTableTestHelper.addUser({ id: userId, username: 'newUser' });
      await ThreadsTableTestHelper.addThread({
        id: threadId, title: 'thread-title', body: 'im fine', owner: userId,
      });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });

      const newReply = new NewReply({
        content: 'new Reply',
        threadId,
        commentId,
        userId,
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addReply(newReply);

      const comment = await CommentTableTestHelper.findCommentBydId('reply-123');
      expect(comment).toHaveLength(1);
    });

    it('should return created comment correctly', async () => {
      const userId = 'user-9128291892';
      const threadId = 'thread-9128128';
      const commentId = 'comment-81298129';
      await UsersTableTestHelper.addUser({ id: userId, username: 'newUser' });
      await threadsTableTestHelper.addThread({
        id: threadId, title: 'thread-title', body: 'im fine', owner: userId,
      });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });

      const newReply = new NewReply({
        content: 'add reply',
        threadId,
        commentId,
        userId,
      });

      const fakeIdGenerator = () => '321';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const createdComment = await commentRepositoryPostgres.addReply(newReply);

      expect(createdComment).toStrictEqual(new CreatedComment({
        id: 'reply-321',
        content: 'add reply',
        owner: userId,
      }));
    });
  });
  describe('getCommentByThreadId', () => {
    it('should throw not found error when comment is not exist by thread id', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.getCommentByThreadId('unknown')).rejects.toThrow(NotFoundError);
    });
    it('should not throw anything when found', async () => {
      const userId = 'user-123';
      const threadId = 'thread-124';
      const commentId = 'comment-192091321';
      await UsersTableTestHelper.addUser({ id: userId, username: 'threadusernew' });
      await ThreadsTableTestHelper.addThread({ id: userId, username: 'thread-user' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'oke fine', threadId, userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const foundedComment = await commentRepositoryPostgres.getCommentByThreadId(threadId);
      const {
        date, isdeleted,
      } = foundedComment[0];

      expect(foundedComment).toStrictEqual([{
        id: commentId,
        username: 'threadusernew',
        date,
        content: 'oke fine',
        isdeleted,
      }]);
    });
  });

  describe('GetReplies function', () => {
    it('should return reply correctly', async () => {
      const replyId = 'reply-123e4';
      const userId = 'user-123';
      const threadId = 'thread-132';
      const commentId = 'comment-19209a1321';

      await UsersTableTestHelper.addUser({ id: userId, username: 'threadusernew1' });
      await ThreadsTableTestHelper.addThread({ id: userId, username: 'threadusernew1' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'oke fine', threadId, userId,
      });
      await CommentTableTestHelper.addReply({
        id: replyId,
        content: 'wuhan',
        threadId,
        commentId,
        userId,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const replies = await commentRepositoryPostgres.getReplies(threadId, commentId);
      const { date, isdeleted } = replies[0];

      expect(replies).toStrictEqual([
        {
          id: replyId,
          username: 'threadusernew1',
          date,
          content: 'wuhan',
          isdeleted,
          reply_to: commentId,

        },
      ]);
    });
  });

  describe('get replies by thread id', () => {
    it('should throw not found error when comment is not exist by thread id', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(commentRepositoryPostgres.getRepliesByThreadId('unknown')).rejects.toThrow(NotFoundError);
    });
    it('should return reply by thread id correctly', async () => {
      const replyId = 'reply-19102920';
      const userId = 'user-123';
      const threadId = 'thread-129';
      const commentId = 'comment-890';

      await UsersTableTestHelper.addUser({ id: userId, username: 'threadusernew1' });
      await ThreadsTableTestHelper.addThread({ id: threadId, username: 'threadusernew1' });
      await CommentTableTestHelper.addComment({
        id: commentId, content: 'oke fine', threadId, userId,
      });

      await CommentTableTestHelper.addReply({
        id: 'reply-19102920',
        content: 'wuhan',
        threadId: 'thread-129',
        userId: 'user-123',
        commentId: 'comment-890',

      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const replies = await commentRepositoryPostgres.getRepliesByThreadId(threadId);

      // eslint-disable-next-line camelcase
      const { date } = replies[0];
      const { date: date1 } = replies[1];

      expect(replies).toStrictEqual([
        {
          id: commentId,
          username: 'threadusernew1',
          date,
          content: 'oke fine',
          is_delete: false,

        },
        {
          id: replyId,
          username: 'threadusernew1',
          date: date1,
          content: 'wuhan',
          is_delete: false,

        },
      ]);
    });
  });
});
