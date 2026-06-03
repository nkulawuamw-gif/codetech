import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiCheck,
  FiX, FiCopy, FiUser, FiMail, FiPhone, FiTag, FiShield, FiCreditCard, FiSmartphone, FiHome,
} from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import { useNotifications } from '../context/NotificationsContext'
import { placeOrder as placeOrderDb, pushRemoteNotification } from '../services/api'
import './Cart.css'
import './shared-pages.css'

const paymentMethods = [
  {
    id: 'airtel',
    name: 'Airtel Money',
    desc: 'Pay instantly from your Airtel Money wallet',
    icon: 'airtel',
    color: '#E60000',
    details: {
      label: 'Send payment to',
      account: '+265 99 000 1111',
      name: 'CODE TECH Ltd',
      instructions: 'Dial *211# → Send Money → Enter number → Enter amount → Confirm with PIN. Then tap "I have paid" below and enter your Airtel transaction ID.',
    },
  },
  {
    id: 'tnm',
    name: 'TNM Mpamba',
    desc: 'Pay from your TNM Mpamba mobile wallet',
    icon: 'tnm',
    color: '#FFC72C',
    details: {
      label: 'Send payment to',
      account: '+265 88 000 2222',
      name: 'CODE TECH Ltd',
      instructions: 'Dial *444# → Send Money → Enter number → Enter amount → Confirm with PIN. Then tap "I have paid" below and enter your Mpamba transaction ID.',
    },
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    desc: 'Direct bank deposit or electronic transfer',
    icon: 'bank',
    color: '#10b981',
    details: {
      label: 'Bank account details',
      account: 'CODE TECH Ltd — 1234567890',
      name: 'National Bank of Malawi',
      instructions: 'Use your order reference as the deposit note. Allow 1–2 business hours for funds to clear. Then tap "I have paid" below and enter your bank reference.',
    },
  },
]

const PaymentIcon = ({ id }) => {
  if (id === 'airtel') {
    return (
      <span className="pay-logo pay-airtel" aria-hidden="true">
        <span className="pay-logo-letter">A</span>
      </span>
    )
  }
  if (id === 'tnm') {
    return (
      <span className="pay-logo pay-tnm" aria-hidden="true">
        <span className="pay-logo-letter">T</span>
      </span>
    )
  }
  return <FiHome className="pay-svg" />
}

const formatMWK = (n) => `MWK ${Number(n).toLocaleString()}`

export default function Cart() {
  const { items, itemCount, subtotal, discount, total, removeItem, updateQty, clearCart } = useCart()
  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const [selectedMethod, setSelectedMethod] = useState('airtel')
  const [step, setStep] = useState('cart') // 'cart' | 'details' | 'payment' | 'success'
  const [orderRef] = useState(`CT-${Date.now().toString(36).toUpperCase()}`)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [txId, setTxId] = useState('')
  const [copied, setCopied] = useState(false)

  const method = paymentMethods.find(m => m.id === selectedMethod)

  const updateForm = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const copyAccount = () => {
    navigator.clipboard?.writeText(method.details.account)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const goToDetails = () => {
    if (items.length === 0) return
    setStep('details')
  }

  const goToPayment = (e) => {
    e.preventDefault()
    setStep('payment')
  }

  const placeOrder = async (e) => {
    e.preventDefault()
    const meta = {
      email: form.email,
      phone: form.phone,
      orderRef,
      method: method.name,
      txId,
      services: items.map(i => i.title),
    }
    // Persist to Supabase (no-op if not configured)
    try {
      await placeOrderDb({
        reference: orderRef,
        customerName: form.name,
        customerEmail: form.email,
        customerPhone: form.phone,
        paymentMethod: selectedMethod,
        transactionId: txId,
        subtotal, discount, total,
      }, items)
    } catch (err) {
      console.warn('[code-tech] placeOrder DB write failed:', err.message)
    }
    // Local notification (always, so user sees something)
    addNotification({
      type: 'message',
      title: `Order placed — ${orderRef}`,
      body: `${itemCount} item${itemCount === 1 ? '' : 's'} totalling ${formatMWK(total)} via ${method.name}.`,
      meta,
    })
    // Mirror to DB notifications (best-effort)
    pushRemoteNotification({
      type: 'order',
      title: `New order — ${orderRef}`,
      body: `${form.name} ordered ${itemCount} item${itemCount === 1 ? '' : 's'} (${formatMWK(total)}) via ${method.name}.`,
      meta,
    }).catch(() => {})
    setStep('success')
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="cart-page">
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Your Cart</span>
            <h1>Your cart is <span className="gradient-text">empty</span></h1>
            <p>Looks like you haven't added anything yet. Browse our services to get started.</p>
          </div>
        </section>
        <section className="cart-section">
          <div className="container">
            <div className="cart-empty">
              <div className="cart-empty-icon"><FiShoppingCart /></div>
              <h3>No items in your cart</h3>
              <p>Choose from our services, hosting plans, or domains to get started.</p>
              <div className="cart-empty-cta">
                <Link to="/services" className="btn btn-primary btn-lg">Browse Services</Link>
                <Link to="/hosting" className="btn btn-secondary btn-lg">View Hosting</Link>
                <Link to="/domains" className="btn btn-secondary btn-lg">Search Domains</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  if (step === 'success') {
    return (
      <div className="cart-page">
        <section className="page-hero">
          <div className="container">
            <span className="eyebrow">Order Placed</span>
            <h1>Thank you, <span className="gradient-text">{form.name || 'friend'}!</span></h1>
            <p>Your order has been recorded. We'll confirm your payment within minutes and reach out to begin work.</p>
          </div>
        </section>
        <section className="cart-section">
          <div className="container">
            <div className="cart-success">
              <div className="success-icon"><FiCheck /></div>
              <h2>Order received</h2>
              <p className="success-ref">Reference: <strong>{orderRef}</strong></p>
              <div className="success-summary">
                <div className="success-row"><span>Items</span><span>{itemCount}</span></div>
                <div className="success-row"><span>Payment method</span><span>{method.name}</span></div>
                {txId && <div className="success-row"><span>Transaction ID</span><span>{txId}</span></div>}
                <div className="success-row total"><span>Total</span><span>{formatMWK(total)}</span></div>
              </div>
              <p className="success-note">
                We'll verify your {method.name} payment and send a confirmation to <strong>{form.email || 'your email'}</strong>.
                In the meantime, you can reach us on WhatsApp: <a href="https://wa.me/265995479580" target="_blank" rel="noopener noreferrer">+265 995 479 580</a>.
              </p>
              <div className="success-actions">
                <button className="btn btn-primary btn-lg" onClick={() => { clearCart(); navigate('/') }}>Back to Home</button>
                <Link to="/contact" className="btn btn-secondary btn-lg" onClick={() => clearCart()}>Contact Us</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Checkout</span>
          <h1>{step === 'cart' ? 'Your' : step === 'details' ? 'Your' : 'Complete'} <span className="gradient-text">{step === 'payment' ? 'payment' : 'cart'}</span></h1>
          <p>Review your items, enter your details, and choose how you'd like to pay.</p>
        </div>
      </section>

      <section className="cart-section">
        <div className="container">
          {/* Step indicator */}
          <div className="cart-steps">
            <div className={`cart-step ${step === 'cart' ? 'active' : 'done'}`}>
              <span className="cs-num">1</span>
              <span className="cs-label">Cart</span>
            </div>
            <div className={`cart-step ${step === 'details' ? 'active' : step === 'payment' ? 'done' : ''}`}>
              <span className="cs-num">2</span>
              <span className="cs-label">Details</span>
            </div>
            <div className={`cart-step ${step === 'payment' ? 'active' : ''}`}>
              <span className="cs-num">3</span>
              <span className="cs-label">Payment</span>
            </div>
          </div>

          <div className="cart-layout">
            <div className="cart-main">
              {step === 'cart' && (
                <>
                  <h2 className="cart-h2">Items ({itemCount})</h2>
                  <ul className="cart-items">
                    {items.map(item => (
                      <li className="cart-item" key={item.lineId}>
                        <div className="cart-item-icon">{item.icon || '📦'}</div>
                        <div className="cart-item-info">
                          <div className="cart-item-top">
                            <strong>{item.title}</strong>
                            <span className={`cart-type-badge type-${item.type}`}>
                              {item.type === 'service' ? 'Service' : item.type === 'hosting' ? 'Hosting' : 'Domain'}
                            </span>
                          </div>
                          {item.subtitle && <p>{item.subtitle}</p>}
                          <div className="cart-item-meta">
                            {item.billing && item.billing !== 'one-time' && (
                              <span className="cart-bill">
                                {item.billing === 'yearly' ? 'Yearly' : item.billing === 'monthly' ? 'Monthly' : item.billing}
                              </span>
                            )}
                            {item.domainName && (
                              <span>for <strong>{item.domainName}</strong></span>
                            )}
                          </div>
                        </div>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQty(item.lineId, item.qty - 1)} aria-label="Decrease quantity">
                            <FiMinus />
                          </button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.lineId, item.qty + 1)} aria-label="Increase quantity">
                            <FiPlus />
                          </button>
                        </div>
                        <div className="cart-item-price">
                          <strong>{formatMWK(item.price * item.qty)}</strong>
                          {item.qty > 1 && <span>{formatMWK(item.price)} each</span>}
                        </div>
                        <button
                          className="cart-item-remove"
                          onClick={() => removeItem(item.lineId)}
                          aria-label={`Remove ${item.title}`}
                          title="Remove"
                        >
                          <FiTrash2 />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="cart-actions-row">
                    <button className="btn btn-ghost" onClick={clearCart}>
                      <FiTrash2 /> Clear cart
                    </button>
                    <Link to="/services" className="btn btn-ghost">
                      <FiPlus /> Add more services
                    </Link>
                  </div>
                </>
              )}

              {step === 'details' && (
                <form onSubmit={goToPayment} className="cart-form">
                  <h2 className="cart-h2">Your details</h2>
                  <p className="cart-sub">We'll use these to confirm your order and reach out.</p>
                  <div className="form-row">
                    <div>
                      <label htmlFor="name">Full name *</label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={updateForm}
                        placeholder="John Banda"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email">Email *</label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={updateForm}
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="phone">Phone *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateForm}
                      placeholder="+265 9XX XXX XXX"
                      required
                    />
                  </div>
                  <div className="cart-form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setStep('cart')}>
                      ← Back to cart
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Continue to payment <FiArrowRight />
                    </button>
                  </div>
                </form>
              )}

              {step === 'payment' && (
                <>
                  <h2 className="cart-h2">Choose a payment method</h2>
                  <p className="cart-sub">Select how you'd like to pay. All three options are mobile-first and built for Malawi.</p>

                  <div className="pay-methods">
                    {paymentMethods.map(m => (
                      <label
                        key={m.id}
                        className={`pay-method ${selectedMethod === m.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="pay"
                          value={m.id}
                          checked={selectedMethod === m.id}
                          onChange={() => setSelectedMethod(m.id)}
                        />
                        <div className="pay-method-icon">
                          <PaymentIcon id={m.id} />
                        </div>
                        <div className="pay-method-info">
                          <strong>{m.name}</strong>
                          <span>{m.desc}</span>
                        </div>
                        <div className="pay-method-check">
                          {selectedMethod === m.id && <FiCheck />}
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="pay-instructions">
                    <div className="pay-instructions-head">
                      <h3>
                        <FiSmartphone /> Pay with {method.name}
                      </h3>
                      <span className="pay-instructions-ref">Order ref: <strong>{orderRef}</strong></span>
                    </div>

                    <div className="pay-detail-row">
                      <div>
                        <label>{method.details.label}</label>
                        <div className="pay-account">
                          <code>{method.details.account}</code>
                          <button
                            type="button"
                            className="pay-copy"
                            onClick={copyAccount}
                            aria-label="Copy account"
                            title="Copy"
                          >
                            {copied ? <FiCheck /> : <FiCopy />}
                          </button>
                        </div>
                        <p className="pay-account-name">Account name: <strong>{method.details.name}</strong></p>
                      </div>
                      <div className="pay-amount">
                        <label>Amount to send</label>
                        <div className="pay-amount-amount gradient-text">{formatMWK(total)}</div>
                      </div>
                    </div>

                    <p className="pay-instructions-text">{method.details.instructions}</p>

                    <form onSubmit={placeOrder} className="pay-confirm">
                      <label htmlFor="txId">Transaction / reference ID *</label>
                      <input
                        id="txId"
                        type="text"
                        value={txId}
                        onChange={(e) => setTxId(e.target.value)}
                        placeholder="e.g. MPB1234567 or bank slip number"
                        required
                      />
                      <div className="pay-confirm-row">
                        <button type="button" className="btn btn-secondary" onClick={() => setStep('details')}>
                          ← Back
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg">
                          <FiCheck /> Confirm payment
                        </button>
                      </div>
                      <p className="pay-secure"><FiShield /> Your order is recorded. We'll verify the payment and confirm via email/WhatsApp.</p>
                    </form>
                  </div>
                </>
              )}
            </div>

            {/* Order summary sidebar */}
            <aside className="cart-summary">
              <div className="summary-card">
                <h3>Order summary</h3>
                <ul className="summary-list">
                  {items.map(i => (
                    <li key={i.lineId}>
                      <span className="sl-title">
                        {i.icon} {i.title}
                        {i.qty > 1 && <em> ×{i.qty}</em>}
                      </span>
                      <span className="sl-price">{formatMWK(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="summary-divider" />
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>{formatMWK(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="summary-row discount">
                    <span><FiTag /> Bundle discount</span>
                    <span>− {formatMWK(discount)}</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span className="gradient-text">{formatMWK(total)}</span>
                </div>

                {step === 'cart' && (
                  <button onClick={goToDetails} className="btn btn-primary btn-block btn-lg">
                    Proceed to checkout <FiArrowRight />
                  </button>
                )}
                {step === 'details' && (
                  <button onClick={goToPayment} className="btn btn-primary btn-block btn-lg" form="cart-details-form">
                    Continue <FiArrowRight />
                  </button>
                )}
                {step === 'payment' && (
                  <div className="summary-pay-info">
                    <FiShield />
                    <span>Secure checkout — your payment is verified manually within minutes.</span>
                  </div>
                )}

                <div className="summary-trust">
                  <div><FiCheck /> 30-day money-back</div>
                  <div><FiCheck /> Secure verification</div>
                  <div><FiCheck /> Local Malawi support</div>
                </div>
              </div>

              <div className="summary-help">
                <strong>Need help?</strong>
                <p>Call or WhatsApp us at <a href="https://wa.me/265995479580" target="_blank" rel="noopener noreferrer">+265 995 479 580</a>.</p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
