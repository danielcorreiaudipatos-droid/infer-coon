export default function Premium() {
  return (
    <div className="py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Go Premium</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div className="card">
          <h3 className="text-2xl font-bold mb-4">Premium</h3>
          <p className="text-3xl font-bold text-primary mb-6">R$ 29.90/mês</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Premium content</li>
            <li>✓ Trading signals</li>
            <li>✓ Private community</li>
            <li>✓ No ads</li>
          </ul>
          <button className="btn-primary w-full">Subscribe</button>
        </div>
        <div className="card border-2 border-primary">
          <h3 className="text-2xl font-bold mb-4">VIP Pro</h3>
          <p className="text-3xl font-bold text-primary mb-6">R$ 99.90/mês</p>
          <ul className="space-y-2 mb-6">
            <li>✓ Everything in Premium</li>
            <li>✓ API access</li>
            <li>✓ Custom reports</li>
            <li>✓ 24/7 support</li>
          </ul>
          <button className="btn-primary w-full">Subscribe</button>
        </div>
      </div>
    </div>
  )
}
