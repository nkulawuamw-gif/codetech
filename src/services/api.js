// Data layer — Supabase first, local fallback.
// Pages import from here instead of `data/content.js` directly.

import { supabase } from '../lib/supabase'
import * as local from '../data/content'

const FALLBACK_WARNED = { current: false }
const logFallback = (table) => {
  if (!FALLBACK_WARNED.current) {
    console.info(
      '[code-tech] Supabase not configured — using local data. ' +
      'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local to connect your database.'
    )
    FALLBACK_WARNED.current = true
  }
}

const safeQuery = async (table, fallback, transform) => {
  const { data, error } = await supabase.from(table).select('*').order('sort_order', { ascending: true })
  if (error) {
    console.warn(`[code-tech] Supabase ${table} fetch failed, using fallback:`, error.message)
    return Array.isArray(fallback) ? fallback : []
  }
  return transform ? transform(data) : data
}

// ----- Public read API -----

export async function getServices() {
  return safeQuery('services', local.services, (rows) =>
    rows.map(r => ({
      id: r.id,
      icon: r.icon,
      title: r.title,
      short: r.short,
      desc: r.description,
      features: r.features,
      price: r.price,
      priceValue: Number(r.price_value),
      color: r.color,
    }))
  )
}

export async function getHostingPlans() {
  return safeQuery('hosting_plans', local.hostingPlans)
}

export async function getDomains() {
  return safeQuery('domains', local.domains, (rows) =>
    rows.map(r => ({
      name: r.name,
      price: Number(r.price),
      popular: r.popular,
      desc: r.description,
    }))
  )
}

export async function getDemoSites() {
  return safeQuery('demo_sites', local.demoSites, (rows) =>
    rows.map(r => ({
      id: r.id,
      title: r.title,
      category: r.category,
      desc: r.description,
      tech: r.tech,
      image: r.image,
      color: r.color,
      features: r.features,
      url: r.url,
    }))
  )
}

// ----- Admin write API (requires authenticated admin) -----

export async function updateService(id, patch) {
  const { data, error } = await supabase
    .from('services')
    .update({
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.short !== undefined && { short: patch.short }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.price !== undefined && { price: patch.price }),
      ...(patch.priceValue !== undefined && { price_value: patch.priceValue }),
      ...(patch.features !== undefined && { features: patch.features }),
      ...(patch.icon !== undefined && { icon: patch.icon }),
      ...(patch.active !== undefined && { active: patch.active }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateHostingPlan(id, patch) {
  const { data, error } = await supabase
    .from('hosting_plans')
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.price !== undefined && { price: patch.price }),
      ...(patch.features !== undefined && { features: patch.features }),
      ...(patch.popular !== undefined && { popular: patch.popular }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDemoSite(id, patch) {
  const { data, error } = await supabase
    .from('demo_sites')
    .update({
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.tech !== undefined && { tech: patch.tech }),
      ...(patch.image !== undefined && { image: patch.image }),
      ...(patch.url !== undefined && { url: patch.url }),
      ...(patch.features !== undefined && { features: patch.features }),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDomain(name, patch) {
  const { data, error } = await supabase
    .from('domains')
    .update({
      ...(patch.price !== undefined && { price: patch.price }),
      ...(patch.popular !== undefined && { popular: patch.popular }),
      ...(patch.description !== undefined && { description: patch.description }),
      updated_at: new Date().toISOString(),
    })
    .eq('name', name)
    .select()
    .single()
  if (error) throw error
  return data
}

// ----- Orders -----

export async function placeOrder(order, items) {
  const { data: orderRow, error: orderError } = await supabase
    .from('orders')
    .insert({
      reference: order.reference,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      payment_method: order.paymentMethod,
      transaction_id: order.transactionId,
      subtotal: order.subtotal,
      discount: order.discount,
      total: order.total,
      status: 'pending',
    })
    .select()
    .single()
  if (orderError) throw orderError

  if (items && items.length > 0) {
    const itemRows = items.map(i => ({
      order_id: orderRow.id,
      item_type: i.type,
      item_id: i.id,
      title: i.title,
      subtitle: i.subtitle || null,
      icon: i.icon || null,
      price: i.price,
      qty: i.qty,
      billing: i.billing || null,
      domain_name: i.domainName || null,
    }))
    const { error: itemsError } = await supabase.from('order_items').insert(itemRows)
    if (itemsError) throw itemsError
  }

  return { reference: order.reference, id: orderRow.id }
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })
  if (error) { console.warn('[code-tech] getOrders failed:', error.message); return [] }
  return data || []
}

export async function updateOrderStatus(id, status) {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)
  if (error) throw error
}

// ----- Notifications (DB) -----

export async function getRemoteNotifications() {

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) return []
  return data || []
}

// ----- Demo requests -----

export async function submitDemoRequest(data) {

  const { data: row, error } = await supabase
    .from('demo_requests')
    .insert({
      demo_id: data.demoId,
      demo_title: data.demoTitle,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      project_name: data.projectName || null,
      project_desc: data.projectDesc || null,
      budget: data.budget || null,
    })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function getDemoRequests() {

  const { data, error } = await supabase
    .from('demo_requests')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.warn('[code-tech] getDemoRequests failed:', error.message); return [] }
  return data || []
}

// ----- Contact messages -----

export async function submitContactMessage(data) {

  const { data: row, error } = await supabase
    .from('contact_messages')
    .insert({
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      budget: data.budget || null,
      message: data.message,
    })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function getContactMessages() {

  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.warn('[code-tech] getContactMessages failed:', error.message); return [] }
  return data || []
}

export async function markMessageRead(id) {

  await supabase.from('contact_messages').update({ read: true }).eq('id', id)
}

// ----- Testimonials -----

export async function getTestimonials() {

  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) { console.warn('[code-tech] getTestimonials failed:', error.message); return [] }
  return data || []
}

export async function createTestimonial(data) {
  const { data: row, error } = await supabase
    .from('testimonials')
    .insert({
      quote: data.quote,
      name: data.name,
      role: data.role,
      initials: data.initials,
      sort_order: data.sortOrder || 0,
    })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function updateTestimonial(id, patch) {
  const { data, error } = await supabase
    .from('testimonials')
    .update({
      ...(patch.quote !== undefined && { quote: patch.quote }),
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.role !== undefined && { role: patch.role }),
      ...(patch.initials !== undefined && { initials: patch.initials }),
      ...(patch.active !== undefined && { active: patch.active }),
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTestimonial(id) {
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}

// ----- Site settings -----

export async function getSiteSetting(key) {
 null
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  if (error) return null
  return data?.value || null
}

export async function getSiteSettings() {

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
  if (error) return {}
  const map = {}
  data.forEach(r => { map[r.key] = r.value })
  return map
}

export async function updateSiteSetting(key, value) {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

// ----- Domain availability check (RDAP + DNS fallback) -----

const RDAP_ROUTES = {
  'com': 'https://rdap.verisign.com/com/v1/domain/',
  'net': 'https://rdap.verisign.com/net/v1/domain/',
  'org': 'https://rdap.publicinterestregistry.org/rdap/domain/',
  'io': 'https://rdap.identitydigital.services/rdap/domain/',
  'co': 'https://rdap.nic.co/rdap/domain/',
  'me': 'https://rdap.nic.me/rdap/domain/',
  'info': 'https://rdap.afilias.net/rdap/domain/',
  'biz': 'https://rdap.nic.biz/rdap/domain/',
  'xyz': 'https://rdap.nic.xyz/rdap/domain/',
  'online': 'https://rdap.nic.online/rdap/domain/',
  'site': 'https://rdap.nic.site/rdap/domain/',
  'tech': 'https://rdap.nic.tech/rdap/domain/',
  'store': 'https://rdap.nic.store/rdap/domain/',
  'cloud': 'https://rdap.nic.cloud/rdap/domain/',
  'app': 'https://rdap.nic.google/rdap/domain/',
  'dev': 'https://rdap.nic.google/rdap/domain/',
}

export async function checkDomain(domain) {
  const parts = domain.split('.')
  if (parts.length < 2) return { domain, available: false, error: 'Invalid domain' }

  const tld = parts.slice(-1)[0].toLowerCase()

  // 1. Try RDAP (free, standardized WHOIS replacement)
  const rdapBase = RDAP_ROUTES[tld]
  if (rdapBase) {
    try {
      const resp = await fetch(rdapBase + domain)
      if (resp.ok) {
        return { domain, available: false, registered: true, method: 'rdap' }
      }
      if (resp.status === 404) {
        return { domain, available: true, method: 'rdap' }
      }
    } catch { /* CORS or network error — fall through */ }
  }

  // 2. Fallback: DNS over HTTPS via Google (broad CORS support)
  try {
    const resp = await fetch(`https://dns.google/resolve?name=${domain}&type=ANY`)
    const data = await resp.json()
    if (data.Status === 3) {
      return { domain, available: true, method: 'dns' }
    }
    if (data.Answer && data.Answer.length > 0) {
      return { domain, available: false, registered: true, method: 'dns' }
    }
  } catch {}

  return { domain, available: null, error: 'Could not determine availability' }
}

export async function pushRemoteNotification(n) {
 null
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      type: n.type || 'message',
      title: n.title,
      body: n.body,
      meta: n.meta || null,
    })
    .select()
    .single()
  if (error) return null
  return data
}
