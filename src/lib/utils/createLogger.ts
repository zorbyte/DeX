import chalk from "chalk";
import debug from "debug";
import cleanStack = require("clean-stack");
import { isError } from "util";

export interface ILogger {
  child(name: string): ILogger;
  error(...errorData: (Error & any)[]): void;
  (...data: any[]): ILogger;
}

const [colStart, colEnd] = chalk.red("_").split("_");

function createLogger(name: string): ILogger {
  // @ts-ignore Setup colours, this is a hidden debug API.
  const colourNum = debug.selectColor(name);
  const colourCode = `\u001B[3${(colourNum < 8 ? colourNum : "8;5;" + colourNum)};1m`;
  const useCol = chalk.supportsColor;
  const loggerName = `${useCol ? colourCode : ""}${name}${useCol ? "\u001B[0m" : ""}`;

  const logMessage = (isErrorMsg: boolean, ...data: any[]) => {
    if (isErrorMsg) data = data
      .map(arg => isError(arg) ? `\n${cleanStack(arg.stack as string)}` : arg);
    
    // Colours.
    const iColStart = isErrorMsg ? colStart : "";
    const iColEnd = isErrorMsg ? colEnd : "";

    data = data
      .join("")
      .split("\n")
      .map((line, ind) => {
        line = `${iColStart}${line}${iColEnd}`;
        return ind === 0 ? line : `\n  ${loggerName} ${line}`;
      });

    console[isErrorMsg ? "error" : "info"](`  ${loggerName}`, ...data);
  }

  function loggerInst(...data: any[]) {
    if (process.env.NODE_ENV === "production") return;
    logMessage(false, ...data);
  }

  (loggerInst as ILogger).error = (...errorData: (Error & any)[]) =>
    logMessage(true, ...errorData);
  (loggerInst as ILogger).child = (nameConcat: string) =>
    createLogger(`${name}:${nameConcat}`);

  return loggerInst as ILogger;
}

export default createLogger;