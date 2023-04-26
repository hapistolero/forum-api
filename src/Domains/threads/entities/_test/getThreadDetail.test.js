const GetThreadDetailById = require('../getThreadDetail');

describe('a GetThreadDetailById entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {

    };

    // Action and Assert
    expect(() => new GetThreadDetailById(payload)).toThrowError('GET_THREAD_DETAIL_BY_ID.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: {},
    };

    // Action and Assert
    expect(() => new GetThreadDetailById(payload)).toThrowError('GET_THREAD_DETAIL_BY_ID.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create GetDetailThreadById object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-123',
    };

    // Action
    const getThreadDetailById = new GetThreadDetailById(payload);

    // Assert
    expect(getThreadDetailById.id).toEqual(payload.id);
  });
});
