import { BINARIES_PATH, SOURCES_PATH } from "../binary/binary.ts";
import { cmd } from "../command.ts";
import { drop } from "../drop.ts";
import { dropError } from "../drop.ts";

export class Services {
  list = new Map();

  constructor() {
    const units = getUnits();

    for (const unit of units.list) {
      this.list.set(unit.unit, unit);
    }
  }

  get size() {
    return this.list.size;
  }

  async install(gitUrl: string) {
    const { readFile, lstat, writeFile } = Deno;
    const [_, name] = gitUrl.split("/");
    const path = `${SOURCES_PATH}/${name}`;
    const rawConfig = await readFile(path + "/deno.json");
    const config = JSON.parse(new TextDecoder().decode(rawConfig));

    if (config.tasks.compile) {
      try {
        await lstat(BINARIES_PATH + "/" + name);
      } catch (error) {
        drop("Compile binary");
        await cmd("deno", "task", "compile");
        await cmd("mv", name, BINARIES_PATH + "/" + name);
      }

      const serviceFilePath = "/etc/systemd/system/" + name + ".service";

      try {
        await lstat(serviceFilePath);
        drop("Service already installed");
      } catch (error) {
        const tempService = `./${name}.service`;
        const systemConfig: SystemConfig = {
          execStart: `${BINARIES_PATH}/${name}`,
        };

        await writeFile(
          tempService,
          new TextEncoder().encode(configTemplate(systemConfig))
        );

        await cmd("sudo", "mv", tempService, serviceFilePath);

        drop('Service installed as "' + serviceFilePath + '"', "green");
      }
    } else {
      dropError(name + " cannot be serviced");
    }
  }

  async enable(unit: string) {
    const { success } = await cmd("systemctl", "enable", unit);
    return success;
  }

  async disable(unit: string) {
    const { success } = await cmd("systemctl", "disable", unit);
    return success;
  }

  async start(unit: string) {
    const { success } = await cmd("systemctl", "start", unit);
    return success;
  }

  async stop(unit: string) {
    const { success } = await cmd("systemctl", "stop", unit);
    return success;
  }

  async reload(unit: string) {
    const { success } = await cmd("systemctl", "reload", unit);
    return success;
  }

  async status(unit: string) {
    const { output, error } = await cmd("systemctl", "status", unit);
    console.log(output || error);

    if (error === `Unit ${unit} could not be found.`) {
      return undefined;
    }

    return false;
  }
}

export function parseSystemCtlUnit(line: string) {
  return line.trim().replace(/(\ )+/g, " ");
}

export function getUnits() {
  const listCmd = new Deno.Command("systemctl", {
    args: ["list-units", "-t", "service", "--no-pager"],
  });

  const { code, stdout } = listCmd.outputSync();
  const output = new TextDecoder().decode(stdout);
  const [header, ...rest] = output.split("\n");
  const [unitsList, legend, caption] = rest.join("\n").split("\n\n");
  const list = [];

  const headerProps = parseSystemCtlUnit(header).split(" ");

  for (const unitLine of unitsList.split("\n")) {
    const unitProps = parseSystemCtlUnit(unitLine).split(" ");
    const unit: { [prop: (typeof headerProps)[number]]: unknown } = {};

    for (const prop of headerProps) {
      unit[prop] = unitProps.shift();
    }

    list.push(unit);
  }

  return {
    list,
    code,
  };
}

export interface SystemConfig {
  workingDirectory?: string;
  // restartSec?: string;
  // restart?: string;
  description?: string;
  execStart: string;
  group?: string;
  user?: string;
}

export function configTemplate({
  workingDirectory,
  description,
  execStart,
  group,
  user,
}: SystemConfig) {
  let configUnit = `[Unit]`;

  configUnit += `\nAfter=network.target`;

  let configService = `[Service]`;

  configService += `\nType=simple`;

  if (description) {
    configUnit += `\nDescription=${description}`;
  }

  if (user) {
    configService += `\nUser=${user}`;
  }

  if (group) {
    configService += `\nGroup=${group}`;
  }

  if (execStart) {
    configService += `\nExecStart=${execStart}`;
  }

  if (workingDirectory) {
    configService += `\nWorkingDirectory=${workingDirectory}`;
  }

  // Restart=on-failure
  // RestartSec=5s

  return `${configUnit !== "[Unit]" ? configUnit + "\n" : ""}${configService}
[Install]
WantedBy=multi-user.target`;
}
