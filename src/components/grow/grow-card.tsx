import { AnimatePresence, motion } from "framer-motion";
import { Flower2 } from "lucide-react";
import { Grow } from "~/components/features/timeline/post";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface GrowCardProps {
  grow: Grow;
  onUnassignPlant?: (plantId: string) => void;
  showUnassignButton?: boolean;
}

export function GrowCard({
  grow,
  onUnassignPlant,
  showUnassignButton = true,
}: GrowCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{grow.name}</CardTitle>
        <CardDescription>
          Plants currently assigned to this grow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <AnimatePresence>
            {grow.plants.map((plant) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/40 bg-background text-foreground shadow-sm">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Flower2 strokeWidth={0.9} className="h-12 w-12" />
                      <div>
                        <p className="text-base font-semibold">
                          {plant.strain}
                        </p>
                        <Badge variant="secondary" className="uppercase">
                          {plant.growPhase}
                        </Badge>
                      </div>
                    </div>
                    {showUnassignButton && onUnassignPlant && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onUnassignPlant(plant.id)}
                      >
                        Unassign
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {grow.plants.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No plants assigned yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
