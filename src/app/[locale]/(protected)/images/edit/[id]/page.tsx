"use client";

import { useParams } from "next/navigation";
import React from "react";

export default function EditImage() {
  const { id: imageId } = useParams<{ id: string }>();

  return <div>Edit Image with id: {imageId}</div>;
}
