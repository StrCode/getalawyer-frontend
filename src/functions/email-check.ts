import { createServerFn } from "@tanstack/react-start";

export const getData = createServerFn().handler(async () => {
	return { message: "Hello from server!" };
});
