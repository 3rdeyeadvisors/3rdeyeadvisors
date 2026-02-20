

# Fix: Store Not Showing Merchandise

## Root Cause

The `printify_products_public` view was created with `security_invoker=on`. This means when a regular (non-admin) user queries the view, Postgres checks the **base table's** RLS policies using that user's role. The base table `printify_products` only allows SELECT for admins, so all non-admin users (including anonymous visitors) get an empty result.

## Fix

Add a SELECT policy on the `printify_products` base table that allows **everyone** to read active products. This is safe because:
- The view already filters to `is_active = true` only
- The view excludes sensitive columns like `stripe_product_id` and `stripe_prices`
- Product catalog data (title, images, variants, prices) is meant to be public

### Database Migration

```sql
CREATE POLICY "Anyone can view active printify products"
  ON public.printify_products
  FOR SELECT
  USING (is_active = true);
```

This single policy change will make the existing view return data for all visitors. No code changes needed.

### Technical Notes

- The `printify_products_public` view with `security_invoker=on` is actually a good security pattern -- it just needs the base table to permit public reads of active products
- Sensitive fields (`stripe_product_id`, `stripe_prices`) are already excluded from the view
- The existing admin-only SELECT policy will still work alongside this new permissive policy

