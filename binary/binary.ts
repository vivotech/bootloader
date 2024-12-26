import { cmd } from "../command.ts";
import { dropError } from "../drop.ts";

const { lstat, mkdir } = Deno;

export const BINARIES_PATH = "/home/dev/.usr/bin";
export const SOURCES_PATH = "/home/dev/.usr/src";

export class Binary {
  constructor() {
    this.ensureCoreDirectories();
  }

  async ensureCoreDirectories() {
    for (const path of ["/home/dev", BINARIES_PATH, SOURCES_PATH]) {
      try {
        await lstat(path);
      } catch (error) {
        await mkdir(path);
      }
    }
  }

  async install(gitUrl: string): Promise<boolean> {
    const [_, name] = gitUrl.split("/");
    const path = `${SOURCES_PATH}/${name}`;
    try {
      const stat = await lstat(path);

      if (stat.isDirectory) {
        // TODO: check if is git repository
        return true;
      }
    } catch (error) {
      await this.clone(`git@github.com:${gitUrl}.git`, path);
      return true;
    }

    return false;
  }

  async clone(gitUrl: string, path: string): Promise<boolean> {
    const { output, error, success } = await cmd("git", "clone", gitUrl, path);

    if (error.trim()) {
      dropError(error.trim());
    }

    if (output.trim()) {
      console.log(output.trim());
    }

    return success;
  }
}
