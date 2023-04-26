

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
};

exports.down = (pgm) => {
  pgm.dropTable('comments');
};
