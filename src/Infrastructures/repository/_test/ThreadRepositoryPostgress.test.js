const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const PostThread = require('../../../Domains/threads/entities/postThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgress');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const PostedThread = require('../../../Domains/threads/entities/postedThread');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persiste create thread and return thread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      const postThread = new PostThread({
        title: 'Thread Title',
        body: 'Thread body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const postedThread = await threadRepositoryPostgres.addThread(postThread);

      const threads = await ThreadsTableTestHelper.findThreadsById(postedThread.id);

      expect(threads).toHaveLength(1);
      expect(postedThread).toStrictEqual(new PostedThread({
        id: 'thread-123',
        title: postedThread.title,
        owner: postedThread.owner,
      }));
    });

    describe('verifyThreadIsExist function', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.verifyThreadIsExist('unknown'))
          .rejects.toThrowError(NotFoundError);
      });

      it('should not throw NotFoundError when thread found by id', async () => {
        const threadId = 'thread-123';
        await UsersTableTestHelper.addUser({ id: 'user-123' });
        await ThreadsTableTestHelper.addThread({ id: threadId });
        const fakeIdGenerator = () => '123';
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        await expect(threadRepositoryPostgres.getThreadDetailById(threadId))
          .resolves.not.toThrowError(NotFoundError);
      });
    });

    describe('getThreadDetailById Function', () => {
      it('should throw NotFoundError when thread not found', async () => {
        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

        await expect(threadRepositoryPostgres.getThreadDetailById('unknown'))
          .rejects
          .toThrow(NotFoundError);
      });

      it('should get thread by thread id correctly', async () => {
        const threadData = {
          id: 'thread-123',
          title: 'Thread Title',
          body: 'Thread Body',
          owner: 'user-123',
          date: '2023-04-27T01:51:52.794+07:00',
        };

        const userData = {
          id: 'user-123',
          username: 'user-123',
        };

        await UsersTableTestHelper.addUser(userData);
        await ThreadsTableTestHelper.addThread(threadData);
        const fakeIdGenerator = () => '123';

        const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

        const thread = await threadRepositoryPostgres.getThreadDetailById(threadData.id);

        expect(thread).toBeDefined();
        expect(thread.id).toEqual(threadData.id);
        expect(thread.title).toEqual(threadData.title);
        expect(thread.body).toEqual(threadData.body);
        expect(thread.date).toEqual(threadData.date);
        expect(thread.username).toEqual(threadData.owner);
      });
    });
  });
});
