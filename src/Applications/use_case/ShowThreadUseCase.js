/* eslint-disable no-restricted-syntax */
class ShowThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadDetailById(useCasePayload);
    const comments = await this._commentRepository.getCommentByThreadId(useCasePayload);
    const commentId = comments.map(
      (comment) => (comment.id),
    );
    const getReplies = await this._commentRepository.getReplies(useCasePayload, commentId);
    const validatedComments = this._validateDeletedComment(comments);
    const validatedReplies = this._validateDeletedReplies(getReplies);

    const commentWithReplies = this._addReplyToComment(validatedComments, validatedReplies);

    return {
      ...thread,
      comments: commentWithReplies,
    };
  }

  _validateDeletedComment(comments) {
    for (const comment of comments) {
      if (comment.isdeleted === true) {
        comment.content = '**komentar telah dihapus**';
      }
      delete comment.isdeleted;
    }

    return comments;
  }

  _validateDeletedReplies(replies) {
    for (const reply of replies) {
      if (reply.isdeleted === true) {
        reply.content = '**balasan telah dihapus**';
      }
      delete reply.isdeleted;
    }
    return replies;
  }

  _addReplyToComment(comments, replies) {
    for (const comment of comments) {
      comment.replies = [];

      for (const reply of replies) {
        if (reply.reply_to === comment.id) {
          comment.replies.push(reply);
        }
        delete reply.reply_to;
      }
    }
    return comments;
  }
}

module.exports = ShowThreadUseCase;
