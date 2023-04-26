const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 201 and new comment', async () => {
      const requestPayload = {
        content: 'comment',
      };

      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-128';

      const accessToken = await ServerTestHelper.getAccessToken(userId);

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
      expect(responseJson.data.addedReply.owner).toBeDefined();
      expect(responseJson.data.addedReply.content).toEqual(requestPayload.content);
      expect(responseJson.data.addedReply.id).toContain('reply-');
    });

    it('should response 400 if thread payload not contain needed property',
      async () => {
        const requestPayload = {

        };

        const threadId = 'thread-123';
        const userId = 'user-123';

        const commentId = 'comment-123';

        const accessToken = await ServerTestHelper.getAccessToken(userId);

        await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
        await CommentTableTestHelper.addComment({ id: commentId, threadId });

        const server = await createServer(container);

        const response = await server.inject({
          method: 'POST',
          url: `/threads/${threadId}/comments/${commentId}/replies`,
          payload: requestPayload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(400);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('harus mengirimkan property yang dibutuhkan');
      });

    it('should response 400 if thread payload have wrong data type', async () => {
      const requestPayload = {
        content: 812928,
      };

      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';

      const accessToken = await ServerTestHelper.getAccessToken(userId);

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('property yang dibutuhkan harus string');
    });

    it('should response 404 if threadId not found', async () => {
      const requestPayload = {
        content: 'content',
      };

      const userId = 'user-123';

      const accessToken = await ServerTestHelper.getAccessToken(userId);

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xxx/comments/comment-xxx/replies',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },

      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should response 401 if without token', async () => {
      const requestPayload = {
        content: 'sembarang',
      };

      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';

      await ServerTestHelper.getAccessToken(userId);

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadId}/comments/${commentId}/replies`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });

  describe('when delete /threads/{threadId/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and successfully delete the reply', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';
      const accessToken = await ServerTestHelper.getAccessToken(userId);
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });
      await CommentTableTestHelper.addReply({
        id: replyId, commentId, threadId, userId,
      });
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });

    it('should response 403 if not reply owner',
      async () => {
        const threadId = 'thread-123';
        const userId = 'user-123';
        const commentId = 'comment-123';
        const replyId = 'reply-123';
        await ServerTestHelper.getAccessToken(userId);

        const accessToken = await ServerTestHelper.getAccessToken2('user-xxx', 'xxxuser');
        await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
        await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });
        await CommentTableTestHelper.addReply({
          id: replyId, commentId, threadId, userId,
        });
        const server = await createServer(container);

        // Action
        const response = await server.inject({
          method: 'DELETE',
          url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const responseJson = JSON.parse(response.payload);
        expect(response.statusCode).toEqual(403);
        expect(responseJson.status).toEqual('fail');
        expect(responseJson.message).toEqual('tidak dapat menghapus reply yang bukan milikmu');
      });

    it('should response 404 if reply not found', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';
      const replyId = 'reply-xxxx';

      const accessToken = await ServerTestHelper.getAccessToken(userId);
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });
    it('should response 404 if threadId not found', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const accessToken = await ServerTestHelper.getAccessToken(userId);

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread tidak ditemukan');
    });

    it('should respones 404 if commentId not found', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      const accessToken = await ServerTestHelper.getAccessToken(userId);

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan');
    });

    it('should response 401 if without token', async () => {
      const requestPayload = {
        content: 'comment',
      };

      const threadId = 'thread-123';
      const userId = 'user-123';
      const commentId = 'comment-123';
      const replyId = 'reply-123';

      await ServerTestHelper.getAccessToken(userId);

      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      await CommentTableTestHelper.addComment({ id: commentId, threadId, userId });
      await CommentTableTestHelper.addReply({
        id: replyId, commentId, threadId, userId,
      });

      const server = await createServer(container);

      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });
  });
});
