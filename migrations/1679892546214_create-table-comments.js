exports.up = (pgm) => {
  pgm.createTable(
    'comments', {
      id: {
        type: 'VARCHAR(50)',
        primaryKey: true,
      },
      content: {
        type: 'TEXT',
        NotNull: true,
      },
      date: {
        type: 'timestamp',
        NotNull: true,
        default: pgm.func('current_timestamp'),
      },
      is_delete: {
        type: 'BOOLEAN',
        notNull: true,
        default: false,

      },
      owner_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        References: 'users',
        onDelete: 'cascade',
      },
      thread_id: {
        type: 'VARCHAR(50)',
        notNull: true,
        References: 'threads',
        onDelete: 'cascade',
      },
      reply_to: {
        type: 'VARCHAR(50)',
        notNull: false,
        References: 'comments',
      },

    },
  );
  pgm.addConstraint('comments', 'fk_comments.owner_id_users.id',
    'FOREIGN KEY(owner_id) REFERENCES users(id) ON DELETE CASCADE');

  pgm.addConstraint('comments', 'fk_comments.thread_id_threads.id',
    'FOREIGN KEY(thread_id) REFERENCES threads(id) ON DELETE CASCADE');

  pgm.addConstraint('comments', 'fk_comments.reply_to_comments.id',
    'FOREIGN KEY(reply_to) REFERENCES comments(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropConstraint('comments', 'fk_comments.owner_id_users.id');
  pgm.dropConstraint('comments', 'fk_comments.thread_id_threads.id');
  pgm.dropConstraint('comments', 'fk_comments.reply_to_comments.id');

  pgm.dropTable('comments');
};
