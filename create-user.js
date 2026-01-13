const userData = {
  email: 'adriano@compostoweb.com.br',
  password: 'Adri@2026!SecurePass',
  name: 'Adriano'
};

async function createUser() {
  let retries = 10;
  while (retries > 0) {
    try {
      const res = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      console.log('Response:', data);
      process.exit(0);
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.error('Failed after retries:', err.message);
        process.exit(1);
      }
      console.log(`Retry... (${retries} left)`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

createUser();
