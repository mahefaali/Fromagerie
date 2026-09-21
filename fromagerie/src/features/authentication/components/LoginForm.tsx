import { useRef } from "react";
import { Loader } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "../../../components/ui/button";
import { Form } from "../../../components/ui/form";
import { HttpError } from "../../../services/http/apiClient";
import { useAuth } from "../hooks/useAuth";
import { DemoAccountSelector } from "./login/DemoAccountSelector";
import { LoginFields } from "./login/LoginFields";
import type { DemoAccount, LoginFormValues } from "./login/loginForm.config";

export function InnerCircleForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const methods = useForm<LoginFormValues>({
    defaultValues: { accessMode: "", username: "", password: "" },
    mode: "onBlur",
  });
  const {
    handleSubmit,
    setError,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = methods;
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const submitLogin = async (values: LoginFormValues): Promise<void> => {
    try {
      await login({ username: values.username.trim(), password: values.password });
      navigate("/home", { replace: true });
    } catch (error: unknown) {
      setValue("password", "");
      setError("root", {
        message: error instanceof HttpError && (error.status === 400 || error.status === 401)
          ? error.message
          : "Connexion au serveur impossible. Veuillez réessayer.",
      });
    }
  };

  const selectDemoAccount = (account: DemoAccount): void => {
    setValue("accessMode", account.accessMode, { shouldDirty: true, shouldValidate: true });
    setValue("username", account.username, { shouldDirty: true, shouldValidate: true });
    setValue("password", "");
    clearErrors("root");
    window.requestAnimationFrame(() => {
      submitButtonRef.current?.scrollIntoView?.({ behavior: "smooth", block: "center" });
    });
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(submitLogin)} className="space-y-10" noValidate>
        <DemoAccountSelector onSelect={selectDemoAccount} />
        <LoginFields />

        {errors.root?.message && (
          <div role="alert" className="border border-[#C96A4A] bg-[#C96A4A]/[0.08] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#C96A4A]">{errors.root.message}</p>
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-6 pt-4 sm:flex-row">
          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={isSubmitting}
            className="group relative h-auto w-full rounded-full border border-[#C96A4A] bg-[#C96A4A] px-10 py-6 font-mono text-xs uppercase tracking-[0.2em] text-[#F7F3EC] hover:border-[#3F4A4F] hover:bg-[#3F4A4F] sm:w-auto"
          >
            {isSubmitting ? <><Loader className="mr-3 size-4 animate-spin" />Connexion...</> : "Se connecter"}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}
