const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User registered successfully. Now you can login."});
        } else {
            return res.status(404).json({message: "Username already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Username and password are required."});

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
      res.send(JSON.stringify(book, null, 4));
  } else {
      res.status(404).send("Book not found.");
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const result = Object.values(books).filter(book => book.author === author);
  if (result.length > 0) {
      res.send(JSON.stringify(result, null, 4));
  } else {
      res.status(404).send("No books found by the given author.");
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const result = Object.values(books).find(book => book.title === title);
  if (result) {
      res.send(JSON.stringify(result, null, 4));
  } else {
      res.status(404).send("No books found with the given title.");
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
      res.send(JSON.stringify(book.reviews, null, 4));
  } else {
      res.status(404).send("Reviews not found for the given ISBN.");
  }
});

module.exports.general = public_users;
