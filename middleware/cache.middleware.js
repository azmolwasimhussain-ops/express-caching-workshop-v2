const cache = {}

const TTL = 60 * 1000

function cacheMiddleware(req, res, next) {
    const key = req.originalUrl
    const cached = cache[key]

    if (cached) {
        const age = Date.now() - cached.createdAt

        if (age < TTL) {
            res.set('X-Cache', 'HIT')
            return res.json(cached.data)
        }

        delete cache[key]
    }

    res.set('X-Cache', 'MISS')

    const originalJson = res.json.bind(res)

    res.json = (data) => {
        cache[key] = {
            data,
            createdAt: Date.now()
        }

        return originalJson(data)
    }

    next()
}

function clearCache() {
    Object.keys(cache).forEach(key => {
        delete cache[key]
    })
}

module.exports = {
    cacheMiddleware,
    clearCache
}