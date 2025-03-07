import React from 'react'
import './PostAuction.css'
 function PostAuction() {
  return (
    <div className="form-container">
      <h2 className='title'>Post New Auction</h2>
      <form >
      <input className="Name"type="text" placeholder="Item Name"/>
        <textarea className="Description"placeholder="Item Description"></textarea>
        <input className="number"type="number"placeholder="Starting Bid"/>
        <input className="date"type="datetime-local"/>
        <button className="button"type="submit">Post Auction</button>
      </form>
    </div>
  );
}
export default PostAuction
 