// src/app/[locale]/(protected)/photos/upload/page.tsx:
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import PhotoUpload from "~/components/features/Photos/image-upload";
import { auth } from "~/lib/auth";

export default async function ImageUploadPage() {
  const session = await auth();
  return (
    <PageHeader title="Photo Upload" subtitle="Upload new photos  ">
      {session && session.user && (
        <FormContent>
          <PhotoUpload user={session.user} />
        </FormContent>
      )}
    </PageHeader>
  );
}
