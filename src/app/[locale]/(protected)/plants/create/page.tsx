import React from "react";
import PageHeader from "~/components/Layouts/page-header";
import CreatePlant from "~/components/features/Plants/create-plant";

export default function CreatePlantPage() {
  return (
    <PageHeader
      title={"Add new Plant"}
      subtitle={"Add a new plant to your collection"}
    >
      <CreatePlant />
    </PageHeader>
  );
}
