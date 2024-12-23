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

  unitStatus(unit: string) {
    return this.list.has(unit) ? false : undefined;
  }

  download(url: string) {
    console.log(`TODO: download from ${url}`);
  }

  install(url: string) {
    console.log("TODO: add executable");
    console.log("TODO: add service file");
    console.log("TODO: run service");
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
