const PostThread = require('../../Domains/threads/entities/postThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const postThread = new PostThread(useCasePayload);
    return this._threadRepository.addThread(postThread);
  }
}

module.exports = AddThreadUseCase;
