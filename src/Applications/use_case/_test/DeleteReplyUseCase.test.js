const AuthorizatonError = require('../../../Commons/exceptions/AuthorizationError');
const ThreadRepository = require('../../../Domains/threads/threadsRepository');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      userId: 'user-123',
    };

    const mockCommentRepository = new CommentsRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadIsExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyIsCommentExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({
        id: useCasePayload.replyId,
        owner: useCasePayload.userId,
      }));

    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteReplyUseCase.execute(useCasePayload)).resolves.not.toThrow();
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyIsCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.getCommentById).toBeCalledWith(useCasePayload.replyId);
    expect(mockCommentRepository.deleteCommentById).toBeCalledWith(useCasePayload.replyId);
  });

  it('should throw authorization error when owner is false', async () => {
    const useCasePayload = {
      threadId: 'thread-321',
      commentId: 'comment-321',
      replyId: 'reply-321',
      userId: 'user-321',
    };

    const mockCommentRepository = new CommentsRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadIsExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyIsCommentExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.getCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve({ id: 'comment-xxx', owner: 'user-xxx' }));
    mockCommentRepository.deleteCommentById = jest.fn(() => Promise.resolve());

    const deleteReplyUseCase = new DeleteReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    await expect(deleteReplyUseCase.execute(useCasePayload)).rejects.toThrow(AuthorizatonError);
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyIsCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.getCommentById).toBeCalledWith(useCasePayload.replyId);
    expect(mockCommentRepository.deleteCommentById).not.toBeCalled();
  });
});
