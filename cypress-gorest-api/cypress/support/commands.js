// ***********************************************
// Custom Commands - GoRest API Automation
// Semua request API dibuat reusable lewat custom command
// ***********************************************

const apiVersion = () => Cypress.env('apiVersion') || '/public/v2';
const token = () => {
  const value = Cypress.env('GOREST_TOKEN');
  // placeholder dari cypress.env.example.json dianggap "belum diisi"
  if (!value || /^(ISI_TOKEN|YOUR_TOKEN|xxxx)/i.test(String(value).trim())) return '';
  return String(value).trim();
};

/**
 * apiRequest - custom command generic untuk semua HTTP method.
 * @param {string} method  GET | POST | PUT | PATCH | DELETE
 * @param {string} endpoint  contoh: '/users' atau '/users/123'
 * @param {object} body  request payload
 * @param {object} qs  query string
 * @param {boolean} auth  kirim Bearer token atau tidak (default true)
 */
Cypress.Commands.add('apiRequest', ({ method = 'GET', endpoint, body, qs, auth = true, headers = {} } = {}) => {
  const options = {
    method,
    url: `${apiVersion()}${endpoint}`,
    failOnStatusCode: false, // biarkan test yang melakukan assertion status code
    headers: { Accept: 'application/json', ...headers }
  };

  if (body !== undefined) options.body = body;
  if (qs) options.qs = qs;

  const bearer = token();
  if (auth && bearer) {
    options.headers.Authorization = `Bearer ${bearer}`;
  }

  return cy.request(options);
});

// ---------- GET ----------
Cypress.Commands.add('getUsers', ({ page = 1, perPage = 10 } = {}) =>
  cy.apiRequest({ method: 'GET', endpoint: '/users', qs: { page, per_page: perPage } })
);

Cypress.Commands.add('getUser', (userId) =>
  cy.apiRequest({ method: 'GET', endpoint: `/users/${userId}` })
);

// ---------- POST ----------
Cypress.Commands.add('createUser', (payload) =>
  cy.apiRequest({ method: 'POST', endpoint: '/users', body: payload })
);

// ---------- PUT ----------
Cypress.Commands.add('updateUser', (userId, payload) =>
  cy.apiRequest({ method: 'PUT', endpoint: `/users/${userId}`, body: payload })
);

// ---------- DELETE ----------
Cypress.Commands.add('deleteUser', (userId) =>
  cy.apiRequest({ method: 'DELETE', endpoint: `/users/${userId}` })
);

// ---------- assertion helper ----------
Cypress.Commands.add('assertUserSchema', (user) => {
  expect(user, 'user object').to.be.an('object');
  expect(user).to.have.all.keys('id', 'name', 'email', 'gender', 'status');
  expect(user.id).to.be.a('number');
  expect(user.name).to.be.a('string').and.not.be.empty;
  expect(user.email).to.be.a('string').and.include('@');
  expect(user.gender).to.be.oneOf(['male', 'female']);
  expect(user.status).to.be.oneOf(['active', 'inactive']);
  return cy.wrap(user);
});
