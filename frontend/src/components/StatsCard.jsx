import { TrendingUp, Users, CreditCard, Activity } from 'lucide-react';

function StatsCard({ icon: Icon, title, value, change, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  const changeColor = change >= 0 ? 'text-green-600' : 'text-red-600';
  const changeIcon = change >= 0 ? '↑' : '↓';

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change !== undefined && (
              <span className={`text-xs font-medium ${changeColor}`}>
                {changeIcon} {Math.abs(change)}%
              </span>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
