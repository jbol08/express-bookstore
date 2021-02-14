process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

let book_isbn;


beforeEach(async function () {
    let result = await db.query(`
      INSERT INTO books (isbn, amazon_url,author,language,pages,publisher,title,year) VALUES(
          '0691161518', 
          'http://a.co/eobPtX6', 
          'Matthew Maine', 
          'English', 
          100,  
          'Nothing publishers', 
          'my first book',
           2008)
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
  });


describe('GET /books', function () {
    test("get a list of books", async function () {
        const response = await request(app).get(`/books`)
        const books = response.body.books;    
        expect(books[0]).toHaveProperty('isbn');
    });
});

describe('GET /books/:isbn', function () {
    test("get a specific book", async function () {
        const response = await request(app).get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });
});

describe('POST /books', function () {
    test("create a  book", async function () {
        const response = await request(app).post(`/books`).send({
            "isbn": "0691161519",
            "amazon_url": "http://a.co/eobPtX3",
            "author": "Matthew Jane",
            "language": "english",
            "pages": 164,
            "publisher": "Princeton University Press",
            "title": "Power-Down",
            "year": 2010

        });
        
        expect(response.statusCode).toBe(201);
        expect(response.body.book).toHaveProperty('isbn');
       
    });
});

describe('PUT /books', function () {
    test("update a specific book", async function () {
        const response = await request(app).put(`/books/${book_isbn}`).send({
            "isbn": "0691161519",
            "amazon_url": "http://a.co/eobPtX3",
            "author": "Matthew Jane",
            "language": "english",
            "pages": 164,
            "publisher": "Princeton University Press",
            "title": "UPDATE-Down",
            "year": 2010

        });
        
        expect(response.body.book.title).toBe("UPDATE-Down");
        expect(response.body.book).toHaveProperty('isbn');
    });
});

describe("DELETE /books/:id", function () {
    test("Deletes a single a book", async function () {
      const response = await request(app).delete(`/books/${book_isbn}`)
      expect(response.body).toEqual({message: "Book deleted"});
    });
});
    

afterEach(async function () {
    
    await db.query("DELETE FROM books");
});
  
afterAll(async function () {
    // close db connection
    await db.end();
});