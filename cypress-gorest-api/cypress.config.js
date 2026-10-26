const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://gorest.co.in',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 30000,
    retries: { runMode: 0, openMode: 0 },
    env: {
      // Isi token GoRest Anda di file cypress.env.json (lihat cypress.env.example.json)
      // atau lewat environment variable CYPRESS_GOREST_TOKEN.
      GOREST_TOKEN: '',
      apiVersion: '/public/v2'
    },
    setupNodeEvents(on, config) {
      return config;
    }
  }
});
