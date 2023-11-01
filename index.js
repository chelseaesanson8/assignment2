const express = require('express')
const http = require("http")
const path = require("path")


// Construct the express object to be used 
const app = express()

// Get path to page files and store it as a static variable in Express
const pagesPath = path.resolve(__dirname, 'pages')
app.use(express.static(pagesPath))

// Index page at "/"
app.get("/", (req, res) => {
    res.sendFile(`${pagesPath}/index.html`)
})

// Create books object with ISBN, title, price, and image
const products = [
    { ISBN: "1974710025", title: "Jujutsu Kaisen: Volume 1", price: 9.99, image: "/images/JJK VOL 1.jpeg" },
    { ISBN: "1974710033", title: "Jujutsu Kaisen: Volume 2", price: 9.99, image: "/images/JJK VOL 2.jpeg" },
    { ISBN: "1974710041", title: "Jujutsu Kaisen: Volume 3", price: 9.99, image: "/images/JJK VOL 3.jpeg" }
]

// function that returns that entire array of books
function getProducts() {
    return products
}

// function that searches the array to match ISBN to title, price, image and return data
function searchProduct(bookISBN) {
    const product = products.find(item => item.ISBN === bookISBN)

    return product
}

// starts the order process, gets the form data, validates the form data, 
function order(req, res, next) {
    const bookISBN = req.query.book // Get the book ISBN
    const quantity = req.query.quantity  // Get the quantity

    // Validates the form submission, if no bookISBN is provided - gives error, no quantity given - gives error, bookISBN set to "none" - gives error, quantity less than or equal to 0 - gives error
    if (!bookISBN || !quantity || bookISBN === "none" || quantity <= 0) {
        const error = new Error('Invalid input or no book selected');
        error.status = 404;
        return next(error);
    }


    // use the bookISBN to search for the product and store it within the product variable
    const product = searchProduct(bookISBN)

    // if product cannot be found - give error
    if (!product) {
        const error = new Error('Product not found.');
        error.status = 404;
        return next(error);
    }

    // use the product data and the quantity data to send to totalPrice function and and store result within total
    const total = totalPrice(product, quantity)
    // use the product data, quantity, and total to send to createReceipt function and store within receipt 
    const receipt = createReceipt(product, quantity, total)

    // provide the receipt to user
    res.send(receipt)

}

// function that takes in product and quantity from order function and computes the total price for the order
function totalPrice(product, quantity) {

    // Compute total price and store it in totalPrice variable (rounds to 2 decimal places)
    const totalPrice = (product.price * quantity * 1.0175).toFixed(2)

    // returns the total price for the order to be used by the order function
    return totalPrice
}

// function that takes in product, quantity, and totalPrice from order function and creates the order reciept and displays it in HTML for the user
function createReceipt(product, quantity, totalPrice) {

    // stores the html in the htmlReceipt variable to be passed to the order function to display to user
    const htmlReceipt = `
        <h1>Store Receipt</h1>
        <p><strong>Book Title:</strong> ${product.title}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Individual Price:</strong> $${product.price}</p>
        <p><strong>Total Price w/ Tax:</strong> $${totalPrice}</p>
    `

    // returns the html receipt to the order function
    return htmlReceipt
}


// Index page at "/", set homepage
app.get("/", (req, res) => {
    res.sendFile(`${pagesPath}/index.html`)
})


// calls the order function to process order from the inital request
app.get("/order", order)


// handles error if file not found
app.use((req, res) => {
    res.writeHead(404, { 'Content-Type': 'text/html' })
    res.end('<html><body><h2>Sorry -- file not found!</h2></body></html>')
})


app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;

    if (status === 404) {
        res.status(status).send('<html><body><h2>Invalid input or no book selected.</h2></body></html>');
    } else {
        res.status(status).send('<html><body><h2>Server Error!</h2></body></html>');
    }
});


// app listening on port 3000
http.createServer(app).listen(3000)

// TODO: Add footer to html page