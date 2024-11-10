import { z } from "zod";

export const plantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Plant name must be at least 2 characters.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  seedlingPhaseStart: z.date().optional(),
  vegetationPhaseStart: z.date().optional(),
  floweringPhaseStart: z.date().optional(),
  harvestDate: z.date().optional(),
  curingPhaseStart: z.date().optional(),
});
