import { supabase, supabaseConfigured } from './supabase'

const enabled = import.meta.env.VITE_SALESFORCE_SYNC_ENABLED === 'true'

export async function syncCustomerToSalesforce(customer) {
  if (!enabled || !supabaseConfigured || !customer?.email) return { success: false, skipped: true }

  const { data, error } = await supabase.functions.invoke('sync-customer-salesforce', {
    body: {
      firstName: customer.firstName || '',
      lastName: customer.lastName || 'Customer',
      email: customer.email,
      phone: customer.phone || '',
      customerId: customer.id || ''
    }
  })

  if (error) {
    console.error('Salesforce sync failed:', error)
    return { success: false, error: error.message }
  }
  return data || { success: true }
}
