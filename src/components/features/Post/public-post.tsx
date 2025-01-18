import CustomAvatar from "~/components/atom/custom-avatar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { GetPostType } from "~/server/api/root";
import { PostableEntityType } from "~/types/post";

import { EmbeddedGrowCard } from "../Grows/embedded-grow-card";
import { EmbeddedPlantCard } from "../Plants/embedded-plant-card";

interface PublicPostProps {
  post: GetPostType;
}

export default function PublicPost({ post }: PublicPostProps) {
  // const t = useTranslations("PublicPost");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CustomAvatar
            size={40}
            src={post.owner.image ?? undefined}
            alt={post.owner.username ?? "User avatar"}
            fallback={post.owner.name?.[0] || "?"}
          />
          <div>
            <CardTitle>{post.owner.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
        {post.entityType === PostableEntityType.GROW && (
          <EmbeddedGrowCard grow={post.grow} />
        )}
        {post.entityType === PostableEntityType.PLANT && (
          <EmbeddedPlantCard plant={post.plant} />
        )}
        {post.entityType === "image" && (
          <p>Connected to Photo: {post.photo?.originalFilename}</p>
        )}
      </CardContent>
    </Card>
  );
}
