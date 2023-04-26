const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentsHandler = this.postCommentsHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentsHandler(request, h) {
    // const {id: userId} = request.auth.credentials
    // const [threadId] = request.params

    const { content } = request.payload;
    const { id: userId } = request.auth.credentials;
    const { threadId } = request.params;

    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({ content, userId, threadId });

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);

    return response;
  }

  async deleteCommentHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;

    const deleteCommmentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
    await deleteCommmentUseCase.execute({ threadId, commentId, userId });

    const response = h.response({ status: 'success' });
    response.code(200);
    return response;
  }
}

module.exports = CommentsHandler;
