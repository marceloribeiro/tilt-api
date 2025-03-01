class RoomUserPresenter {
  static present(roomUser) {
    return {
      id: roomUser.id,
      user_id: roomUser.user_id,
      room_id: roomUser.room_id,
      status: roomUser.status,
      joined_at: roomUser.joined_at,
      left_at: roomUser.left_at,
      created_at: roomUser.created_at,
      updated_at: roomUser.updated_at,
      user: roomUser.user ? {
        id: roomUser.user.id,
        name: roomUser.user.name,
        email: roomUser.user.email
      } : null,
      room: roomUser.room ? {
        id: roomUser.room.id,
        name: roomUser.room.name,
        location: roomUser.room.location
      } : null
    };
  }

  static presentMany(roomUsers) {
    return roomUsers.map(roomUser => this.present(roomUser));
  }
}

module.exports = RoomUserPresenter;