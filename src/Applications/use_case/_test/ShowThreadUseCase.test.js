const ShowThreadUseCase = require('../ShowThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/threadsRepository');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');

describe('ShowThreadUseCase', () => {
  it('should orchestrating the show thread action correctly', async () => {
    const useCasePayload = 'Thread-123';
    const expectedThread = {
      id: 'Thread-123',
      title: 'Thread title',
      body: 'Thread Body',
      username: 'user-123',
      date: '2023-03-29 01:49:02.094672+07',
    };

    const expectedComments = [
      {
        id: 'comment-776',
        username: 'user-123',
        date: ' 2023-03-29 01:49:02.094672+07',
        content: 'comment1',
        isdeleted: false,
      },
      {
        id: 'comment-777',
        username: 'user-123',
        date: ' 2023-03-29 01:49:02.094672+07',
        content: 'comment2',
        isdeleted: true,
      },
    ];

    const expectedReplies = [
      {
        id: 'reply-123',
        content: 'reply',
        date: '2023-03-29 01:49:02.094672+07',
        username: 'user-123',
        isdeleted: false,
        reply_to: 'comment-776',

      },
      {
        id: 'reply-124',
        content: 'reply2',
        date: '2023-03-29 01:49:02.094672+07',
        username: 'user-123',
        isdeleted: true,
        reply_to: 'comment-776',

      },
    ];
    const expectedShownThread = {
      id: 'Thread-123',
      title: 'Thread title',
      body: 'Thread Body',
      date: '2023-03-29 01:49:02.094672+07',
      username: 'user-123',
      comments: [
        {
          id: 'comment-776',
          username: 'user-123',
          date: ' 2023-03-29 01:49:02.094672+07',
          replies: [
            {
              content: 'reply',
              date: '2023-03-29 01:49:02.094672+07',
              id: 'reply-123',
              username: 'user-123',
            },
            {
              content: '**balasan telah dihapus**',
              date: '2023-03-29 01:49:02.094672+07',
              id: 'reply-124',
              username: 'user-123',
            },
          ],
          content: 'comment1',
        },
        {
          id: 'comment-777',
          username: 'user-123',
          date: ' 2023-03-29 01:49:02.094672+07',
          replies: [],
          content: '**komentar telah dihapus**',
        },
      ],

    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentsRepository();

    mockThreadRepository.getThreadDetailById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockCommentRepository.getCommentByThreadId = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    mockCommentRepository.getReplies = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReplies));

    const showThreadUseCase = new ShowThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const shownThread = await showThreadUseCase.execute(useCasePayload);

    expect(shownThread).toStrictEqual(expectedShownThread);
    expect(mockThreadRepository.getThreadDetailById).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getCommentByThreadId).toBeCalledWith(useCasePayload);
    expect(mockCommentRepository.getReplies).toBeCalledWith(useCasePayload, expectedComments[0].id);
  });
});
