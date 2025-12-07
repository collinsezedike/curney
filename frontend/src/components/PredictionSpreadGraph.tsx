import React from "react";
import {
	ScatterChart,
	Scatter,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";

interface PredictionSpreadGraphProps {
	predictions: number[];
	userPrediction?: number;
	resolvedValue?: number | null;
	className?: string;
}

const mapPredictionsToFrequency = (predictions: number[]) => {
	const frequencyMap = predictions.reduce((acc, value) => {
		const roundedValue = parseFloat(value.toFixed(2));
		acc[roundedValue] = (acc[roundedValue] || 0) + 1;
		return acc;
	}, {} as Record<number, number>);

	return Object.keys(frequencyMap).map((value) => ({
		value: parseFloat(value),
		count: frequencyMap[parseFloat(value)],
	}));
};

const PredictionSpreadGraph: React.FC<PredictionSpreadGraphProps> = ({
	predictions,
	className = "",
}) => {
	const points = mapPredictionsToFrequency(predictions);

	return (
		<div
			className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
		>
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Prediction Spread
			</h3>

			<div className="h-64">
				<ResponsiveContainer width="100%" height="100%">
					<ScatterChart
						margin={{ top: 20, right: 20, bottom: 40, left: 20 }}
					>
						<CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />

						<XAxis
							type="number"
							dataKey="value"
							name="Prediction"
							stroke="#666"
							fontSize={12}
							label={{
								value: "Prediction Value",
								dy: 25,
							}}
						/>

						<YAxis
							type="number"
							dataKey="count"
							allowDecimals={false}
							label={{
								value: "Number of Predictions",
								angle: -90,
								dx: -15,
							}}
						/>

						<Tooltip
							cursor={{ strokeDasharray: "3 3" }}
							formatter={(value, name) => [`${name}: ${value}`]}
						/>

						<Scatter
							name="Predictions"
							data={points}
							fill="#84cc16"
							opacity={0.8}
						/>
					</ScatterChart>
				</ResponsiveContainer>
			</div>

			<p className="text-center text-sm text-gray-600 mt-2">
				Visualizing the distribution of predictions made in this market.
			</p>
		</div>
	);
};

export default PredictionSpreadGraph;
