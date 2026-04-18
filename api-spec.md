# SafeSouq API Starter Spec

## Authentication

### `POST /api/v1/auth/register`

Creates buyer or seller account.

Request:

```json
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "Secret123!",
  "role": "seller"
}
```

### `POST /api/v1/auth/login`

Authenticates account and returns access and refresh tokens.

### `POST /api/v1/auth/verify-otp`

Completes second factor verification.

## Seller

### `GET /api/v1/seller/dashboard`

Returns metrics, payouts, orders and alerts.

### `POST /api/v1/seller/products`

Creates a new product draft.

### `PATCH /api/v1/seller/products/:id`

Updates product listing.

### `GET /api/v1/seller/orders`

Returns seller order list.

## Marketplace

### `GET /api/v1/products`

Returns catalog listings with filters:

- `category`
- `keyword`
- `seller_verified`
- `price_min`
- `price_max`

### `GET /api/v1/products/:slug`

Returns full product detail.

### `POST /api/v1/cart/items`

Adds item to cart.

### `POST /api/v1/checkout`

Creates order and payment intent.

## Admin

### `GET /api/v1/admin/moderation/queues`

Returns new listings, disputes and piracy report counts.

### `POST /api/v1/admin/products/:id/approve`

Approves moderated product.

### `POST /api/v1/admin/products/:id/reject`

Rejects product with reason.

### `POST /api/v1/admin/piracy-reports/:id/action`

Takedown, warn seller ya request evidence.

### `POST /api/v1/admin/disputes/:id/resolve`

Resolve dispute and update escrow decision.

## Security middleware

- rate limiting
- request signature verification for internal webhooks
- RBAC policy checks
- audit logging
- IP and device anomaly detection
