const express = require('express')

const router = express.Router()

const controller = require('../controllers/product.controller')

const {
    cacheMiddleware
} = require('../middleware/cache.middleware')

const invalidateCache = require('../middleware/invalidate.middleware')

router.get('/products', cacheMiddleware, controller.getProducts)

router.get('/products/:id', cacheMiddleware, controller.getProductById)

router.post('/products', invalidateCache, controller.createProduct)

router.put('/products/:id', invalidateCache, controller.updateProduct)

router.patch('/products/:id', invalidateCache, controller.patchProduct)

router.delete('/products/:id', invalidateCache, controller.deleteProduct)

module.exports = router