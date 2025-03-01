class AuctionBidPresenter {
  static present(auctionBid) {
    return {
      id: auctionBid.id,
      auction_id: auctionBid.auction_id,
      bidder_id: auctionBid.bidder_id,
      status: auctionBid.status,
      amount: auctionBid.amount,
      currency: auctionBid.currency,
      created_at: auctionBid.created_at,
      updated_at: auctionBid.updated_at,
      is_highest_bid: auctionBid.isHighestBid && auctionBid.isHighestBid(),
      bidder: auctionBid.bidder ? {
        id: auctionBid.bidder.id,
        name: auctionBid.bidder.name,
        email: auctionBid.bidder.email
      } : null,
      auction: auctionBid.auction ? {
        id: auctionBid.auction.id,
        owner_id: auctionBid.auction.owner_id,
        item_id: auctionBid.auction.item_id,
        status: auctionBid.auction.status,
        starting_price: auctionBid.auction.starting_price,
        current_price: auctionBid.auction.current_price,
        currency: auctionBid.auction.currency
      } : null
    };
  }

  static presentMany(auctionBids) {
    return auctionBids.map(auctionBid => this.present(auctionBid));
  }
}

module.exports = AuctionBidPresenter;