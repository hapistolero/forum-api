const CreateNewComment = require('../../../Domains/comments/entities/CreateNewComment');
const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const ThreadRepository = require('../../../Domains/threads/threadsRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'im fine',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentsRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadIsExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.createComment = jest.fn(() => Promise.resolve(new CreatedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    })));

    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const createdComment = await addCommentUseCase.execute(useCasePayload);

    expect(createdComment).toStrictEqual(new CreatedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    }));

    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.createComment)
      .toBeCalledWith(new CreateNewComment(useCasePayload));
  });
});
