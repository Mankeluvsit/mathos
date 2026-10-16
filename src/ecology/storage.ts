import {
  parseEcology,
  validateEcology,
  type EcologyDefinition,
} from "./world.ts";
const key = (version: 1 | 2) => `mathos.ecology.v${version}`;
type Port = Pick<Storage, "getItem" | "setItem">;
export function saveEcology(port: Port, d: EcologyDefinition) {
  const text = JSON.stringify(validateEcology(d));
  try {
    port.setItem(key(d.version), text);
  } catch {
    throw Error(
      "Browser storage is unavailable or full. Export your starting settings instead.",
    );
  }
}
export function loadEcology(port: Port, version: 1 | 2 = 2) {
  let text;
  try {
    text = port.getItem(key(version));
  } catch {
    throw Error(
      "Browser storage is unavailable. You can still import or export.",
    );
  }
  if (text === null) throw Error("No ecology settings saved yet.");
  const definition = parseEcology(text);
  if (definition.version !== version)
    throw Error(
      "Saved settings belong to a different model. Import the file explicitly instead.",
    );
  return definition;
}
