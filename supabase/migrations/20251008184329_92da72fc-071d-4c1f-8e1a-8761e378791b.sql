-- Remove orphaned organizations with no members
DELETE FROM public.organizations 
WHERE id IN (
  '79789c68-aad4-4b22-9c4f-0fa1b7f51b37',
  '516a4c8f-87da-4a87-a37b-e6e5e97b6cc1',
  '48649c10-9f68-4b2f-b9f5-6d587e2f2c25'
);