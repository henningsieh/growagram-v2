// src/app/[locale]/(protected)/photos/upload/page.tsx:
import { getTranslations } from "next-intl/server";
import { modulePaths } from "~/assets/constants";
import { BreadcrumbSetter } from "~/components/Layouts/Breadcrumbs/breadcrumb-setter";
import FormContent from "~/components/Layouts/form-content";
import PageHeader from "~/components/Layouts/page-header";
import PhotoUpload from "~/components/features/Photos/image-upload";
import { auth } from "~/lib/auth";
import { createBreadcrumbs } from "~/lib/breadcrumbs/breadcrumbs";

export default async function ImageUploadPage() {
  const session = await auth();
  const t = await getTranslations("Photos");

  // Create breadcrumbs for this page using sidebar translation keys
  const breadcrumbs = createBreadcrumbs([
    {
      translationKey: "Photos.upload-photos-title",
      path: modulePaths.PHOTOS.path,
    },
    {
      translationKey: "Photos.upload-photos-title",
      path: modulePaths.PHOTOUPLOAD.path,
    },
  ]);

  return (
    <>
      <BreadcrumbSetter items={breadcrumbs} />
      <PageHeader
        title={t("upload-photos-title")}
        subtitle={t("upload-photos-subtitle")}
      >
        {session && session.user && (
          <FormContent>
            <PhotoUpload />
          </FormContent>
        )}
      </PageHeader>
    </>
  );
}
