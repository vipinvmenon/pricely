-- Alert delivery observability: only deactivate after verified send.
alter table public.alerts
  add column if not exists last_delivery_status text,
  add column if not exists last_delivery_error text,
  add column if not exists last_delivery_message_id text;
