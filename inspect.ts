#!/usr/bin/env -S deno run --allow-run
import { Spinner } from "@std/cli/unstable-spinner";
import { Services } from "./service/services.ts";

const services = new Services();

const status = services.unitStatus("hydra-bootloader.service");
console.log(
  `Bootloader is ${
    status === undefined ? "not present" : status ? "running" : "installed"
  }`
);

if (status === undefined) {
  const install = confirm("Do you want to install hydra bootloader?");

  if (install) {
    const spinner = new Spinner();

    spinner.message = "Downloading hydra bootloader...";
    spinner.start();
    services.download("jsr:@artery/bootloader");
    services.install("jsr:@artery/bootloader");
    setTimeout(() => {
      spinner.stop();
    }, 3000);
  }
} else if (status) {
  console.log("Bootloader is running fine");
} else {
  const start = confirm("Do you want to start hydra bootloader?");
}
