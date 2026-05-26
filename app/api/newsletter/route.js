export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Email invalid' }, { status: 400 })
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.MAILERLITE_API_KEY}`
      },
      body: JSON.stringify({
        email: email,
        fields: {
          source: 'everify.ro'
        }
      })
    })

    const data = await response.json()

    if (response.ok) {
      return Response.json({ success: true, message: 'Abonare reușită!' })
    } else {
      if (data.message?.includes('already') || response.status === 409) {
        return Response.json({ success: true, message: 'Ești deja abonat!' })
      }
      return Response.json({ error: 'Eroare la abonare' }, { status: 500 })
    }

  } catch (error) {
    console.error('Newsletter error:', error)
    return Response.json({ error: 'Eroare server' }, { status: 500 })
  }
}