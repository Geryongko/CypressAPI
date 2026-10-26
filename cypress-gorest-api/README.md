# Cypress API Automation - GoRest (GET, POST, PUT, DELETE)

Proyek automasi pengujian **API** menggunakan **Cypress** dengan pendekatan **custom command**,
diuji pada API publik **GoRest** (`https://gorest.co.in/public/v2/users`).

- Tester : Gery Christopher Ongko
- Tools  : Cypress 13, Node.js, JavaScript
- API    : GoRest v2 - https://gorest.co.in/

---

## 1. Struktur Project

```
cypress-gorest-api/
├── cypress/
│   ├── e2e/
│   │   └── api/
│   │       ├── gorest-users.cy.js      # GET, POST, PUT, DELETE (CRUD utama)
│   │       └── gorest-negative.cy.js   # skenario negatif (401 / 404)
│   ├── fixtures/
│   │   └── user.json                   # payload contoh
│   └── support/
│       ├── commands.js                 # ★ CUSTOM COMMANDS
│       └── e2e.js                      # entry point support file
├── cypress.config.js
├── cypress.env.example.json
├── package.json
├── .gitignore
└── README.md
```

## 2. Custom Command (cypress/support/commands.js)

| Custom Command | Method | Endpoint | Keterangan |
|---|---|---|---|
| `cy.apiRequest({method, endpoint, body, qs, auth})` | semua | dinamis | Wrapper generik `cy.request`, otomatis menempelkan Bearer Token |
| `cy.getUsers({page, perPage})` | GET | `/public/v2/users` | Ambil daftar user |
| `cy.getUser(userId)` | GET | `/public/v2/users/:id` | Ambil satu user |
| `cy.createUser(payload)` | POST | `/public/v2/users` | Buat user baru |
| `cy.updateUser(userId, payload)` | PUT | `/public/v2/users/:id` | Perbarui user |
| `cy.deleteUser(userId)` | DELETE | `/public/v2/users/:id` | Hapus user |
| `cy.assertUserSchema(user)` | - | - | Assertion schema user (id, name, email, gender, status) |

Semua custom command dibungkus `failOnStatusCode: false` sehingga assertion status code
dilakukan eksplisit di dalam test (praktik yang dianjurkan untuk API testing).

## 3. Cara Menjalankan

```bash
# 1. install dependency
npm install

# 2. daftarkan token GoRest
#    buka https://gorest.co.in/ -> Sign In / Register -> copy Access Token
cp cypress.env.example.json cypress.env.json
#    lalu isi field GOREST_TOKEN dengan token Anda

# 3. jalankan test (headless)
npm run cy:run

# atau mode interaktif
npm run cy:open
```

Token juga bisa diberikan lewat environment variable:

```bash
CYPRESS_GOREST_TOKEN=xxxxx npm run cy:run
```

> `cypress.env.json` sudah masuk `.gitignore` sehingga token **tidak ikut ter-commit** ke GitHub.

## 4. Daftar Test Case

### CRUD Utama - `gorest-users.cy.js`

| ID | Method | Skenario | Expected |
|---|---|---|---|
| TC-API-GET-01 | GET | Ambil daftar pengguna | status **200**, body **array**, panjang 1..10 |
| TC-API-GET-02 | GET | Struktur tiap elemen array | setiap user punya keys `id, name, email, gender, status` dengan tipe benar |
| TC-API-POST-01 | POST | Buat pengguna baru | status **201**, `name/email/gender/status` sama dengan payload, `id` number |
| TC-API-POST-02 | GET | Verifikasi user baru terbaca | status **200**, `id` & `email` sesuai |
| TC-API-PUT-01 | PUT | Perbarui pengguna | status **200**, data berubah sesuai payload |
| TC-API-PUT-02 | GET | Perubahan tersimpan | `name` dan `status` terbaru terbaca |
| TC-API-DELETE-01 | DELETE | Hapus pengguna | status **204**, body kosong |
| TC-API-DELETE-02 | GET | User terhapus tidak ditemukan | status **404** |

### Negatif - `gorest-negative.cy.js` (tanpa token)

| ID | Skenario | Expected |
|---|---|---|
| TC-API-NEG-01 | POST tanpa Bearer Token | **401** `Authentication failed` |
| TC-API-NEG-02 | POST dengan token tidak valid | **401** `Authentication failed` |
| TC-API-NEG-03 | GET user id tidak ada | **404** |
| TC-API-NEG-04 | DELETE tanpa token | **401** |

## 5. Catatan

- Payload POST memakai email unik (`Date.now()`) agar tidak bentrok dengan data yang sudah ada di GoRest.
- Alur test bersifat berurutan dalam satu `describe`: **POST** membuat user → **PUT** memperbarui → **DELETE** menghapus,
  sehingga ID user dipakai bersama lewat variabel `createdUserId`.
- Bila `GOREST_TOKEN` belum diisi, blok POST/PUT/DELETE otomatis di-skip (`this.skip()`) dan suite tetap hijau
  untuk GET + skenario negatif.

## 6. Lisensi

MIT
