import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { SearchX } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const NotFound: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col bg-gray-50">
			<Header />

			<main className="flex-grow flex items-center justify-center px-6 py-24">
				<div className="text-center">
					{/* Icon */}
					<div className="flex justify-center mb-6">
						<SearchX className="h-20 w-20 text-lime-500" />
					</div>

					{/* Heading */}
					<h1 className="text-5xl font-bold text-gray-900 mb-4">
						Page Not Found
					</h1>

					{/* Subtext */}
					<p className="text-gray-600 text-lg max-w-xl mx-auto mb-10">
						The page you're looking for doesn't seem to exist. It
						may have been moved, deleted, or typed incorrectly.
					</p>

					{/* Actions */}
					<div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
						<a href="/#active-markets">
							<Button className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-7 text-lg cursor-pointer">
								Explore Markets
							</Button>
						</a>
						<Link to="/propose">
							<Button
								variant="soft"
								className="bg-lime-100 text-lime-900 px-8 py-7 text-lg cursor-pointer"
							>
								Propose A Market
							</Button>
						</Link>
					</div>
				</div>
			</main>

			<Footer />
		</div>
	);
};

export default NotFound;
