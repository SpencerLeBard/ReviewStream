const express = require('express');
const router = express.Router();

// GET all reviews
router.get('/', (req, res) => {
  // TODO: Connect to database and fetch all reviews
  // Example: const reviews = await Review.find();
  
  // Mock reviews data
  const reviews = [
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
  
  res.json(reviews);
});

// POST new review (this would be called when receiving a text)
router.post('/', (req, res) => {
  try {
    const { customerName, phoneNumber, rating, reviewText } = req.body;
    
    // TODO: Save review to database
    // Example: const newReview = await Review.create({ customerName, phoneNumber, rating, reviewText });
    
    // Mock new review
    const newReview = {
      id: Date.now().toString(),
      customerName,
      phoneNumber,
      rating,
      reviewText,
      date: new Date()
    };
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET review by ID
router.get('/:id', (req, res) => {
  // TODO: Connect to database and fetch review by ID
  // Example: const review = await Review.findById(req.params.id);
  
  // Mock finding a review
  const review = {
    id: req.params.id,
    customerName: 'John Doe',
    phoneNumber: '+15551234567',
    rating: 5,
    reviewText: 'Great service!',
    date: new Date('2023-08-01')
  };
  
  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }
  
  res.json(review);
});

module.exports = router; 