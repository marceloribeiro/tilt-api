class LivestreamPresenter {
  static present(livestream) {
    return {
      id: livestream.id,
      room_id: livestream.room_id,
      host_id: livestream.host_id,
      current_auction_id: livestream.current_auction_id,
      name: livestream.name,
      description: livestream.description,
      url: livestream.url,
      thumbnail_url: livestream.thumbnail_url,
      status: livestream.status,
      starts_at: livestream.starts_at,
      ends_at: livestream.ends_at,
      created_at: livestream.created_at,
      updated_at: livestream.updated_at,
      room: livestream.room ? {
        id: livestream.room.id,
        name: livestream.room.name,
        location: livestream.room.location
      } : null,
      host: livestream.host ? {
        id: livestream.host.id,
        name: livestream.host.name,
        email: livestream.host.email
      } : null,
      currentAuction: livestream.currentAuction ? {
        id: livestream.currentAuction.id,
        name: livestream.currentAuction.name,
        status: livestream.currentAuction.status
      } : null
    };
  }

  static presentMany(livestreams) {
    return livestreams.map(livestream => this.present(livestream));
  }
}

module.exports = LivestreamPresenter;