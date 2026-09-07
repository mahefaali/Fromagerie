import { createContext, useContext, type BaseSyntheticEvent } from "react";

import type { FormSchema } from "./FormProvider";

export interface WvcFormContextType {
    formId: string;
    sectionName: string;
    isSubmitting: boolean;
    isSubmitted: boolean;
    submitError: string | null;
    successMessage: string;
    formSchema?: FormSchema;
    handleSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
    resetForm: () => void;
    control: any;
    formState: any;
    register: any;
    setValue: any;
    getValues: any;
    watch: any;
}

export const WvcFormContext = createContext<WvcFormContextType | null>(null);

export function useWvcForm(): WvcFormContextType {
    const context = useContext(WvcFormContext);
    if (!context) {
        throw new Error("useWvcForm must be used within a FormProvider");
    }
    return context;
}
