import {
	Autocomplete,
	AutocompleteEmpty,
	AutocompleteInput,
	AutocompleteItem,
	AutocompleteList,
	AutocompletePopup,
} from "@/components/ui/autocomplete";
import { Separator } from "@/components/ui/separator";
import { XCircleIcon, CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Fruit = {
	label: string;
	value: string;
};

let fruits: Fruit[] = [
	{ label: "Apple", value: "apple" },
	{ label: "Banana", value: "banana" },
	{ label: "Orange", value: "orange" },
	{ label: "Grape", value: "grape" },
	{ label: "Strawberry", value: "strawberry" },
	{ label: "Mango", value: "mango" },
	{ label: "Pineapple", value: "pineapple" },
	{ label: "Kiwi", value: "kiwi" },
	{ label: "Peach", value: "peach" },
	{ label: "Pear", value: "pear" },
];

export function RegisterAreas({ ...props }) {
	const [items, setItems] = useState<Fruit[] | null>(null);

	const deleteItem = (label: string) => {
		if (items) {
			setItems(items.filter((s) => s.label !== label));
		}
	};

	function getthis() {
		console.log("This is the way");
		let newFruit: Fruit = {
			label: "Apple",
			value: "apple",
		};
		setItems((prev) => (prev ? [...prev, newFruit] : [newFruit]));
	}

	return (
		<div>
			<div className="flex flex-col gap-4 rounded-2xl border px-2 py-3 w-full">
				<Autocomplete items={fruits}>
					<AutocompleteInput
						className="rounded-2xl"
						size="lg"
						aria-label="Search items"
						placeholder="Search items…"
						showClear
						showTrigger
					/>
					<AutocompletePopup>
						<AutocompleteEmpty>No items found.</AutocompleteEmpty>
						<AutocompleteList>
							{(item) => (
								<AutocompleteItem
									onClick={getthis}
									key={item.value}
									value={item}
								>
									{item.label}
								</AutocompleteItem>
							)}
						</AutocompleteList>
					</AutocompletePopup>
				</Autocomplete>
				<div
					className="relative rounded-3xl border bg-card bg-clip-padding px-1 py-1 shadow-xs before:pointer-events-none 
      before:absolute before:inset-0 before:rounded-[calc(var(--radius-xl)-1px)] before:shadow-[0_1px_--theme(--color-black/4%)]"
				>
					<div className="flex flex-wrap">
						{items
							? items.map((item) => (
									<Button
										variant={"secondary"}
										className="text-muted-foreground hover:text-green-500 text-sm/snug font-normal px-1 rounded-3xl flex items-center justify-between"
										key={item.value}
										onClick={() => deleteItem(item.label)}
									>
										<span className="flex text-sm/snug font-normal items-center gap-2 justify-around border px-2 rounded-3xl">
											{item.label}
											<XCircleIcon />
										</span>
									</Button>
								))
							: null}
					</div>
				</div>
			</div>
			<div>
				<div className="flex flex-wrap">
					{fruits.map((item) => (
						<Button
							variant={"ghost"}
							className="text-base/snug px-1 rounded-3xl flex items-center justify-between"
							key={item.value}
							onClick={() => deleteItem(item.label)}
						>
							<span className="flex text-base/snug font-normal items-center gap-2 justify-around border px-2 rounded-3xl">
								{item.label}
								<XCircleIcon />
							</span>
						</Button>
					))}
				</div>
			</div>
			<Separator className="my-6" />
			<Button className="w-full">Choose and Continue</Button>
		</div>
	);
}
