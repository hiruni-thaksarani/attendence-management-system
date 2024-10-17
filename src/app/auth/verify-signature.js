export default async function handler(req, res) {
    const { nonce, signature, address } = req.body;
    const response = await fetch('http://localhost:4000/auth/verify-signature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nonce, signature, address }),
    });
    const data = await response.json();
    res.status(200).json(data);
  }