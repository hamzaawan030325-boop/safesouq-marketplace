# SafeSouq Architecture

## Recommended production architecture

### Client apps

- Web storefront in Next.js
- Seller dashboard in Next.js with role-based routes
- Admin control room in Next.js with restricted access
- Mobile app in React Native / Expo for buyers and sellers

### Backend services

- `api-gateway`
  Handles auth, request validation, rate limits and public APIs.
- `catalog-service`
  Products, categories, search indexing and brand metadata.
- `seller-service`
  Onboarding, KYC state, store settings and payouts.
- `order-service`
  Cart, checkout, orders, returns and delivery status.
- `payment-service`
  Gateway integration, escrow releases, settlements and ledger.
- `trust-service`
  Piracy reports, disputes, counterfeit detection and seller risk scoring.
- `notification-service`
  Email, SMS, push notifications and internal alerts.

### Data layer

- PostgreSQL for transactional data
- Redis for cache, queues, sessions and throttling
- S3 compatible storage for product media and dispute evidence
- Search engine for catalog search and ranking

## Security controls

- JWT access tokens with rotating refresh tokens
- Two-factor authentication for sellers and admins
- Role-based access control with granular scopes
- Audit logging for sensitive actions
- Image hash matching for copied or pirated content
- Brand registry for rights holders
- Escrow payouts with dispute holds
- Device fingerprinting and login anomaly detection

## Suggested modules

### Buyer

- browse catalog
- search and filters
- cart and checkout
- orders and returns
- dispute submission

### Seller

- onboarding and KYC
- product CRUD
- stock and pricing
- order fulfillment
- payouts and reports

### Admin

- moderation queues
- seller risk reviews
- piracy complaint workflow
- dispute resolution
- settlement holds and penalties

## Database entities

```sql
users(id, name, email, phone, password_hash, role, two_factor_enabled, status)
seller_profiles(id, user_id, shop_name, kyc_status, risk_score, payout_account_id)
brands(id, owner_user_id, brand_name, trademark_no, verification_status)
products(id, seller_id, brand_id, title, slug, description, category_id, status)
product_variants(id, product_id, sku, price, stock, attributes_json)
orders(id, buyer_id, seller_id, status, total_amount, payment_status, shipping_status)
order_items(id, order_id, product_variant_id, quantity, unit_price)
payments(id, order_id, provider, txn_ref, escrow_status, released_at)
disputes(id, order_id, raised_by, reason, evidence_url, resolution, status)
piracy_reports(id, reporter_id, product_id, report_type, status, notes)
audit_logs(id, actor_id, action, entity_type, entity_id, meta_json)
```
