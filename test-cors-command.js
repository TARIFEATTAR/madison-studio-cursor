// Copy and paste this entire block into your browser console

fetch('https://likkskifwsrvszxdvufw.supabase.co/functions/v1/get-subscription', {
  method: 'OPTIONS',
  headers: {
    'Access-Control-Request-Method': 'GET',
    'Access-Control-Request-Headers': 'authorization',
    'Origin': 'http://localhost:8080'
  }
})
.then(r => {
  console.log('Status:', r.status);
  console.log('OK:', r.ok);
  console.log('Headers:', [...r.headers.entries()]);
  return r.text();
})
.then(text => console.log('Body:', text))
.catch(error => console.error('Error:', error));

















