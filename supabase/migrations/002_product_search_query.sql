-- Stable product IDs: store the scrape query separately from products.id
alter table public.products
  add column if not exists search_query text;

create index if not exists products_search_query_idx on public.products(search_query);
