"use client";

import { useState } from "react";

import { MembershipOverviewSection } from "@/components/home";
import {
  ApplicationFormSection,
  CategoriesSection,
  GeneralPrivilegesSection,
  MembershipFooter,
  MembershipHeaderSection,
  MembershipNavbar,
  PurposeSection,
  ValiditySection,
} from "@/components/membership";
import type { MembershipFormState } from "@/components/membership/types";

const initialFormState: MembershipFormState = {
  name: "",
  profession: "",
  organization: "",
  prcLicense: "",
  email: "",
  contactNumber: "",
  membershipType: "",
  docs: [],
  agreed: false,
};

export function MembershipPageClient() {
  const [form, setForm] = useState<MembershipFormState>(initialFormState);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const toggleDoc = (doc: string) => {
    setForm((prev) => ({
      ...prev,
      docs: prev.docs.includes(doc)
        ? prev.docs.filter((item) => item !== doc)
        : [...prev.docs, doc],
    }));
  };

  const handleAgreementChange = (agreed: boolean) => {
    setForm((prev) => ({ ...prev, agreed }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    alert(
      "Thank you for your application! We will review your submission and get back to you soon.",
    );
  };

  return (
    <>
      <MembershipNavbar />

      <main className="flex-1">
        <MembershipHeaderSection />
        <MembershipOverviewSection />
        <PurposeSection />
        <CategoriesSection />
        <GeneralPrivilegesSection />
        <ValiditySection />
        <ApplicationFormSection
          form={form}
          onInputChange={handleInput}
          onToggleDoc={toggleDoc}
          onAgreementChange={handleAgreementChange}
          onSubmit={handleSubmit}
        />
      </main>

      <MembershipFooter />
    </>
  );
}
