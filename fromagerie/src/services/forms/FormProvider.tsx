// @ts-nocheck
import React, {
    useState,
    useRef,
    useCallback,
} from 'react';
import { useForm as useReactHookForm, FormProvider as ReactHookFormProvider } from 'react-hook-form';
import { WvcFormContext, type WvcFormContextType } from "./WvcFormContext";



/** -------- Types -------- */
export interface FormData {
    [fieldName: string]: string | number | boolean | File | undefined;
}

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: 'email' | 'phone' | 'url' | string; // regex pattern or predefined type
    custom?: (value: any) => string | null; // custom validation function
}

export interface ValidationRules {
    [fieldName: string]: ValidationRule;
}

/** -------- Form Schema Types (for registered forms) -------- */
export interface FormFieldValidation {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
}

export interface FormFieldSchema {
    field_key: string;
    label: string;
    field_type: 'text' | 'email' | 'textarea' | 'phone' | 'number' | 'url' | 'date' | 'select' | 'checkbox' | 'radio';
    placeholder?: string;
    required?: boolean;
    options?: string[];  // For select/radio fields
    validation?: FormFieldValidation;
}

export interface FormSchema {
    form_key: string;
    form_label: string;
    fields: FormFieldSchema[];
    // Note: submit_button_text, success_message, error_message are NOT stored in schema
    // These are generated contextually by AI during page generation and passed as props
}

// Declare global window type for form schemas
declare global {
    interface Window {
        __WVC_FORMS__?: { [formKey: string]: FormSchema };
    }
}

type FormProviderProps = {
    children: React.ReactNode;
    formId: string;
    sectionName: string;

    // Schema-based configuration (optional)
    formKey?: string;           // Load form schema from window.__WVC_FORMS__[formKey]
    formSchema?: FormSchema;    // Direct schema injection

    // Manual configuration (used if no schema, or to override schema)
    validationRules?: ValidationRules;
    successMessage?: string;
    errorMessage?: string;
    defaultValues?: any;
    formVersion?: string;
} & React.HTMLAttributes<HTMLDivElement>;

// Helper function to convert schema field validation to ValidationRules format
const schemaToValidationRules = (schema: FormSchema): ValidationRules => {
    const rules: ValidationRules = {};

    for (const field of schema.fields) {
        const fieldRule: ValidationRule = {};

        if (field.required) {
            fieldRule.required = true;
        }

        // Map field_type to pattern
        if (field.field_type === 'email') {
            fieldRule.pattern = 'email';
        } else if (field.field_type === 'phone') {
            fieldRule.pattern = 'phone';
        } else if (field.field_type === 'url') {
            fieldRule.pattern = 'url';
        }

        // Apply explicit validation rules from schema
        if (field.validation) {
            if (field.validation.minLength) fieldRule.minLength = field.validation.minLength;
            if (field.validation.maxLength) fieldRule.maxLength = field.validation.maxLength;
            if (field.validation.min) fieldRule.min = field.validation.min;
            if (field.validation.max) fieldRule.max = field.validation.max;
            if (field.validation.pattern) fieldRule.pattern = field.validation.pattern;
        }

        if (Object.keys(fieldRule).length > 0) {
            rules[field.field_key] = fieldRule;
        }
    }

    return rules;
};

// Helper function to derive default values from schema
const schemaToDefaultValues = (schema: FormSchema): { [key: string]: any } => {
    const defaults: { [key: string]: any } = {};

    for (const field of schema.fields) {
        // Set appropriate default based on field type
        switch (field.field_type) {
            case 'checkbox':
                defaults[field.field_key] = false;
                break;
            case 'number':
                defaults[field.field_key] = '';
                break;
            default:
                defaults[field.field_key] = '';
        }
    }

    return defaults;
};

// FormProvider component that wraps react-hook-form
const FormProvider: React.FC<FormProviderProps> = ({
    children,
    formId,
    sectionName,
    formKey,
    formSchema: propFormSchema,
    validationRules: propValidationRules = {},
    successMessage: propSuccessMessage,
    errorMessage: propErrorMessage,
    defaultValues: propDefaultValues = {},
    formVersion = "1.0.0",
    ...divProps
}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const submissionAttemptRef = useRef(0);

    // Resolve form schema from formKey or direct prop
    const resolvedSchema = React.useMemo<FormSchema | undefined>(() => {
        // Direct schema takes precedence
        if (propFormSchema) return propFormSchema;

        // Try to load from window.__WVC_FORMS__
        if (formKey && typeof window !== 'undefined' && window.__WVC_FORMS__) {
            return window.__WVC_FORMS__[formKey];
        }

        return undefined;
    }, [formKey, propFormSchema]);

    // Derive configuration from schema with prop overrides
    const {
        validationRules,
        successMessage,
        errorMessage,
        defaultValues
    } = React.useMemo(() => {
        // Start with schema-derived values if available
        const schemaRules = resolvedSchema ? schemaToValidationRules(resolvedSchema) : {};
        const schemaDefaults = resolvedSchema ? schemaToDefaultValues(resolvedSchema) : {};

        return {
            // Merge: prop validation rules override schema rules
            validationRules: { ...schemaRules, ...propValidationRules },
            // Props or defaults (no schema fallback for UI messages - they're generated by AI per page)
            successMessage: propSuccessMessage ?? "Form submitted successfully!",
            errorMessage: propErrorMessage ?? "Failed to submit form. Please try again.",
            // Merge: prop default values override schema defaults
            defaultValues: { ...schemaDefaults, ...propDefaultValues }
        };
    }, [resolvedSchema, propValidationRules, propSuccessMessage, propErrorMessage, propDefaultValues]);

    // Initialize react-hook-form with resolved default values
    const methods = useReactHookForm({
        defaultValues: defaultValues || {},
        mode: 'onBlur', // Validate on blur for better UX
    });

    const { handleSubmit: rhfHandleSubmit, reset, formState } = methods;

    // Submit form
    const handleSubmit = useCallback(async (data: any) => {
        if (isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError(null);
        submissionAttemptRef.current += 1;

        try {
            // Prepare submission data
            const submissionData = {
                // Required fields
                sectionName,
                formId,
                formKey: formKey || resolvedSchema?.form_key,  // Include registered form key if available
                formData: data,

                // Auto-generated fields
                timestamp: Date.now(),
                sessionId: wvcClient.getSessionId?.() || 'unknown',
                //pageUrl: typeof window !== "undefined" ? window.location.href : "#",
                pageUrl: window.location.href,
                userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
                // Optional metadata
                validationErrors: formState.errors || null,
                submissionAttempt: submissionAttemptRef.current,
                formVersion,

                // Additional metadata can be added here
                validationRules,
            };

            // Call wvcClient.formSubmission
            await wvcClient.formSubmission(submissionData);

            // Success
            setIsSubmitted(true);
            setSubmitError(null);

        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        sectionName,
        formId,
        formState.errors,
        errorMessage,
        formKey,
        resolvedSchema?.form_key,
        formVersion,
        validationRules,
    ]);

    // Reset form
    const resetForm = useCallback(() => {
        reset();
        setIsSubmitted(false);
        setSubmitError(null);
        submissionAttemptRef.current = 0;
    }, [reset]);

    const wvcFormValue: WvcFormContextType = {
        formId,
        sectionName,
        isSubmitting,
        isSubmitted,
        submitError,
        successMessage,
        formSchema: resolvedSchema,
        handleSubmit: rhfHandleSubmit(handleSubmit),
        resetForm,
        // Expose react-hook-form methods
        control: methods.control,
        formState: methods.formState,
        register: methods.register,
        setValue: methods.setValue,
        getValues: methods.getValues,
        watch: methods.watch,
    };

    return (
        <ReactHookFormProvider {...methods}>
            <WvcFormContext.Provider value={wvcFormValue}>
                <div
                    {...divProps}
                    data-wvc-dynamic="FormProvider"
                    data-wvc-formId={formId}
                    data-wvc-formKey={formKey || resolvedSchema?.form_key || undefined}
                >
                    {children}
                </div>
            </WvcFormContext.Provider>
        </ReactHookFormProvider>
    );
}; export { FormProvider };
