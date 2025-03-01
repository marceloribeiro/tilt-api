class AuctionPresenter {
  static present(auction) {
    return {
      id: auction.id,
      owner_id: auction.owner_id,
      item_id: auction.item_id,
      highest_auction_bid_id: auction.highest_auction_bid_id,
      status: auction.status,
      starting_price: auction.starting_price,
      current_price: auction.current_price,
      currency: auction.currency,
      starts_at: auction.starts_at,
      ends_at: auction.ends_at,
      created_at: auction.created_at,
      updated_at: auction.updated_at,
      is_active: auction.isActive(),
      can_bid: auction.canBid(),
      owner: auction.owner ? {
        id: auction.owner.id,
        name: auction.owner.name,
        email: auction.owner.email
      } : null,
      item: auction.item ? {
        id: auction.item.id,
        name: auction.item.name,
        description: auction.item.description,
        image_url: auction.item.image_url,
        status: auction.item.status
      } : null,
      highestBid: auction.highestBid ? {
        id: auction.highestBid.id,
        bidder_id: auction.highestBid.bidder_id,
        amount: auction.highestBid.amount,
        currency: auction.highestBid.currency,
        created_at: auction.highestBid.created_at
      } : null
    };
  }

  static presentMany(auctions) {
    return auctions.map(auction => this.present(auction));
  }
}

module.exports = AuctionPresenter;