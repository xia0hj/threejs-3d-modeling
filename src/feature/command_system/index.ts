export type Command = {
  key: string
  run: (...param: any[]) => void
}

const commandMap = new Map<string, Command>()
const commandRunHistory: Command[] = []

export function registerCommand(command: Command) {
  commandMap.set(command.key, command)
}

export function runCommand(key: string, ...commandArgs: any[]) {
  const command = commandMap.get(key)
  if (command != null) {
    commandRunHistory.push(command)
    command.run(commandArgs)
  }
}


console.log('init command system');

(window as any).debugContext = {
  runCommand
}
