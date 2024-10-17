export default async function handler(req, res) {
    const response = await fetch('http://localhost:4000/auth/generate-nonce', {
      method: 'POST',
    });
    const data = await response.json();
    res.status(200).json(data);
  }