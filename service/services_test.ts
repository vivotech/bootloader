import { assertEquals, assertGreater } from "@std/assert";
import { Services, getUnits } from "./services.ts";

Deno.test(function shouldGetUnits() {
  const { code, list } = getUnits();

  assertEquals(code, 0, "Function exited with error");
  assertGreater(list.length, 0, "List of units is empty");
});

Deno.test(function shouldPopulateServicesList() {
  assertGreater(new Services().list.size, 0, "List of services is empty");
});
