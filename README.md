<div align="center">

# 📚 Bibliora

### Modern Library Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-5.15.10-0081CB.svg)](https://mui.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-316192.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

*A full-stack library management system featuring JWT authentication, role-based access control, and a beautiful Material-UI interface.*

[Features](#-features) • [Tech Stack](#️-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-api-documentation) • [Contributing](#-contributing)

---

</div>

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- JWT-based authentication
- OAuth2 resource server
- Role-based access control
- Password reset functionality
- Email verification
- Secure session management

</td>
<td width="50%">

### 📖 Library Operations
- Complete book catalog management
- Member registration & profiles
- Borrowing & return tracking
- Overdue notifications
- Search & filter capabilities
- Real-time availability status

</td>
</tr>
<tr>
<td width="50%">

### 🎨 Modern UI/UX
- Responsive Material-UI design
- Smooth Framer Motion animations
- Real-time toast notifications
- Dark/Light theme support
- Mobile-first approach
- Intuitive navigation

</td>
<td width="50%">

### 🛡️ Admin Features
- User management dashboard
- Analytics & reporting
- System configuration
- Audit logs
- Email notifications
- Data export capabilities

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Backend Technologies

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Maven](https://img.shields.io/badge/Maven-C71A36?style=for-the-badge&logo=apache-maven&logoColor=white)

### Frontend Technologies

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=mui&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React%20Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

</div>

<details>
<summary><b>📦 Complete Dependencies List</b></summary>

### Backend
- **Core**: Spring Boot 3.5.6, Java 17
- **Security**: Spring Security, JWT (JJWT 0.12.3), OAuth2
- **Database**: Spring Data JPA, PostgreSQL
- **API Documentation**: SpringDoc OpenAPI 2.3.0
- **Email**: Spring Boot Mail
- **Validation**: Spring Boot Validation
- **Utilities**: Lombok, ModelMapper 3.2.0
- **Dev Tools**: Spring Boot DevTools

### Frontend
- **Core**: React 18.3.1, Vite 7.1.10
- **UI Framework**: Material-UI 5.15.10, Emotion
- **Routing**: React Router DOM 6.22.0
- **State Management**: Zustand 4.5.0
- **Data Fetching**: TanStack React Query 5.20.5, Axios 1.6.7
- **Forms**: React Hook Form 7.50.1, Yup 1.3.3, Hookform Resolvers
- **Animations**: Framer Motion 11.0.3
- **Notifications**: React Toastify 10.0.4
- **Testing**: Vitest 3.2.4

</details>

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

```bash
☑️ Java 17 or higher
☑️ Maven 3.6+
☑️ Node.js 16+ and npm
☑️ PostgreSQL 12+
```

---

## 🚀 Getting Started

### 🔧 Backend Setup

<details open>
<summary><b>Click to expand setup instructions</b></summary>

#### 1️⃣ Clone the repository
```bash
git clone https://github.com/Ahmedbensaid11/bibliora.git
cd bibliora
```

#### 2️⃣ Configure PostgreSQL
Create a new database:
```sql
CREATE DATABASE bibliotheque;
CREATE USER bibliora_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bibliotheque TO bibliora_user;
```

#### 3️⃣ Configure application properties
Create `src/main/resources/application.properties`:
```properties
# ============================================
# DATABASE CONFIGURATION
# ============================================
spring.datasource.url=jdbc:postgresql://localhost:5432/bibliotheque
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ============================================
# JWT CONFIGURATION
# ============================================
jwt.secret=your_secret_key_here_minimum_256_bits
jwt.expiration=86400000
jwt.refresh.expiration=604800000

# ============================================
# EMAIL CONFIGURATION
# ============================================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# ============================================
# SERVER CONFIGURATION
# ============================================
server.port=8080
spring.application.name=Bibliora
```

#### 4️⃣ Run the backend
```bash
mvn clean install
mvn spring-boot:run
```

✅ **Backend running at:** `http://localhost:8080`

</details>

### 🎨 Frontend Setup

<details open>
<summary><b>Click to expand setup instructions</b></summary>

#### 1️⃣ Navigate to frontend directory
```bash
cd library-frontend
```

#### 2️⃣ Install dependencies
```bash
npm install
```

#### 3️⃣ Configure environment variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:8080/api
VITE_APP_NAME=Bibliora
```

#### 4️⃣ Run the frontend
```bash
npm run dev
```

✅ **Frontend running at:** `http://localhost:5173`

</details>

---

## 📁 Project Structure

<table>
<tr>
<td width="50%">

### 🔹 Backend Architecture

```
com.bibliotheque.gestion/
├── 📁 config/
│   └── DataInitializer
├── 📁 controller/
│   └── AuthController
├── 📁 dto/
│   ├── ApiResponse
│   ├── AuthResponse
│   ├── LoginRequest
│   ├── RegisterRequest
│   └── ...
├── 📁 entity/
│   ├── User
│   ├── Role
│   └── ...
├── 📁 exception/
│   ├── BadRequestException
│   ├── GlobalExceptionHandler
│   └── ...
├── 📁 mapper/
├── 📁 repository/
│   ├── UserRepository
│   └── RoleRepository
├── 📁 security/
│   ├── JwtTokenProvider
│   ├── SecurityConfig
│   └── ...
└── 📁 service/
    ├── AuthService
    └── EmailService
```

</td>
<td width="50%">

### 🔹 Frontend Architecture

```
src/
├── 📁 api/
│   ├── authService.js
│   └── axios.config.js
├── 📁 assets/
│   ├── logo.png
│   └── react.svg
├── 📁 components/
├── 📁 hooks/
├── 📁 pages/
│   └── auth/
│       ├── Login.jsx
│       └── Register.jsx
├── 📁 router/
│   └── index.jsx
├── 📁 store/
│   └── authStore.js
├── 📁 styles/
│   └── theme.js
├── 📁 utils/
├── App.jsx
└── main.jsx
```

</td>
</tr>
</table>

---

## 🔐 API Documentation

Once the backend is running, access the **interactive API documentation**:

🌐 **Swagger UI:** [`http://localhost:8080/swagger-ui.html`](http://localhost:8080/swagger-ui.html)

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/verify-email` | Verify email address |

---

## 🧪 Testing

### Run Backend Tests
```bash
cd bibliora
mvn test
mvn test -Dtest=AuthServiceTest
```

### Run Frontend Tests
```bash
cd library-frontend
npm run test
npm run test:coverage
```

---

## 📦 Building for Production

### 🏗️ Backend Build
```bash
mvn clean package -DskipTests
java -jar target/gestion-bibliotheque-0.0.1-SNAPSHOT.jar
```

### 🏗️ Frontend Build
```bash
npm run build
npm run preview  # Preview production build locally
```

The production build will be in the `dist/` directory.

---

## 🔑 Default Credentials

After running the DataInitializer, the following test accounts are available:

| Role | Email | Password |
|------|-------|----------|
| 👑 **Admin** | admin@bibliora.com | admin123 |
| 📚 **Librarian** | librarian@bibliora.com | librarian123 |
| 👤 **Member** | member@bibliora.com | member123 |

> ⚠️ **Security Warning:** Change these credentials immediately in production environments!

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** your feature branch
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open** a Pull Request

### 📝 Contribution Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Author

<div align="center">

**Ahmed Ben Said**

[![GitHub](https://img.shields.io/badge/GitHub-Ahmedbensaid11-181717?style=for-the-badge&logo=github)](https://github.com/Ahmedbensaid11)
[![Email](https://img.shields.io/badge/Email-Contact-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ahmed@example.com)

</div>

---

## 🙏 Acknowledgments

Special thanks to:

- 🍃 **Spring Boot Team** - For the excellent framework
- ⚛️ **React Community** - For the amazing ecosystem
- 🎨 **Material-UI Team** - For the beautiful components
- 🐘 **PostgreSQL Community** - For the robust database
- 💝 **All Contributors** - For helping improve this project

---

<div align="center">

### 🌟 If you found this project helpful, please give it a star!

Made with ❤️ by Ahmed Ben Said

**[⬆ Back to Top](#-bibliora)**

</div>
