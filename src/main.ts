// logging
enum LogLevel {
  Debug,
  Info,
  Warn,
  Error,
  None,
}

class Logger {
  private level: LogLevel;
  private tag: string;
  private programName: string;

  constructor(
    level: LogLevel = LogLevel.Debug,
    tag: string = "",
    programName: string = ""
  ) {
    this.level = level;
    this.tag = tag;
    this.programName = programName;
  }

  private getStackTrace() {
    const err = new Error();
    return err.stack;
  }

  private parseStackTrace(stack: string | undefined): string {
    if (!stack) return "Unknown";
    const stackLines = stack.split("\n");
    // Adjust the index 2 based on where the error stack is generated
    const callerLine = stackLines[2];
    // Extracting file name and line number
    const match = callerLine.match(/at (.*?) \(?(.*?):(\d+):(\d+)\)?/);

    if (match) {
      const functionName = match[1];
      const fileName = match[2];
      const lineNumber = match[3];
      return `${functionName} ${fileName}:${lineNumber}`;
    }

    return "Unknown";
  }

  private log(message: string, level: LogLevel) {
    if (this.level <= level) {
      const timestamp = new Date().toISOString();
      const logLevelString = LogLevel[level];
      const trace = this.parseStackTrace(this.getStackTrace());
      const formattedMessage = `[${
        this.programName
      }] [${timestamp}] [${logLevelString}] ${
        this.tag ? `[${this.tag}] ` : ""
      }[${trace}] ${message}`;
      console.log(formattedMessage);
    }
  }

  debug(message: string) {
    this.log(message, LogLevel.Debug);
  }

  info(message: string) {
    this.log(message, LogLevel.Info);
  }

  warn(message: string) {
    this.log(message, LogLevel.Warn);
  }

  error(message: string) {
    this.log(message, LogLevel.Error);
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }
}
const logger = new Logger(LogLevel.Debug, "main", "zozobra");

// model
namespace kwin {
  interface Toplevel {
    readonly internalId: Qt.QUuid;
    readonly normalWindow: boolean;
  }
  export interface AbstractClient extends Toplevel {
    readonly caption: string;
  }
  export interface WorkspaceWrapper {
    clientAdded: Signal<(client: AbstractClient) => void>;
    clientRemoved: Signal<(client: AbstractClient) => void>;
  }
}
interface WindowState {
  group: number;
  layer: number;
}

class ScreenModel {
  clientStates: Map<string, WindowState> = new Map();
  initialState: WindowState = {
    group: 1,
    layer: 1,
  };

  constructor() {}

  addClient = (client: kwin.AbstractClient) => {
    if (!client.normalWindow) return;
    logger.debug(
      `Adding client ${client.caption} with ID: ${client.internalId}`
    );
    this.clientStates.set(client.internalId.toString(), this.initialState);
    this.printStates();
  };
  removeClient = (client: kwin.AbstractClient) => {
    if (!client.normalWindow) return;
    logger.debug(
      `Removing client ${client.caption} with ID: ${client.internalId}`
    );
    this.clientStates.delete(client.internalId.toString());
    this.printStates();
  };
  printStates = () => {
    this.clientStates.forEach((state, internalId) => {
      logger.debug(`ID: ${internalId}`);
      logger.debug(`\tGroup: ${state.group}`);
      logger.debug(`\tLayer: ${state.layer}`);
    });
  };
}
const model = new ScreenModel();

// controller
workspace.clientAdded.connect(model.addClient);
workspace.clientRemoved.connect(model.removeClient);
