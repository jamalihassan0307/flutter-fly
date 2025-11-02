import * as path from 'path'

export const getAndroidStudioPath = ({ osType, homeDir }) => {
  switch (osType) {
    case 'Windows_NT':
      return path.win32.join(
        homeDir,
        '/AppData/Local/Android/Sdk/platform-tools'
      )
    case 'Darwin':
      return path.posix.join(homeDir, '/Library/Android/sdk/platform-tools')
    case 'Linux':
      return path.posix.join(homeDir, '/Android/Sdk/platform-tools')
    default:
      throw new TypeError('Android Path Error: Invalid Platform')
  }
}

/**
 * Get common ADB paths to search across all platforms
 */
export const getCommonADBPaths = ({ osType, homeDir }): string[] => {
  const paths: string[] = []
  
  switch (osType) {
    case 'Windows_NT':
      paths.push(
        path.win32.join(homeDir, '/AppData/Local/Android/Sdk/platform-tools'),
        path.win32.join(homeDir, '/AppData/Local/Android/Sdk'),
        'C:\\Android\\platform-tools',
        'C:\\Android\\Sdk\\platform-tools',
        path.win32.join(process.env['ProgramFiles'] || 'C:\\Program Files', '/Android/platform-tools'),
        path.win32.join(process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)', '/Android/platform-tools')
      )
      break
    case 'Darwin':
      paths.push(
        path.posix.join(homeDir, '/Library/Android/sdk/platform-tools'),
        path.posix.join(homeDir, '/Library/Android/sdk'),
        '/opt/homebrew/opt/android-platform-tools',
        '/usr/local/opt/android-platform-tools',
        '/Applications/Android Studio.app/Contents/jre/Contents/Home'
      )
      break
    case 'Linux':
      paths.push(
        path.posix.join(homeDir, '/Android/Sdk/platform-tools'),
        path.posix.join(homeDir, '/Android/Sdk'),
        '/opt/android-sdk/platform-tools',
        '/usr/lib/android-sdk/platform-tools',
        '/usr/local/android-sdk/platform-tools',
        path.posix.join(homeDir, '/.local/share/Android/Sdk/platform-tools')
      )
      break
  }
  
  return paths
}
