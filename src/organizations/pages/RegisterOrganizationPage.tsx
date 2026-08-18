import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { RegisterOrganizationForm } from "@/organizations/components/RegisterOrganizationForm";
import { RegistrationSuccess } from "@/organizations/components/RegistrationSuccess";
import type { RegisterOrganizationResult } from "@/organizations/api/organizationsApi";

export function RegisterOrganizationPage() {
  const [result, setResult] = useState<RegisterOrganizationResult | null>(null);

  return (
    <AuthLayout
      eyebrow="Register"
      title="Get your organization approved, then start hiring."
      description="Submit your company details and tax registration document. An administrator reviews every request before access is granted."
      contentClassName="max-w-md"
      footer={
        result ? undefined : (
          <p className="text-center text-sm text-muted-foreground">
            Already approved?{" "}
            <Link
              to="/login"
              replace
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        )
      }
    >
      {result ? (
        <RegistrationSuccess result={result} />
      ) : (
        <RegisterOrganizationForm onSuccess={setResult} />
      )}
    </AuthLayout>
  );
}
