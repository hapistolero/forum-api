const AddThreadUseCase = require('../AddThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/threadsRepository');
const PostThread = require('../../../Domains/threads/entities/postThread');
const PostedThread = require('../../../Domains/threads/entities/postedThread');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Thread Title',
      body: 'Thread Body',
      owner: 'user-123',
    };

    const expectedAddedThread = new PostedThread({
      id: 'thread-123',
      title: useCasePayload.title,
      owner: useCasePayload.owner,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest.fn()
      .mockImplementation(() => Promise.resolve(new PostedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        owner: useCasePayload.owner,
        body: useCasePayload.body,
      })));

    const addThreadUseCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });

    const postedThread = await addThreadUseCase.execute(useCasePayload);

    expect(postedThread).toStrictEqual(expectedAddedThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(new PostThread({
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: useCasePayload.owner,
    }));
  });
});
