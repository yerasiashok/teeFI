# teeFI 🎬
> Premium Indian Cinema Merchandise Platform

A full-stack e-commerce platform for Indian movie themed merchandise with **Print-on-Demand** fulfillment via Printful and payments via **Razorpay** (India) + **Stripe** (International).

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Backend    | Spring Boot 3.2, Java 21                        |
| Frontend   | React 18, Vite, TypeScript, TailwindCSS         |
| Database   | PostgreSQL 16 + Flyway migrations               |
| Cache      | Redis                                           |
| Events     | Apache Kafka                                    |
| Payments   | Razorpay (INR) + Stripe (USD)                   |
| PoD        | Printful API                                    |
| Storage    | AWS S3                                          |
| Auth       | Spring Security + JWT                           |

---

## Project Structure

```
teeFI/
├── backend/                     # Spring Boot monolith
│   └── src/main/java/com/teefi/
│       ├── config/              # Security, Kafka, Redis, CORS
│       ├── controller/          # REST endpoints
│       ├── dto/                 # Request/Response DTOs
│       ├── entity/              # JPA entities
│       ├── enums/               # Domain enums
│       ├── exception/           # Global error handling
│       ├── integration/
│       │   ├── payment/         # Razorpay + Stripe service
│       │   └── printful/        # Printful API integration
│       ├── kafka/               # Producers + Consumers
│       ├── repository/          # Spring Data JPA repos
│       ├── security/            # JWT filter + UserDetails
│       └── service/impl/        # Business logic
├── frontend/                    # React + Vite SPA
│   └── src/
│       ├── components/          # Reusable UI components
│       ├── pages/               # Route-level page components
│       ├── services/            # Axios API layer
│       ├── store/               # Zustand state (auth, cart)
│       └── types/               # TypeScript interfaces
└── docker-compose.yml
```

---

## Quick Start

### 1. Prerequisites
- Java 21, Maven 3.9+
- Node.js 20+, npm
- Docker + Docker Compose

### 2. Environment variables
```bash
cp .env.example .env
# Fill in your Razorpay, Stripe, Printful, and AWS credentials
```

### 3. Start infrastructure
```bash
docker-compose up postgres redis zookeeper kafka -d
```

### 4. Run backend
```bash
cd backend
mvn spring-boot:run
# Starts on http://localhost:8080/api
```

### 5. Run frontend
```bash
cd frontend
npm install
npm run dev
# Starts on http://localhost:5173
```

### 6. Or run everything with Docker
```bash
docker-compose up --build
```

---

## API Endpoints

### Auth
| Method | Endpoint           | Description     |
|--------|--------------------|-----------------|
| POST   | /auth/register     | Register user   |
| POST   | /auth/login        | Login user      |

### Products (public)
| Method | Endpoint                  | Description              |
|--------|---------------------------|--------------------------|
| GET    | /products                 | List with filters        |
| GET    | /products/{id}            | Product detail           |
| GET    | /products/featured        | Featured products        |
| GET    | /products/search?q=...    | Full-text search         |
| GET    | /products/movies          | All movie titles         |

### Cart (authenticated)
| Method | Endpoint              | Description       |
|--------|-----------------------|-------------------|
| GET    | /cart                 | Get user's cart   |
| POST   | /cart/items           | Add item          |
| PUT    | /cart/items/{id}      | Update quantity   |
| DELETE | /cart/items/{id}      | Remove item       |

### Orders (authenticated)
| Method | Endpoint                      | Description        |
|--------|-------------------------------|--------------------|
| POST   | /orders/checkout              | Create order       |
| GET    | /orders                       | My orders          |
| GET    | /orders/{orderNumber}         | Order detail       |

### Payments
| Method | Endpoint                        | Description               |
|--------|---------------------------------|---------------------------|
| POST   | /payments/webhook/razorpay      | Razorpay webhook          |
| POST   | /payments/webhook/stripe        | Stripe webhook            |
| POST   | /payments/verify/razorpay       | Frontend payment verify   |

### Admin (ROLE_ADMIN only)
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /admin/products       | Create product     |
| DELETE | /admin/products/{id}  | Soft-delete product|
| GET    | /admin/orders         | All orders         |

---

## Order Flow

```
User checkout
    → POST /orders/checkout        [order created, PAYMENT_INITIATED]
    → Razorpay/Stripe modal opens
    → User pays
    → Webhook hits /payments/webhook/razorpay
    → Payment verified (HMAC-SHA256)
    → Order status → PAID
    → ORDER_PAID event published to Kafka
    → KafkaConsumer (pod-group) picks it up
    → Printful API called → order submitted
    → Order status → SENT_TO_POD
    → Printful prints & ships
    → Printful webhook → /printful/webhook
    → package_shipped event received
    → Order status → SHIPPED + tracking saved
    → POD_SHIPPED Kafka event published
    → Email notification sent to user
```

---

## Kafka Topics

| Topic          | Producer         | Consumer          |
|----------------|------------------|-------------------|
| order.created  | OrderService     | NotificationSvc   |
| order.paid     | OrderService     | KafkaConsumer(PoD)|
| pod.shipped    | PrintfulWebhook  | NotificationSvc   |
| notify.email   | Various          | EmailService      |

---

## Webhook Setup

### Razorpay
- Dashboard → Webhooks → Add URL: `https://yourdomain.com/api/payments/webhook/razorpay`
- Events: `payment.captured`

### Stripe
- Dashboard → Webhooks → Add endpoint: `https://yourdomain.com/api/payments/webhook/stripe`
- Events: `payment_intent.succeeded`

### Printful
- Dashboard → Store → API → Webhooks → `https://yourdomain.com/api/printful/webhook`
- Events: `package_shipped`, `order_updated`

---

## Next Steps (Phase 2)
- [ ] Address management UI (currently uses mock)
- [ ] Stripe Elements frontend integration
- [ ] Email templates (order confirmation, shipping)
- [ ] AWS S3 artwork upload (admin)
- [ ] Product mockup preview via Printful API
- [ ] ElasticSearch for better product search
- [ ] WhatsApp notifications via Twilio
- [ ] Admin product creation UI
- [ ] Wishlist feature
