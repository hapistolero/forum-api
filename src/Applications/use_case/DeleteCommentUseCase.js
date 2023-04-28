class DeleteCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;
    await this._threadRepository.verifyThreadIsExist(threadId);
    await this._commentRepository.verifyIsCommentExist(commentId);
    await this._commentRepository.getCommentByIdAndVerifyByUserId(commentId, userId);

    await this._commentRepository.deleteCommentById(commentId);
  }
}

module.exports = DeleteCommentUseCase;
