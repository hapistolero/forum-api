const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const {
      threadId, commentId, replyId, userId,
    } = useCasePayload;

    await this._threadRepository.verifyThreadIsExist(threadId);
    await this._commentRepository.verifyIsCommentExist(commentId);
    const { owner } = await this._commentRepository.getCommentById(replyId);
    if (owner !== userId) {
      throw new AuthorizationError('tidak dapat menghapus reply yang bukan milikmu');
    }

    await this._commentRepository.deleteCommentById(replyId);
  }
}

module.exports = DeleteReplyUseCase;
