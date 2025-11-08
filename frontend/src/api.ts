const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'
export async function api(path, opts = {}){ const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) }, ...opts }); if(!res.ok){ let msg='Request failed'; try{ const j=await res.json(); msg=j?.error?.message||msg }catch{} throw new Error(msg)} return res.json() }
export const fetchProducts = () => api('/api/products')
export const fetchCart = () => api('/api/cart')
export const addToCart = (productId, qty) => api('/api/cart', { method: 'POST', body: JSON.stringify({ productId, qty })})
export const removeCartItem = (id) => api(`/api/cart/${id}`, { method: 'DELETE' })
export const checkout = (payload) => api('/api/checkout', { method: 'POST', body: JSON.stringify(payload) })
