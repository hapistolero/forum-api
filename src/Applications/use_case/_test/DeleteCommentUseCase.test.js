const ThreadRepository = require('../../../Domains/threads/threadsRepository');
const CommentRepository = require('../../../Domains/comments/CommentsRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment ', async () => {
    const useCasePayload = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadIsExist = jest.fn(
      () => Promise.resolve(),
    );
    mockCommentRepository.verifyIsCommentExist = jest.fn(
      () => Promise.resolve(),
    );
    mockCommentRepository.getCommentByIdAndVerifyByUserId = jest.fn(
      () => Promise.resolve({ id: 'comment-123', owner: 'user-123' }),
    );
    mockCommentRepository.deleteCommentById = jest.fn(
      () => Promise.resolve(),
    );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadIsExist)
      .toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.getCommentByIdAndVerifyByUserId)
      .toBeCalledWith(useCasePayload.commentId, useCasePayload.userId);
    expect(mockCommentRepository.deleteCommentById)
      .toBeCalledWith(useCasePayload.commentId);
  });
});
