import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PayoutGraphProps {
  userPrediction?: number;
  className?: string;
}

const PayoutGraph: React.FC<PayoutGraphProps> = ({ userPrediction, className = '' }) => {
  // Mock payout curve data - symmetric Gaussian-like curve
  const generatePayoutData = () => {
    const data = [];
    const center = userPrediction || 50;
    const range = 100;
    
    for (let i = center - range; i <= center + range; i += 5) {
      const distance = Math.abs(i - center);
      const payout = Math.max(0, 2 * Math.exp(-Math.pow(distance / 30, 2)));
      data.push({
        value: i,
        payout: payout,
      });
    }
    return data;
  };

  const data = generatePayoutData();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Curve</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="value" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              label={{ value: 'Payout Multiplier', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(2)}x`, 'Payout']}
              labelFormatter={(label) => `Value: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="payout" 
              stroke="#84cc16" 
              strokeWidth={2}
              dot={false}
            />
            {userPrediction && (
              <Line
                type="monotone"
                dataKey={() => userPrediction}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-600 mt-2">
        Your payout depends on how close your prediction is to the final result.
      </p>
    </div>
  );
};

export default PayoutGraph;