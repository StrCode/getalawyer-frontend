import { createFormHook } from "@tanstack/react-form";

import {
  CheckboxField,
  PasswordField,
  PasswordPassField,
  SubscribeButton,
  TextField,
} from "../components/form-components";
import { fieldContext, formContext } from "./form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    CheckboxField,
    TextField,
    PasswordField,
    PasswordPassField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
});
