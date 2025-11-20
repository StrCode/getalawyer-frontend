import { Button } from "@/components/ui/button";

interface AuthButtonProps extends React.ComponentProps<typeof Button> {
	children: React.ReactNode;
	isLoading?: boolean;
}

export function AuthButton({
	children,
	isLoading = false,
	className,
	...props
}: AuthButtonProps) {
	return (
		<Button
			size="lg"
			variant="default"
			type="submit"
			disabled={isLoading}
			className={`w-full text-white bg-[#19603E] hover:bg-[#19603E]/80 ${className}`}
			{...props}
		>
			{children}
		</Button>
	);
}
