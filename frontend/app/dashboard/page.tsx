import { IconBriefcase, IconCoin, IconCheck } from '@tabler/icons-react';

const stats = [
  { name: 'Active Bounties', value: '2', change: '+2 this week', icon: IconBriefcase },
  { name: 'Total Earnings', value: '1.8 ETH', change: '+0.5 ETH this month', icon: IconCoin },
  { name: 'Success Rate', value: '100%', change: '8 completed', icon: IconCheck },
];

const recentActivity = [
  {
    id: 1,
    type: 'match',
    title: 'VSA found a matching bounty',
    description: 'Smart Contract Security Review - 0.8 ETH',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'completed',
    title: 'Bounty completed',
    description: 'Frontend Bug Fix - 0.3 ETH',
    time: '1 day ago',
  },
  {
    id: 3,
    type: 'payout',
    title: 'Payment received',
    description: 'API Integration - 0.7 ETH',
    time: '3 days ago',
  },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20"
            >
              <dt>
                <div className="absolute rounded-lg bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-3">
                  <Icon className="h-6 w-6 text-indigo-400" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-300">
                  {stat.name}
                </p>
              </dt>
              <dd className="ml-16 flex items-baseline">
                <p className="text-2xl font-semibold text-white">{stat.value}</p>
                <p className="ml-2 flex items-baseline text-sm font-medium text-emerald-400">
                  {stat.change}
                </p>
              </dd>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl bg-gray-900/50 p-6 backdrop-blur-xl border border-white/[0.05] shadow-lg shadow-black/20">
        <h2 className="text-base font-semibold text-white mb-6">Recent Activity</h2>
        <div className="flow-root">
          <ul role="list" className="-mb-8">
            {recentActivity.map((item, itemIdx) => (
              <li key={item.id}>
                <div className="relative pb-8">
                  {itemIdx !== recentActivity.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-white/[0.05]" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 ring-8 ring-black/50">
                      <div className={`h-2.5 w-2.5 rounded-full ${
                        item.type === 'match' ? 'bg-indigo-400' :
                        item.type === 'completed' ? 'bg-emerald-400' : 'bg-purple-400'
                      }`} />
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4">
                      <div>
                        <p className="text-sm text-white">{item.title}</p>
                        <p className="text-sm text-gray-300">{item.description}</p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-300">
                        {item.time}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
