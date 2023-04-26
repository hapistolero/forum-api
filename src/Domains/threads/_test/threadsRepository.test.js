const ThreadRepository = require('../threadsRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const threadsRepository = new ThreadRepository();

    // Action and Assert
    await expect(threadsRepository.addThread({})).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.verifyThreadIsExist('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(threadsRepository.getThreadDetailById('')).rejects.toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
