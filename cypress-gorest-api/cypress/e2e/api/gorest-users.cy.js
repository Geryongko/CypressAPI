/**
 * ============================================================================
 * GoRest API Automation - Cypress
 * Base URL : https://gorest.co.in
 * Endpoint : /public/v2/users
 * Method   : GET, POST, PUT, DELETE
 * ----------------------------------------------------------------------------
 * Semua request dikirim melalui custom command yang didefinisikan pada
 * cypress/support/commands.js  ->  cy.apiRequest(), cy.getUsers(),
 * cy.createUser(), cy.updateUser(), cy.deleteUser(), cy.assertUserSchema()
 * ============================================================================
 */

describe('GoRest API - Users CRUD (GET, POST, PUT, DELETE)', () => {
  const token = () => Cypress.env('GOREST_TOKEN');

  // data unik per run supaya email tidak bentrok dengan data yang sudah ada
  const runId = Date.now();
  const newUserPayload = {
    name: 'Gery Christopher Ongko',
    email: `gery.qa.${runId}@example.com`,
    gender: 'male',
    status: 'active'
  };

  let createdUserId;

  /* ------------------------------------------------------------------
   * 1. GET /public/v2/users  -> 200 + body berupa array
   * ------------------------------------------------------------------ */
  describe('GET - Ambil daftar pengguna', () => {
    it('TC-API-GET-01 : status code 200 dan response berupa array', () => {
      cy.getUsers({ page: 1, perPage: 10 }).then((response) => {
        // verifikasi status code
        expect(response.status, 'status code').to.eq(200);

        // verifikasi data yang diterima adalah sebuah array
        expect(response.body, 'response body').to.be.an('array');
        expect(response.body.length, 'jumlah user').to.be.greaterThan(0);
        expect(response.body.length, 'jumlah user').to.be.at.most(10);

        cy.log(`GET /users -> ${response.body.length} user diterima`);
      });
    });

    it('TC-API-GET-02 : setiap elemen array memiliki struktur user yang benar', () => {
      cy.getUsers({ perPage: 5 }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');

        response.body.forEach((user, index) => {
          expect(user, `user index ${index}`).to.have.all.keys(
            'id',
            'name',
            'email',
            'gender',
            'status'
          );
          expect(user.id).to.be.a('number');
          expect(user.name).to.be.a('string').and.not.be.empty;
          expect(user.email).to.be.a('string').and.include('@');
          expect(user.gender).to.be.oneOf(['male', 'female']);
          expect(user.status).to.be.oneOf(['active', 'inactive']);
        });
      });
    });
  });

  /* ------------------------------------------------------------------
   * 2. POST /public/v2/users -> 201 + data sesuai yang dikirim
   *    Memerlukan Bearer Token (daftar di https://gorest.co.in/)
   * ------------------------------------------------------------------ */
  describe('POST - Buat pengguna baru', () => {
    before(function () {
      if (!token()) {
        cy.log('GOREST_TOKEN belum diisi - test POST/PUT/DELETE di-skip');
        this.skip();
      }
    });

    it('TC-API-POST-01 : status code 201 dan data user sesuai dengan yang dikirim', () => {
      cy.createUser(newUserPayload).then((response) => {
        // verifikasi status code
        expect(response.status, 'status code').to.eq(201);

        // verifikasi data yang dibuat sesuai dengan yang dikirim
        expect(response.body).to.be.an('object');
        expect(response.body.name).to.eq(newUserPayload.name);
        expect(response.body.email).to.eq(newUserPayload.email);
        expect(response.body.gender).to.eq(newUserPayload.gender);
        expect(response.body.status).to.eq(newUserPayload.status);
        expect(response.body.id).to.be.a('number');

        // verifikasi schema lengkap
        cy.assertUserSchema(response.body);

        createdUserId = response.body.id;
        cy.log(`User baru dibuat dengan id = ${createdUserId}`);
        cy.writeFile('cypress/fixtures/created-user.json', response.body);
      });
    });

    it('TC-API-POST-02 : user yang baru dibuat dapat diambil kembali lewat GET', () => {
      cy.getUser(createdUserId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq(createdUserId);
        expect(response.body.email).to.eq(newUserPayload.email);
      });
    });
  });

  /* ------------------------------------------------------------------
   * 3. PUT /public/v2/users/:id -> 200 + data berhasil diperbarui
   * ------------------------------------------------------------------ */
  describe('PUT - Perbarui informasi pengguna', () => {
    before(function () {
      if (!token()) {
        this.skip();
      }
    });

    const updatedPayload = {
      name: 'Gery Christopher Ongko - Updated',
      email: newUserPayload.email,
      gender: 'male',
      status: 'inactive'
    };

    it('TC-API-PUT-01 : status code 200 dan data pengguna berhasil diperbarui', () => {
      expect(createdUserId, 'user id dari test POST').to.be.a('number');

      cy.updateUser(createdUserId, updatedPayload).then((response) => {
        // verifikasi status code
        expect(response.status, 'status code').to.eq(200);

        // verifikasi data berhasil diperbarui
        expect(response.body.name).to.eq(updatedPayload.name);
        expect(response.body.status).to.eq(updatedPayload.status);
        expect(response.body.email).to.eq(updatedPayload.email);
        expect(response.body.id).to.eq(createdUserId);
      });
    });

    it('TC-API-PUT-02 : perubahan tersimpan dan terbaca pada GET berikutnya', () => {
      cy.getUser(createdUserId).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq(updatedPayload.name);
        expect(response.body.status).to.eq('inactive');
      });
    });
  });

  /* ------------------------------------------------------------------
   * 4. DELETE /public/v2/users/:id -> 204
   * ------------------------------------------------------------------ */
  describe('DELETE - Hapus pengguna', () => {
    before(function () {
      if (!token()) {
        this.skip();
      }
    });

    it('TC-API-DELETE-01 : status code 204', () => {
      expect(createdUserId, 'user id dari test POST').to.be.a('number');

      cy.deleteUser(createdUserId).then((response) => {
        expect(response.status, 'status code').to.eq(204);
        expect(response.body, 'body kosong').to.be.empty;
      });
    });

    it('TC-API-DELETE-02 : user yang sudah dihapus tidak dapat ditemukan (404)', () => {
      cy.getUser(createdUserId).then((response) => {
        expect(response.status).to.eq(404);
        expect(response.body.message || '').to.match(/not found|Resource/i);
      });
    });
  });
});
