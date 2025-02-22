



function AuctionItem() {
 
  return (
    <div>
      <h2>item.itemName</h2>
      <p>item.description</p>
      <p>Current Bid: $item.currentBid</p>
      <p>Highest Bidder: item.highestBidder || 'No bids yet'</p>
      <input
        type="number"
        
        placeholder="Enter your bid"
      />
      <button>Place Bid</button>
      <p className="message">message</p>
    </div>
  );
}

export default AuctionItem;