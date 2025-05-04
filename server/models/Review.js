// This is a placeholder for the actual database model

/* 
When setting up a MongoDB database with Mongoose, the schema would look like:

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
*/

// For now, we're using a mock model
class Review {
  static reviews = [
    { 
      id: '1', 
      customerName: 'John Doe', 
      phoneNumber: '+15551234567',
      rating: 5, 
      reviewText: 'Fantastic service! Would definitely recommend to others.',
      date: new Date('2023-07-15')
    },
    { 
      id: '2', 
      customerName: 'Jane Smith', 
      phoneNumber: '+15557654321',
      rating: 4, 
      reviewText: 'Great experience overall. Just a minor issue with delivery time.',
      date: new Date('2023-07-20')
    },
    { 
      id: '3', 
      customerName: 'Michael Brown', 
      phoneNumber: '+15551112222',
      rating: 5, 
      reviewText: 'Absolutely loved the product and the customer service was excellent!',
      date: new Date('2023-08-05')
    }
  ];

  static find() {
    return Promise.resolve(this.reviews);
  }

  static findById(id) {
    const review = this.reviews.find(r => r.id === id);
    return Promise.resolve(review);
  }

  static create(data) {
    const newReview = {
      id: Date.now().toString(),
      ...data,
      date: new Date()
    };
    this.reviews.push(newReview);
    return Promise.resolve(newReview);
  }
}

module.exports = Review; 