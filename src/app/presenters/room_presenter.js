class RoomPresenter {
  static present(room) {
    return {
      id: room.id,
      host_id: room.host_id,
      name: room.name,
      description: room.description,
      image_url: room.image_url,
      location: room.location,
      latitude: room.latitude,
      longitude: room.longitude,
      created_at: room.created_at,
      updated_at: room.updated_at,
      host: room.host ? {
        id: room.host.id,
        name: room.host.name,
        email: room.host.email
      } : null,
      users: room.users ? room.users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email
      })) : []
    };
  }

  static presentMany(rooms) {
    return rooms.map(room => this.present(room));
  }
}

module.exports = RoomPresenter;
