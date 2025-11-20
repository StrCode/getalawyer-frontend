import { createFormHook } from "@tanstack/react-form";

import {
	CheckboxField,
	PasswordField,
	SubscribeButton,
	TextField,
} from "../components/FormComponents";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxField,
		TextField,
		PasswordField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
