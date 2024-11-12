// src/app/[locale]/(protected)/images/upload/page.tsx:
import PageHeader from "~/components/Layouts/page-header";
import ImageUpload from "~/components/features/Images/image-upload";
import { auth } from "~/lib/auth";

export default async function ImageUploadPage() {
  const session = await auth();
  return (
    <PageHeader title="Image Upload" subtitle="Upload new images">
      {session && session.user && <ImageUpload user={session.user} />}
    </PageHeader>
  );
}
