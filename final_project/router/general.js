const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

    // axios.get = async (url) => {
    //     if (url === "booksdb") {
    //         return { data: books }; // Return the books object as a resolved promise
    //     }
    //     throw new Error("Invalid URL"); // Simulate an error for other URLs
    // };

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
public_users.get("/", async function (req, res) {
    try {
        const response = await axios.get("booksdb");
        res.status(200).json(response.data); // Send the book data as JSON
    } catch (error) {
        console.error("Error fetching books:", error.message);
        res.status(500).send("Error fetching the book list.");
    }
});

axios.get = (url) => {
    return new Promise((resolve, reject) => {
        if (url === "booksdb") {
            resolve({ data: books }); // Return the books object as a resolved promise
        } else {
            reject(new Error("Invalid URL")); // Simulate an error for other URLs
        }
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  axios.get("booksdb")
  .then((response) => {
      const book = response.data[isbn]; // Access the book using the ISBN from the response data
      if (book) {
          res.status(200).json(book); // Return the book as a JSON response
      } else {
          res.status(404).send("Book not found.");
      }
  })
  .catch((error) => {
      console.error("Error fetching book data:", error.message);
      res.status(500).send("Error fetching book details.");
  });
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  axios.get("booksdb")
  .then((response) => {
      const result = Object.values(response.data).filter(book => book.author === author);

      if (result.length > 0) {
          res.send(JSON.stringify(result, null, 4));
      } else {
          res.status(404).send("No books found by the given author.");
      }
  })
  .catch((error) => {
      console.error("Error fetching books:", error.message);
      res.status(500).send("Error fetching the book list.");
  });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  axios.get("booksdb")
  .then(response => {
      const result = Object.values(response.data).find(book => book.title === title);
      if (result) {
          res.status(200).json(result); // Send the found book data
      } else {
          res.status(404).send("No books found with the given title.");
      }
  })
  .catch(error => {
      console.error("Error fetching books:", error.message);
      res.status(500).send("Error fetching the books list.");
  });
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
      res.send(JSON.stringify(book.reviews, null, 4));
  } else {
      res.status(404).send("Reviews not found for the given ISBN.");
  }
});

module.exports.general = public_users;
