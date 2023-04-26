const NewReply = require('../../Domains/comments/entities/NewReply');

class AddReplyUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newReply = new NewReply(useCasePayload);

    await this._threadRepository.verifyThreadIsExist(newReply.threadId);

    await this._commentRepository.verifyIsCommentExist(newReply.commentId);

    return this._commentRepository.addReply(newReply);
  }
}

module.exports = AddReplyUseCase;
