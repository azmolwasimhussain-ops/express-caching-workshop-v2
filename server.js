const express = require('express')

const productRoutes = require('./routes/product.routes')

const app = express()

const port = 3000

app.use(express.json())

app.use(productRoutes)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})