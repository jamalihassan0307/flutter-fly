import { IConsoleInterface } from './../console/console-interface/iconsole-interface'
import * as helperFunctions from './adb-path'
import * as globalStateKeys from '../../config/global-state-keys'
import * as fs from 'fs'
import * as path from 'path'

export class ADBResolver {
  osType: string
  homeDir: string
  consoleInterface: IConsoleInterface

  private readonly validADBReturn = 'List of'
  private readonly adbTestCommand = 'adb devices'
  private readonly currentStorage: any

  constructor(
    homeDir: string,
    osType: string,
    consoleInterfaceInstance: IConsoleInterface,
    currentStorage: any
  ) {
    this.homeDir = homeDir
    this.osType = osType
    this.consoleInterface = consoleInterfaceInstance
    this.currentStorage = currentStorage
  }

  private async hasAndroidInEnv(): Promise<boolean> {
    try {
      const consoleString = await this.consoleInterface.execConsoleStringSync(
        this.adbTestCommand
      )
      return consoleString.includes(this.validADBReturn)
    } catch (e) {
      console.error('[LOG] Not founded in default env', e)
      return false
    }
  }
  private returnDefaultADBPath(): string {
    const path = helperFunctions.getAndroidStudioPath({
      osType: this.osType,
      homeDir: this.homeDir
    })
    return path
  }

  private async hasPlatformToolsDefaultFolder(): Promise<boolean> {
    try {
      const adbFolder = this.returnDefaultADBPath()
      const consoleString = await this.consoleInterface.execConsoleStringSync(
        this.adbTestCommand,
        {
          cwd: adbFolder
        }
      )
      return consoleString.includes(this.validADBReturn)
    } catch (e) {
      console.error('[LOG] Not founded in common folder', e)
      return false
    }
  }

  /**
   * Auto-detect ADB path by searching common locations
   */
  public async autoDetectADBPath(): Promise<string | null> {
    const commonPaths = helperFunctions.getCommonADBPaths({
      osType: this.osType,
      homeDir: this.homeDir
    })

    for (const testPath of commonPaths) {
      try {
        // Check if path exists and contains adb executable
        const adbExecutable = this.osType === 'Windows_NT' ? 'adb.exe' : 'adb'
        const adbPath = path.join(testPath, adbExecutable)
        
        if (fs.existsSync(adbPath)) {
          console.log(`Found ADB at: ${testPath}`)
          
          // Test if ADB works
          const consoleString = await this.consoleInterface.execConsoleStringSync(
            this.adbTestCommand,
            { cwd: testPath }
          )
          
          if (consoleString.includes(this.validADBReturn)) {
            return testPath
          }
        }
      } catch (e) {
        // Continue searching other paths
        console.log(`ADB not found at: ${testPath}`)
      }
    }

    return null
  }

  public async getDefaultADBPath(): Promise<string> {
    const customADBPath = await this.currentStorage.get(
      globalStateKeys.customADBPathKey()
    )

    if (customADBPath && typeof customADBPath == 'string') {
      return customADBPath
    }

    const isEnv = await this.hasAndroidInEnv()
    if (isEnv) {
      return this.homeDir
    }
    const isOnDefaultFolder = await this.hasPlatformToolsDefaultFolder()
    if (isOnDefaultFolder) {
      return this.returnDefaultADBPath()
    }

    throw new ADBNotFoundError()
  }

  public async sendADBCommand(command: string): Promise<Buffer> {
    try {
      // First try to execute the command directly (if ADB is in PATH)
      console.log('Executing', command)
      return this.consoleInterface.execConsoleSync(command)
    } catch (error) {
      try {
        // If direct execution fails, try with the configured ADB path
        const adbPath = await this.getDefaultADBPath()
        console.log('Executing with path', command, 'in', adbPath)
        return this.consoleInterface.execConsoleSync(command, {
          cwd: adbPath
        })
      } catch (pathError) {
        // If both methods fail, show a helpful error message
        console.error('ADB command failed:', pathError)
        throw new ADBNotFoundError('ADB not found. Please install Android SDK or set a custom ADB path in settings.')
      }
    }
  }
}

export class ADBNotFoundError extends Error {
  constructor(message = 'ADB not founded in this machine') {
    super(message)
    this.message = message
  }
}
