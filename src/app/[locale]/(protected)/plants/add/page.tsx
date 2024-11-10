import React from "react";
import PageHeader from "~/components/Layouts/page-header";
import PlantForm from "~/components/features/Plants/plant-form";

export default function CreatePlantPage() {
  return (
    <PageHeader
      title={"Create New Plant"}
      subtitle={"Add a new plant to your collection"}
    >
      <PlantForm />
    </PageHeader>
  );
}
