module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/recipes',
                permanent: true,
            },
        ]
    },
}
