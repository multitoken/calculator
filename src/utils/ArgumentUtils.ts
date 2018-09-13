export default class ArgumentUtils {

  public static getValue(envKey: string, def?: string | undefined): any {
    if (process.env.hasOwnProperty(envKey)) {
      return process.env[envKey];
    }

    const argsKey: string = envKey.toLowerCase()
      .replace(/([_][a-z0-9])/g, (substring) => substring.toUpperCase())
      .replace(/([_])/g, '');

    const args: string[] = process.argv;
    const len: number = args.length;
    for (let i = 0; i < len; i++) {
      if (args[i] === argsKey) {
        const hasNext = i + 1 < len;

        return hasNext ? (args[i + 1] || '') : '';
      }
    }
    return def;
  }

}
