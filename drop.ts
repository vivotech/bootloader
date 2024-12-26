export function drop(msg: string, color: string = "color: white") {
  console.log(`%c${msg}`, `color: ${color}`);
}

export function dropError(msg: string) {
  console.error(`%c${msg}`, "color: red");
}
