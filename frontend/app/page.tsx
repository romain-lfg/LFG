import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="pt-32 pb-40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-900/30 rounded-full mb-8 border border-indigo-800/50">
              <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2 animate-pulse"></span>
              <span className="text-indigo-400 font-medium">Now in Beta</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-500 text-transparent bg-clip-text leading-tight">
              Bounties, Reinvented.
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-gray-300 leading-relaxed max-w-3xl mx-auto">
              An AI-driven platform that streamlines every step of the bounty process.
            </p>
            
            <p className="text-lg mb-16 text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Our system automates negotiation, skill verification, and reward distribution through a trustless, SAFE-based escrow—making bounty hunting as simple as chatting with an AI.
            </p>
            
            <div className="flex gap-6 justify-center">
              <Link 
                href="/bounties"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
              >
                View Bounties
              </Link>
              <Link 
                href="https://t.me/NexusAgent_Bot"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-indigo-400 hover:bg-indigo-900/50 text-white px-8 py-4 rounded-lg font-semibold transition-colors text-lg"
              >
                Chat with Your Agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* AI-Driven Agent */}
            <div className="bg-gray-800/50 p-8 rounded-xl transform hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">Empowered by AI</h3>
              <p className="text-gray-300">
                Our behind-the-scenes "Virtual Synergy Agent" continuously scans for the best bounties based on your skill profile. It can even guide you through creating new bounties, verifying developer credentials, and more.
              </p>
            </div>

            {/* SAFE Escrow */}
            <div className="bg-gray-800/50 p-8 rounded-xl transform hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">Guaranteed Payouts</h3>
              <p className="text-gray-300">
                Funds are automatically secured in a multi-signature SAFE escrow. Your reward is only released upon successful completion, removing the need for intermediaries or manual checks.
              </p>
            </div>

            {/* Skill Verification */}
            <div className="bg-gray-800/50 p-8 rounded-xl transform hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">Validate Expertise</h3>
              <p className="text-gray-300">
                Showcase your skills by letting the agent verify your tech background and even mint an optional NFT badge for an added layer of credibility—so project owners know you mean business.
              </p>
            </div>

            {/* Telegram Integration */}
            <div className="bg-gray-800/50 p-8 rounded-xl transform hover:scale-[1.02] transition-transform">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-indigo-400">Instant Conversation</h3>
              <p className="text-gray-300">
                Want to manage bounties on the go? Use our dedicated Telegram bot to handle everything—from posting tasks to finalizing escrow—right at your fingertips.
              </p>
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
            <Link
              href="https://t.me/NexusAgent_Bot"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}