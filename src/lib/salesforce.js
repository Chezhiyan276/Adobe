import { supabase, supabaseConfigured } from './supabase'

const enabled = import.meta.env.VITE_SALESFORCE_SYNC_ENABLED === 'true'

export async function syncCustomerToSalesforce(customer) {
  if (!enabled || !supabaseConfigured || !customer?.email) {
    return { success: false, skipped: true }
  }

  let customerId = customer.customerId || ''

  // If we only have the Supabase Auth UUID,
  // retrieve the UrbanCart Customer ID from profiles.
  if (customer.id && !customerId) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('customer_id')
      .eq('id', customer.id)
      .single()

    if (profileError) {
      console.error('Unable to retrieve customer profile:', profileError)
    } else {
      customerId = profile?.customer_id || ''
    }
  }

  const { data, error } = await supabase.functions.invoke(
    'sync-customer-salesforce',
    {
      body: {
        firstName: customer.firstName || '',
        lastName: customer.lastName || 'Customer',
        email: customer.email,
        phone: customer.phone || '',
        customerId
      }
    }
  )

  if (error) {
    console.error('Salesforce sync failed:', error)
    return { success: false, error: error.message }
  }

  return data || { success: true }
}
