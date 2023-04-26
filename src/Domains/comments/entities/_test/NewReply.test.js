const NewReply = require('../NewReply');

describe('a NewReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'new reply',
    };

    expect(() => new NewReply(payload)).toThrowError('NEW_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet type data specification', () => {
    const payload = {
      content: [],
      threadId: 123,
      commentId: 'comment',
      userId: 'user-1d',
    };

    expect(() => new NewReply(payload)).toThrowError(
      'NEW_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create newReply object correctly', () => {
    const payload = {
      content: 'New reply',
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const newReply = new NewReply(payload);

    expect(newReply.content).toEqual(payload.content);
    expect(newReply.threadId).toEqual(payload.threadId);
    expect(newReply.commentId).toEqual(payload.commentId);
    expect(newReply.userId).toEqual(payload.userId);
  });
});
