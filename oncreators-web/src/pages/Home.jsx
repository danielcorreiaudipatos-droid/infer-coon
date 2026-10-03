export default function Home() {
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">Welcome to OnCreators</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
        The premium creator marketplace for financial education
      </p>
      <div className="grid grid-cols-3 gap-6 mt-12">
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📺 Live Streams</h3>
          <p>Watch experts analyze markets in real-time</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📚 Courses</h3>
          <p>Learn trading from professional creators</p>
        </div>
        <div className="card">
          <h3 className="font-bold text-lg mb-2">📊 Signals</h3>
          <p>Get trading signals and market analysis</p>
        </div>
      </div>
    </div>
  )
}
