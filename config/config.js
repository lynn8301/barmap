module.exports = {
    mysql: process.env.JAWSDB_URL,
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    },
    test: '123'
}