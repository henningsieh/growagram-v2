import React from "react";
import PageHeader from "~/components/Layouts/page-header";
import GrowForm from "~/components/features/Grows/grow-form";

export default function CreatePlantPage() {
  return (
    <PageHeader
      title={"Create New Grow"}
      subtitle={"Add a new grow to your collection"}
    >
      <GrowForm />
    </PageHeader>
  );
}
