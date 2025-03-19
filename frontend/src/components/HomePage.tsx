import Link from 'next/link';

export default function HomePage() {
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
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
              <div className="text-indigo-400 mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">AI-Driven Agent</h3>
              <p className="text-gray-300">Your personal AI agent negotiates terms, verifies skills, and manages the entire bounty process on your behalf.</p>
            </div>
            
            {/* Trustless Escrow */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
              <div className="text-indigo-400 mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Trustless Escrow</h3>
              <p className="text-gray-300">Funds are secured in a SAFE-based escrow system, ensuring fair payment only upon successful completion.</p>
            </div>
            
            {/* Skill Verification */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
              <div className="text-indigo-400 mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Skill Verification</h3>
              <p className="text-gray-300">Our AI evaluates skills and expertise to ensure the right match between bounty hunters and opportunities.</p>
            </div>
            
            {/* Automated Rewards */}
            <div className="bg-gray-800/50 p-8 rounded-xl border border-gray-700 backdrop-blur-sm">
              <div className="text-indigo-400 mb-4">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Automated Rewards</h3>
              <p className="text-gray-300">Immediate payment distribution upon successful completion, with no manual intervention required.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
