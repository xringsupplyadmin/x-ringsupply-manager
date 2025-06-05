import { useEffect, useState } from "react";

/**
 * Trigger a state change ONLY the first time a stateful variable changes
 * @param stateful A stateful variable to watch
 * @returns Another stateful variable
 */
export function useSingleShot(stateful: unknown) {
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    setChanged(true);
  }, [stateful]);

  return changed;
}
