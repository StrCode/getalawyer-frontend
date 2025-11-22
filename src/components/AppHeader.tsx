import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

export default function Header() {
	return (
		<div className="py-3 px-4 md:px-11 md:py-8 flex items-center justify-between">
			<div className="flex justify-center gap-2 md:justify-start">
				<Link to="/" className="flex items-center gap-2 font-medium">
					<img src="/logo.png" alt="GetaLawyer Logo" className="h-6" />
				</Link>
			</div>
			<div className="space-x-2 text-sm text-gray-600">
				Changed your mind?
				<Button
					variant="link"
					className="text-sm text-green-600"
					render={<Link to="/login" />}
				>
					Login
				</Button>
			</div>
		</div>
	);
}
