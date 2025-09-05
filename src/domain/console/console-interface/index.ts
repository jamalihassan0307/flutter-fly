import { execSync, ExecSyncOptions } from 'child_process'
import { IConsoleInterface } from './iconsole-interface'

export class ConsoleInterface implements IConsoleInterface {
  execConsoleSync(command: string, options: ExecSyncOptions | null = null): Buffer {
    console.log('Executed ', command)
    const result = execSync(command, options || undefined)
    return Buffer.isBuffer(result) ? result : Buffer.from(String(result))
  }
  execConsoleStringSync(
    command: string,
    options: ExecSyncOptions | null = null
  ): string {
    return this.execConsoleSync(command, options).toString()
  }
}
