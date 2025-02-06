import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">

      {/* Hero Section */}
      <section className="pt-24 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6 px-3 py-1 border border-indigo-400 rounded-full text-indigo-400 text-sm">
              ETHGlobal Hackathon Project
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text">
              Virtual Synergy Agents
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed">
              Autonomous blockchain agents that match developers with bounties,
              negotiate terms, and manage payments—all on-chain.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="/bounties"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                View Bounties
              </Link>
              <button className="border border-indigo-400 hover:bg-indigo-900/50 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Deploy Your Agent
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: VSA */}
            <div className="p-6 rounded-xl border border-indigo-900/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
              <div className="text-indigo-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Virtual Synergy Agents</h3>
              <p className="text-gray-400">Deploy your personal on-chain agent that autonomously matches you with relevant bounties based on your skills.</p>
            </div>

            {/* Feature 2: Smart Contracts */}
            <div className="p-6 rounded-xl border border-indigo-900/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
              <div className="text-indigo-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Trustless Escrow</h3>
              <p className="text-gray-400">Smart contracts automatically handle bounty funds and release payments upon verified completion.</p>
            </div>

            {/* Feature 3: Telegram */}
            <div className="p-6 rounded-xl border border-indigo-900/50 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
              <div className="text-indigo-400 mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Telegram Integration</h3>
              <p className="text-gray-400">Configure your VSA through our intuitive Telegram bot with skill verification and automated matching.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Bounty Hunting?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join the future of decentralized collaboration. Deploy your VSA today and let it find the perfect opportunities for you.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Get Started
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
