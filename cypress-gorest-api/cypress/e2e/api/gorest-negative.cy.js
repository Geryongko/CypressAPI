/**
 * ============================================================================
 * GoRest API - Negative / Authorization Testing
 * Tidak memerlukan token, sehingga selalu dapat dijalankan.
 * Membuktikan bahwa custom command cy.apiRequest() juga dipakai untuk
 * memverifikasi skenario negatif (auth & validasi payload).
 * ============================================================================
 */

describe('GoRest API - Negative & Authorization', () => {
  const unique = Date.now();
  const payload = {
    name: 'Negative Case User',
    email: `negative.${unique}@example.com`,
    gender: 'male',
    status: 'active'
  };

  it('TC-API-NEG-01 : POST tanpa Bearer Token mengembalikan 401', () => {
    cy.apiRequest({
      method: 'POST',
      endpoint: '/users',
      body: payload,
      auth: false
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.match(/Authentication failed|Invalid token/i);
    });
  });

  it('TC-API-NEG-02 : POST dengan token tidak valid mengembalikan 401', () => {
    cy.apiRequest({
      method: 'POST',
      endpoint: '/users',
      body: payload,
      headers: { Authorization: 'Bearer invalid_token_123' }
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body.message).to.match(/Authentication failed|Invalid token/i);
    });
  });

  it('TC-API-NEG-03 : GET user dengan id yang tidak ada mengembalikan 404', () => {
    cy.getUser(999999999).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body.message).to.match(/not found|Resource/i);
      expect(response.body).to.be.an('object');
    });
  });

  it('TC-API-NEG-04 : DELETE tanpa Bearer Token tidak mengizinkan penghapusan', () => {
    // Catatan: GoRest memvalidasi keberadaan resource lebih dulu, sehingga untuk id yang
    // tidak ada responsnya 404 "Resource not found". Tanpa token, penghapusan tetap ditolak.
    cy.apiRequest({ method: 'DELETE', endpoint: '/users/1', auth: false }).then((response) => {
      expect(response.status).to.be.oneOf([401, 404]);
      expect(response.body.message).to.match(/Authentication failed|Invalid token|Resource not found/i);
    });
  });
});
