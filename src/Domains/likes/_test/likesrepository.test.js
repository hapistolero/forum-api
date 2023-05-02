const LikesRepoistory = require('../likesrepository');

describe('LikesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const likesrepository = new LikesRepoistory();

    await expect(likesrepository.createLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesrepository.verifyLikeIsExist({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesrepository.deleteLike({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesrepository.getLikeCount({})).rejects.toThrowError('LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
