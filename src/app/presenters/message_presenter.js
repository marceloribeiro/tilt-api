class MessagePresenter {
  static present(message) {
    return {
      id: message.id,
      author_id: message.author_id,
      room_id: message.room_id,
      content: message.content,
      type: message.type,
      created_at: message.created_at,
      updated_at: message.updated_at,
      author: message.author ? {
        id: message.author.id,
        name: message.author.name,
        email: message.author.email
      } : null,
      room: message.room ? {
        id: message.room.id,
        name: message.room.name,
        location: message.room.location
      } : null
    };
  }

  static presentMany(messages) {
    return messages.map(message => this.present(message));
  }
}

module.exports = MessagePresenter;