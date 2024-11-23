const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
 // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).send("Username and password are required.");
  }

  //Authenticate User
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({
        data: password
    }, 'access', { expiresIn: '1h' });

    // Store access token and username in session
    req.session.authorization = {
        accessToken, username
    }
    return res.status(200).send({ message: "Login successful", accessToken });
} else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
}
});

// Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
    const { isbn } = req.params; // Extract ISBN parameter from the URL
    const { review } = req.query; // Extract review from query parameters
    const username = req.session.authorization?.username; // Get the logged-in username from the session

    if (!username) {
        return res.status(401).send({ message: "Unauthorized. Please log in to add or modify a review." });
    }

    if (!review) {
        return res.status(400).send({ message: "Review text is required." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).send({ message: "Book not found." });
    }

    // Add or modify the user's review for the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = {}; // Initialize reviews object if not present
    }
    books[isbn].reviews[username] = review; // Add or update the review

    return res.status(200).send({
        message: `Review for book with ISBN ${isbn} added/updated successfully.`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params; // Extract ISBN parameter from the URL
    const username = req.session.authorization?.username; // Get the logged-in username from the session

    if (!username) {
        return res.status(401).send({ message: "Unauthorized. Please log in to delete your review." });
    }

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).send({ message: "Book not found." });
    }

    // Check if the book has reviews and if the user has posted a review
    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username]; // Delete the user's review
        return res.status(200).send({
            message: "Review successfully deleted.",
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).send({ message: "No review found for the logged-in user." });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
