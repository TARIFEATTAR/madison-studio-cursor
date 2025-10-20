-- Increase reference image size limit to 20MB
UPDATE storage.buckets
SET file_size_limit = 20971520
WHERE id = 'reference-images';