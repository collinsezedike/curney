import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
	endTime: Date;
	className?: string;
}

const Timer: React.FC<TimerProps> = ({ endTime, className = "" }) => {
	const [timeLeft, setTimeLeft] = useState<string>("");

	useEffect(() => {
		const updateTimer = () => {
			const now = new Date().getTime();
			const end = new Date(endTime).getTime();
			const difference = end - now;

			if (difference > 0) {
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor(
					(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
				);
				const minutes = Math.floor(
					(difference % (1000 * 60 * 60)) / (1000 * 60)
				);
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);

				if (days > 0) {
					setTimeLeft(`${days}d ${hours}h ${minutes}m`);
				} else if (hours > 0) {
					setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
				} else {
					setTimeLeft(`${minutes}m ${seconds}s`);
				}
			} else {
				setTimeLeft("Ended");
			}
		};

		updateTimer();
		const interval = setInterval(updateTimer, 1000);

		return () => clearInterval(interval);
	}, [endTime]);

	return <span className="font-medium text-gray-900">{timeLeft}</span>;
};

export default Timer;
