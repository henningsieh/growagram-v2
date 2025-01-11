"use client";

// eslint-disable-next-line no-restricted-imports
import { connectToSteady } from "~/server/actions/connectToSteady";

import { Button } from "../ui/button";

export default function ConnectSteadyHQButton() {
  return (
    <form action={connectToSteady}>
      <Button size="lg" type="submit">
        Mit Steady verbinden
      </Button>
    </form>
  );
}
