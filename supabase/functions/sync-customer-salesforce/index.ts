const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { firstName, lastName, email, phone, customerId } = await req.json()
    if (!email) return json({ success: false, error: 'Email is required' }, 400)

    const clientId = Deno.env.get('SALESFORCE_CLIENT_ID')
    const clientSecret = Deno.env.get('SALESFORCE_CLIENT_SECRET')
    const loginUrl = Deno.env.get('SALESFORCE_LOGIN_URL') || 'https://login.salesforce.com'
    const apiVersion = Deno.env.get('SALESFORCE_API_VERSION') || 'v65.0'

    if (!clientId || !clientSecret) throw new Error('Salesforce credentials are not configured')

    const tokenResponse = await fetch(`${loginUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret })
    })
    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error('Salesforce OAuth error:', tokenData)
      throw new Error('Unable to authenticate with Salesforce')
    }

    const accessToken = tokenData.access_token
    const instanceUrl = tokenData.instance_url
    const safeEmail = String(email).replaceAll("'", "\\'")
    const query = `SELECT Id, Email FROM Contact WHERE Email = '${safeEmail}' LIMIT 1`
    const queryResponse = await fetch(`${instanceUrl}/services/data/${apiVersion}/query/?q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const queryData = await queryResponse.json()
    const contactId = queryData.records?.[0]?.Id || null

    const contactData = {
      FirstName: firstName || '',
      LastName: lastName || 'Customer',
      Email: email,
      Phone: phone || '',
      LeadSource: 'UrbanCart Ecommerce',
      Description: `Supabase Customer ID: ${customerId || ''}`
    }

    if (contactId) {
      const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Contact/${contactId}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
      })
      if (!response.ok) throw new Error(`Salesforce Contact update failed: ${await response.text()}`)
      return json({ success: true, action: 'updated', salesforceContactId: contactId })
    }

    const response = await fetch(`${instanceUrl}/services/data/${apiVersion}/sobjects/Contact`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    })
    const created = await response.json()
    if (!response.ok) {
      console.error('Salesforce create error:', created)
      throw new Error('Unable to create Salesforce Contact')
    }
    return json({ success: true, action: 'created', salesforceContactId: created.id })
  } catch (error) {
    console.error(error)
    return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
