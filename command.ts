export async function cmd(...args: string[]) {
  const cmd = new Deno.Command(args[0], {
    args: args.slice(1),
  });

  return await cmd.output().then((o) => ({
    output: new TextDecoder().decode(o.stdout).trim(),
    error: new TextDecoder().decode(o.stderr).trim(),
    success: o.success,
  }));
}
