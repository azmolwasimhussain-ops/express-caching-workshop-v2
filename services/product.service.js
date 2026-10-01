const { readData, writeData } = require('../database/product.database')

async function getProducts() {
    return await readData()
}

async function getProductById(id) {
    const products = await readData()
    return products.find(product => product.id === id)
}

async function createProduct(product) {
    const products = await readData()

    const newProduct = {
        id: Date.now(),
        ...product
    }

    products.push(newProduct)

    await writeData(products)

    return newProduct
}

async function updateProduct(id, data) {
    const products = await readData()

    const index = products.findIndex(product => product.id === id)

    if (index === -1) {
        return null
    }

    products[index] = {
        ...products[index],
        ...data
    }

    await writeData(products)

    return products[index]
}

async function deleteProduct(id) {
    const products = await readData()

    const index = products.findIndex(product => product.id === id)

    if (index === -1) {
        return null
    }

    const deletedProduct = products[index]

    products.splice(index, 1)

    await writeData(products)

    return deletedProduct
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}