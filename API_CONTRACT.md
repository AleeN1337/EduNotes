# EduNotes API Contract 📋

**Żywy dokument Frontend-Backend komunikacji**
**Aktualizowany w trakcie rozwoju projektu**

> 🔄 **Jak używamy tego dokumentu:**
>
> - Frontend (Ty): Dodaje informacje o implementowanych funkcjach
> - Backend (Maciek): Czyta co jest potrzebne i implementuje API
> - Wszyscy: Aktualizują po wprowadzeniu zmian

---

## 📝 **Dziennik zmian Frontend → Backend**

### 2025-07-16 - Inicjalizacja projektu

**CO DODAŁEM (Frontend):**

- ✅ TypeScript interfaces w `src/types/index.ts`
- ✅ Axios konfiguracja w `src/lib/api.ts`
- ✅ Podstawowa struktura folderów
- ✅ shadcn/ui komponenty (utils w `src/lib/utils.ts`)

**CO POTRZEBUJE (Backend):**

- 🔸 Potwierdzenie portów (localhost:????)
- 🔸 Wybór JWT vs sessions
- 🔸 Format odpowiedzi API

### 2025-07-16 - Strona logowania/rejestracji ✅ COMPLETED

**CO ZAIMPLEMENTOWAŁEM (Frontend):**

- ✅ Strona główna z formularzami login/register
- ✅ React Hook Form + Zod validation
- ✅ Material-UI komponenty (TextField, Button, Card)
- ✅ Mock API dla testowania (localStorage)
- ✅ Inter font z Google Fonts
- ✅ Responsive design z Tailwind + gradient styling
- ✅ Smooth transitions między formularzami (Material-UI Fade)
- ✅ **GitHub repo**: https://github.com/AleeN1337/EduNotes
- ✅ **Gałąź**: `feature/auth-implementation`

**CO POTRZEBUJE (Backend):**

- 🔸 POST /api/auth/login endpoint
- 🔸 POST /api/auth/register endpoint
- 🔸 Format błędów walidacji
- 🔸 JWT tokeny w response

### [KOLEJNE WPISY BĘDĄ DODAWANE TUTAJ]

---

## 🔧 **Konfiguracja serwera**

### Backend URL

- **Development**: `http://localhost:????` <!-- Maciek: na jakim porcie? -->
- **Production**: `https://????` <!-- Do ustalenia później -->

### CORS

- **Allowed Origins**: `http://localhost:3000` (frontend dev server)
- **Allowed Methods**: `GET, POST, PUT, DELETE, OPTIONS`
- **Allowed Headers**: `Content-Type, Authorization`

---

## 🔐 **Authentication & Authorization**

### Token Type

- [ ] **JWT** JSON Web Tokens

### Token Storage (Frontend)

- [ ] **localStorage**

### Authorization Header Format

```
Authorization: Bearer <token>
```

---

## 📡 **API Endpoints**

### **Authentication**

#### **POST /api/auth/register**

**Opis**: Rejestracja nowego użytkownika

**Request Body**:

```json
{
  "email": "jan@student.pl",
  "username": "jan123",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "password": "mojehaslo123",
  "confirmPassword": "mojehaslo123"
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "jan@student.pl",
    "username": "jan123",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "avatar": null,
    "createdAt": "2025-07-16T15:30:00.000Z",
    "updatedAt": "2025-07-16T15:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...", // Jeśli od razu logujemy
  "message": "Użytkownik został zarejestrowany"
}
```

**Response Errors**:

- **400**: `{ "success": false, "message": "Hasła się nie zgadzają" }`
- **422**: `{ "success": false, "message": "Email jest już zajęty" }`
- **422**: `{ "success": false, "message": "Username jest już zajęty" }`

---

#### **POST /api/auth/login**

**Opis**: Logowanie użytkownika

**Request Body**:

```json
{
  "email": "jan@student.pl",
  "password": "mojehaslo123"
}
```

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "jan@student.pl",
    "username": "jan123",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "avatar": null,
    "createdAt": "2025-07-16T15:30:00.000Z",
    "updatedAt": "2025-07-16T15:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Zalogowano pomyślnie"
}
```

**Response Errors**:

- **401**: `{ "success": false, "message": "Błędny email lub hasło" }`
- **422**: `{ "success": false, "message": "Email jest wymagany" }`

---

#### **POST /api/auth/logout**

**Opis**: Wylogowanie użytkownika
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Wylogowano pomyślnie"
}
```

---

#### **GET /api/auth/me**

**Opis**: Pobranie danych zalogowanego użytkownika
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "jan@student.pl",
    "username": "jan123",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "avatar": null,
    "createdAt": "2025-07-16T15:30:00.000Z",
    "updatedAt": "2025-07-16T15:30:00.000Z"
  }
}
```

**Response Errors**:

- **401**: `{ "success": false, "message": "Token nieprawidłowy lub wygasł" }`

---

### **Notes (Notatki)**

#### **GET /api/notes**

**Opis**: Lista notatek użytkownika + publiczne notatki
**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:

- `page=1` (opcjonalne, domyślnie 1)
- `limit=10` (opcjonalne, domyślnie 10)
- `subject=matematyka` (opcjonalne, filtrowanie po przedmiocie)
- `search=algebra` (opcjonalne, wyszukiwanie w tytule/treści)
- `tags=algebra,geometria` (opcjonalne, filtrowanie po tagach)

**Response Success (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "title": "Wzory na pole powierzchni",
      "content": "Treść notatki...",
      "subject": "matematyka",
      "tags": ["geometria", "wzory"],
      "authorId": "uuid-string",
      "author": {
        "id": "uuid-string",
        "username": "jan123",
        "firstName": "Jan",
        "lastName": "Kowalski"
      },
      "isPublic": true,
      "createdAt": "2025-07-16T15:30:00.000Z",
      "updatedAt": "2025-07-16T15:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

#### **POST /api/notes**

**Opis**: Dodanie nowej notatki
**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "title": "Wzory na pole powierzchni",
  "content": "Treść notatki...",
  "subject": "matematyka",
  "tags": ["geometria", "wzory"],
  "isPublic": true
}
```

**Response Success (201)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Wzory na pole powierzchni",
    "content": "Treść notatki...",
    "subject": "matematyka",
    "tags": ["geometria", "wzory"],
    "authorId": "uuid-string",
    "author": {
      "id": "uuid-string",
      "username": "jan123",
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "isPublic": true,
    "createdAt": "2025-07-16T15:30:00.000Z",
    "updatedAt": "2025-07-16T15:30:00.000Z"
  },
  "message": "Notatka została dodana"
}
```

---

#### **GET /api/notes/:id**

**Opis**: Szczegóły pojedynczej notatki
**Headers**: `Authorization: Bearer <token>` (opcjonalne dla publicznych)

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "Wzory na pole powierzchni",
    "content": "Treść notatki...",
    "subject": "matematyka",
    "tags": ["geometria", "wzory"],
    "authorId": "uuid-string",
    "author": {
      "id": "uuid-string",
      "username": "jan123",
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "isPublic": true,
    "createdAt": "2025-07-16T15:30:00.000Z",
    "updatedAt": "2025-07-16T15:30:00.000Z"
  }
}
```

**Response Errors**:

- **404**: `{ "success": false, "message": "Notatka nie została znaleziona" }`
- **403**: `{ "success": false, "message": "Brak dostępu do tej notatki" }`

---

#### **PUT /api/notes/:id**

**Opis**: Edycja notatki (tylko autor)
**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "title": "Nowy tytuł",
  "content": "Nowa treść...",
  "subject": "fizyka",
  "tags": ["mechanika"],
  "isPublic": false
}
```

**Response Success (200)**:

```json
{
  "success": true,
  "data": {
    // Zaktualizowana notatka (format jak GET /api/notes/:id)
  },
  "message": "Notatka została zaktualizowana"
}
```

**Response Errors**:

- **404**: `{ "success": false, "message": "Notatka nie została znaleziona" }`
- **403**: `{ "success": false, "message": "Możesz edytować tylko swoje notatki" }`

---

#### **DELETE /api/notes/:id**

**Opis**: Usunięcie notatki (tylko autor)
**Headers**: `Authorization: Bearer <token>`

**Response Success (200)**:

```json
{
  "success": true,
  "message": "Notatka została usunięta"
}
```

**Response Errors**:

- **404**: `{ "success": false, "message": "Notatka nie została znaleziona" }`
- **403**: `{ "success": false, "message": "Możesz usuwać tylko swoje notatki" }`

---

### **Subjects (Przedmioty)**

#### **GET /api/subjects**

**Opis**: Lista dostępnych przedmiotów

**Response Success (200)**:

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "name": "Matematyka",
      "description": "Przedmioty matematyczne",
      "color": "#1976d2"
    },
    {
      "id": "uuid-string",
      "name": "Fizyka",
      "description": "Przedmioty fizyczne",
      "color": "#388e3c"
    }
  ]
}
```

---

## ❌ **Error Handling**

### Standardowy format błędów:

```json
{
  "success": false,
  "message": "Opis błędu po polsku",
  "errors": {
    // Opcjonalne - dla validation errors
    "email": ["Email jest wymagany", "Email ma nieprawidłowy format"],
    "password": ["Hasło musi mieć minimum 8 znaków"]
  }
}
```

### Kody HTTP:

- **200**: OK - Sukces
- **201**: Created - Zasób utworzony
- **400**: Bad Request - Błędne dane
- **401**: Unauthorized - Brak autoryzacji
- **403**: Forbidden - Brak uprawnień
- **404**: Not Found - Zasób nie znaleziony
- **422**: Unprocessable Entity - Błędy walidacji
- **500**: Internal Server Error - Błąd serwera

---

## 🔧 **Do uzupełnienia z Maćkiem:**

### ❓ **Pytania techniczne:**

1. **Port backendu**: localhost:????
2. **Baza danych**: PostgreSQL ✓
3. **ORM**: Prisma / TypeORM / Sequelize / inne?
4. **Hashing haseł**: bcrypt / argon2?
5. **JWT secret**: gdzie przechowywany?
6. **Token expiration**: 1h / 24h / 7 dni?
7. **Refresh tokens**: tak / nie?

### ❓ **Pytania biznesowe:**

1. **Wymagane pola rejestracji**: email + username + imię/nazwisko + hasło?
2. **Minimalna długość hasła**: 8 znaków?
3. **Format username**: tylko alfanumeryczne?
4. **Publiczne notatki**: widoczne dla niezalogowanych?
5. **Maksymalna długość notatki**: unlimited / limit?
6. **Upload avatarów**: tak / nie / później?
7. **Komentarze pod notatkami**: tak / nie / później?
8. **System oceniania**: tak / nie / później?

### ❓ **Do rozważenia:**

- **Rate limiting**: ile requestów na minutę?
- **Upload plików**: obrazki w notatkach?
- **Email verification**: wymagane przy rejestracji?
- **Reset hasła**: implementować od razu?

---

---

## 🚀 **Frontend Development Log**

### Aktualne technologie w użyciu:

- **Next.js 14** (App Router) - SSR/routing
- **TypeScript** - type safety
- **Tailwind CSS** - utility styling
- **Material-UI (MUI)** - complex komponenty
- **shadcn/ui** - customizable komponenty
- **Axios** - HTTP client
- **clsx + tailwind-merge** - conditional styling

### Struktura folderów:

```
src/
├── app/              # Next.js pages (App Router)
├── components/       # React komponenty
│   ├── ui/          # shadcn/ui komponenty
│   └── ...          # custom komponenty
├── lib/             # Utilities
│   ├── api.ts       # Axios config
│   └── utils.ts     # shadcn utils (cn function)
├── types/           # TypeScript definitions
└── ...
```

### Co będę implementować w kolejnych krokach:

1. **Mock API system** - symulacja backendu
2. **Authentication components** - login/register formy
3. **Notes CRUD** - tworzenie/edycja notatek
4. **UI komponenty** - layout, navigation

---

**📝 Uzupełnijcie sekcje API endpoints i dajcie mi znać - stworzę wtedy Mock API!**
