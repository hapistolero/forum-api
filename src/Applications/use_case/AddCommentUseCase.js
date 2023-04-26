const CreateNewComment = require('../../Domains/comments/entities/CreateNewComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const createNewComment = new CreateNewComment(useCasePayload);

    await this._threadRepository.verifyThreadIsExist(createNewComment.threadId);
    return this._commentRepository.createComment(createNewComment);
  }
}

module.exports = AddCommentUseCase;
