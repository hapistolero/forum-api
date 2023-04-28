const CreatedComment = require('../../../Domains/comments/entities/CreatedComment');
const ThreadRepository = require('../../../Domains/threads/threadsRepository');
const CommentsRepository = require('../../../Domains/comments/CommentsRepository');
const NewReply = require('../../../Domains/comments/entities/NewReply');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'halo',
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const expectedReply = new CreatedComment({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    });

    const mockCommentRepository = new CommentsRepository();
    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.verifyThreadIsExist = jest.fn(() => Promise.resolve());
    mockCommentRepository.verifyIsCommentExist = jest.fn(() => Promise.resolve());

    mockCommentRepository.addReply = jest.fn(() => Promise.resolve(new CreatedComment({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    })));

    const addReplyUseCase = new AddReplyUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const createdReply = await addReplyUseCase.execute(useCasePayload);

    expect(createdReply).toStrictEqual(expectedReply);
    expect(mockThreadRepository.verifyThreadIsExist).toBeCalledWith(useCasePayload.threadId);
    expect(mockCommentRepository.verifyIsCommentExist).toBeCalledWith(useCasePayload.commentId);
    expect(mockCommentRepository.addReply).toBeCalledWith(new NewReply(useCasePayload));
  });
});
