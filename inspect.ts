#!/usr/bin/env -S deno run --allow-run --allow-read
import { Spinner } from "@std/cli/unstable-spinner";
import { Services } from "./service/services.ts";
import { Binary } from "./binary/binary.ts";
import { dropError } from "./drop.ts";

const services = new Services();
const binary = new Binary();

const status = await services.status("bootloader.service");

if (status === undefined) {
  const install = confirm("Do you want to install hydra bootloader?");

  if (install) {
    const gitUrl = "vivotech/bootloader";
    const spinner = new Spinner();

    spinner.start();

    spinner.message = "Inspecting hydra bootloader...";

    // const downloaded = services.download("jsr:@artery/bootloader");
    const downloaded = await binary.install(gitUrl);

    if (downloaded) {
      await services.install(gitUrl);
      spinner.stop();
    } else {
      dropError("Failed to install hydra bootloader");
      spinner.stop();
    }
  }
} else if (status) {
  console.log("Bootloader is running fine");
} else {
  const start = confirm("Do you want to start hydra bootloader?");
}
