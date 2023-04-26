const CreateNewComment = require('../CreateNewComment');

describe('a CreateNewComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'semburang',
    };

    // Action and Assert
    expect(() => new CreateNewComment(payload)).toThrowError('CREATE_NEW_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      threadId: 123,
      userId: {},
      content: true,
    };

    // Action and Assert
    expect(() => new CreateNewComment(payload)).toThrowError('CREATE_NEW_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create PostThread object correctly', () => {
    // Arrange
    const payload = {
      threadId: 'thread-123',
      userId: 'user-123',
      content: 'this is sparta',

    };

    // Action
    const createNewComment = new CreateNewComment(payload);

    // Assert
    expect(createNewComment).toBeInstanceOf(CreateNewComment);
    expect(createNewComment.threadId).toEqual(payload.threadId);
    expect(createNewComment.content).toEqual(payload.content);
    expect(createNewComment.userId).toEqual(payload.userId);
  });
});
