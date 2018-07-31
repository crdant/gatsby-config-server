module.exports = {
  siteMetadata: {
    title: 'Gatsby Spring Cloud Config Demonstration',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: "gatsby-source-spring-cloud-config",
      options: {
        endpoint: "http://localhost:8888",
        application: "foo",
      },
    },
  ],
}
