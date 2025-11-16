import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="relative h-[360px] w-full overflow-hidden">
        <Spline scene="https://prod.spline.design/8nsoLg1te84JZcE9/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/40 to-white pointer-events-none"></div>
        <div className="absolute inset-0 flex items-end justify-between px-4 sm:px-8 pb-6">
          <Link to="/" className="font-extrabold text-2xl sm:text-3xl">ShopLite</Link>
          <nav className="flex gap-4 text-sm sm:text-base">
            <Link to="/cart" className="hover:underline">Cart</Link>
            <Link to="/admin" className="hover:underline">Seller</Link>
          </nav>
        </div>
      </header>
      <main className="px-4 sm:px-8 py-8 max-w-6xl mx-auto">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} ShopLite</footer>
    </div>
  )
}

function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(setProducts).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center">Loading...</div>

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => (
        <Link key={p.sku} to={`/product/${p.sku}`} className="group border rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition">
          <div className="aspect-square bg-gray-100">
            {p.images?.[0] && <img alt={p.name} src={p.images[0]} className="w-full h-full object-cover" />}
          </div>
          <div className="p-3">
            <div className="font-semibold line-clamp-1">{p.name}</div>
            <div className="text-sm text-gray-500 line-clamp-2 h-9">{p.description}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-lg font-bold">₹{(p.sale_price ?? p.price).toFixed(2)}</div>
              {p.sale_price && <div className="text-sm text-gray-400 line-through">₹{p.price.toFixed(2)}</div>}
            </div>
            <button className="mt-3 w-full bg-black text-white py-2 rounded-lg">Add to Cart</button>
          </div>
        </Link>
      ))}
    </div>
  )
}

function ProductPage() {
  const { sku } = useParams()
  const [p, setP] = useState(null)
  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    fetch(`${API}/products/${sku}`).then(r => r.json()).then(d => { setP(d); setSize(d.sizes?.[0]||''); setColor(d.colors?.[0]||'') })
  }, [sku])

  if (!p) return <div>Loading...</div>

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {p.images?.[0] && <img alt={p.name} src={p.images[0]} className="w-full h-full object-cover" />}
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {p.images?.slice(0,5).map((img, i) => (
            <img key={i} src={img} className="aspect-square w-full object-cover rounded-md border" />
          ))}
        </div>
      </div>
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="text-gray-600 mt-2">{p.description}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-2xl font-bold">₹{(p.sale_price ?? p.price).toFixed(2)}</div>
          {p.sale_price && <div className="text-gray-400 line-through">₹{p.price.toFixed(2)}</div>}
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Size</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {p.sizes?.map(s => (
              <button key={s} onClick={() => setSize(s)} className={`px-3 py-1 rounded border ${size===s?'bg-black text-white':'bg-white'}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Color</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {p.colors?.map(c => (
              <button key={c} onClick={() => setColor(c)} className={`px-3 py-1 rounded border ${color===c?'bg-black text-white':'bg-white'}`}>{c}</button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium">Quantity</label>
          <input type="number" min={1} value={qty} onChange={e=>setQty(parseInt(e.target.value)||1)} className="mt-1 border rounded px-3 py-2 w-24" />
        </div>
        <div className="mt-6 flex gap-3">
          <Link to={`/checkout?sku=${p.sku}&qty=${qty}&size=${size}&color=${color}`} className="bg-black text-white px-5 py-3 rounded-lg">Buy Now</Link>
          <button className="border px-5 py-3 rounded-lg">Add to Cart</button>
        </div>
        <div className="mt-8">
          <h3 className="font-semibold">Features</h3>
          <ul className="list-disc ml-6 text-sm text-gray-600 mt-2">
            <li>Premium quality materials</li>
            <li>30-day return policy</li>
            <li>Fast shipping across India</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function Checkout() {
  const params = new URLSearchParams(window.location.search)
  const sku = params.get('sku')
  const qty = parseInt(params.get('qty')||'1')
  const size = params.get('size')||''
  const color = params.get('color')||''
  const [product, setProduct] = useState(null)
  const nav = useNavigate()

  useEffect(() => { if(sku){ fetch(`${API}/products/${sku}`).then(r=>r.json()).then(setProduct) } }, [sku])

  function handleSubmit(e){
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const customer = {
      full_name: fd.get('full_name'),
      address: fd.get('address'),
      city: fd.get('city'),
      postal_code: fd.get('postal_code'),
      phone: fd.get('phone'),
      alt_phone: fd.get('alt_phone'),
      note: fd.get('note'),
    }
    const subtotal = (product ? (product.sale_price ?? product.price) : 0) * qty
    const taxes = +(subtotal * 0.0).toFixed(2)
    const shipping = subtotal > 999 ? 0 : 49
    const total = subtotal + taxes + shipping
    const order = {
      items: [{
        product_id: '', name: product.name, sku: product.sku, price: (product.sale_price ?? product.price), color, size, quantity: qty, image: product.images?.[0] || ''
      }],
      customer, subtotal, taxes, shipping, total, status: 'Pending', payment_status: 'mocked'
    }
    fetch(`${API}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
      .then(r=>r.json()).then(res=>{ nav(`/order/${res.order_id}`) })
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Delivery details</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4" aria-label="Checkout form">
          <label className="grid gap-1">
            <span className="text-sm">Full name</span>
            <input name="full_name" required className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">Address</span>
            <textarea name="address" required className="border rounded px-3 py-2" />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">City</span>
              <input name="city" required className="border rounded px-3 py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Postal code</span>
              <input name="postal_code" required className="border rounded px-3 py-2" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="grid gap-1">
              <span className="text-sm">Phone</span>
              <input name="phone" required className="border rounded px-3 py-2" />
            </label>
            <label className="grid gap-1">
              <span className="text-sm">Alternate phone</span>
              <input name="alt_phone" className="border rounded px-3 py-2" />
            </label>
          </div>
          <label className="grid gap-1">
            <span className="text-sm">Order note (optional)</span>
            <textarea name="note" className="border rounded px-3 py-2" />
          </label>
          <button className="mt-2 bg-black text-white py-3 rounded-lg">Place order</button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Summary</h2>
        {product ? (
          <div className="border rounded-xl p-4">
            <div className="flex gap-3">
              <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden">
                {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{product.name}</div>
                <div className="text-sm text-gray-500">{size} {color} x {qty}</div>
              </div>
              <div className="font-semibold">₹{((product.sale_price ?? product.price) * qty).toFixed(2)}</div>
            </div>
            <div className="mt-4 border-t pt-3 text-sm space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{((product.sale_price ?? product.price) * qty).toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{(((product.sale_price ?? product.price) * qty) > 999 ? 0 : 49).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{(((product.sale_price ?? product.price) * qty) + (((product.sale_price ?? product.price) * qty) > 999 ? 0 : 49)).toFixed(2)}</span></div>
            </div>
          </div>
        ) : (<div className="text-sm text-gray-500">Loading summary...</div>)}
      </div>
    </div>
  )
}

function OrderConfirmation(){
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  useEffect(()=>{ fetch(`${API}/orders/${id}`).then(r=>r.json()).then(setOrder) }, [id])
  if(!order) return <div>Loading...</div>
  return (
    <div className="max-w-xl mx-auto text-center">
      <div className="text-3xl font-bold">Thank you! 🎉</div>
      <div className="mt-2">Your order has been placed.</div>
      <div className="mt-4 p-4 border rounded-xl bg-gray-50">
        <div className="font-semibold">Order ID</div>
        <div className="font-mono">{order.id}</div>
        <div className="mt-2 text-sm text-gray-600">Status: {order.status}</div>
        <Link to="/" className="inline-block mt-4 bg-black text-white px-5 py-3 rounded-lg">Continue shopping</Link>
      </div>
    </div>
  )
}

function Cart(){
  return <div>Your cart is empty in this scaffold. Use Buy Now from a product to simulate checkout.</div>
}

export default function AppRouter(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home/></Layout>} />
        <Route path="/product/:sku" element={<Layout><ProductPage/></Layout>} />
        <Route path="/checkout" element={<Layout><Checkout/></Layout>} />
        <Route path="/order/:id" element={<Layout><OrderConfirmation/></Layout>} />
        <Route path="/cart" element={<Layout><Cart/></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
