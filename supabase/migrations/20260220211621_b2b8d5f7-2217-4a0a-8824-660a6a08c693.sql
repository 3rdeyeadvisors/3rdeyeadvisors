CREATE POLICY "Anyone can view active printify products"
  ON public.printify_products
  FOR SELECT
  USING (is_active = true);