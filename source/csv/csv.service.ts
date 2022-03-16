import { Injectable, InternalServerErrorException } from '@nestjs/common';
import fs from 'fs';

import { LoggerSeverity } from '../logger/logger.enum';
import { LoggerParams, LoggerTransport } from '../logger/logger.interface';
import { LoggerService } from '../logger/logger.service';
import { CsvConfig } from './csv.config';
import { CsvReadDto } from './csv.dto';

@Injectable()
export class CsvService implements LoggerTransport {

  private csvStream: fs.WriteStream;
  private currentFilename: string;

  public constructor(
    private readonly csvConfig: CsvConfig,
    private readonly loggerService: LoggerService,
  ) {
    this.setupTransport();
  }

  /**
   * Sets up the logger transport, ensure log directory exists.
   */
  private setupTransport(): void {
    const severity = this.getSeverity();
    const dir = this.csvConfig.CSV_DIRECTORY;

    if (!severity) {
      this.loggerService.info('Log streaming disable due to missing severity');
      return;
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.setupStream();
    this.loggerService.info(`Log streaming started at ${this.currentFilename}`);

    this.loggerService.registerTransport(this);
  }

  /**
   * Sets up the CSV stream with hourly file rotation,
   * as well as create default headings.
   */
  private setupStream(): void {
    const dir = this.csvConfig.CSV_DIRECTORY;

    this.csvStream?.destroy?.();
    this.currentFilename = this.getExpectedFilename();

    this.csvStream = fs.createWriteStream(`${dir}/${this.currentFilename}`, {
      flags: 'w',
      encoding: 'utf-8',
    });

    this.csvStream.on('error', (e) => this.loggerService.warning(this.csvConfig.CSV_EXCEPTION_MESSAGE, e));

    this.csvStream.write(`${this.csvConfig.CSV_HEADER}\n`);
  }

  /**
   * Returns minimum level for logging this transport.
   */
  public getSeverity(): LoggerSeverity {
    return this.csvConfig.CSV_SEVERITY;
  }

  /**
   * Adds log record to CSV stream.
   * @param params
   */
  public log(params: LoggerParams): void {
    const { environment, timestamp, severity, requestId, caller, message, data } = params;
    if (message === this.csvConfig.CSV_EXCEPTION_MESSAGE) return;

    const filename = this.getExpectedFilename();

    if (filename !== this.currentFilename) {
      this.setupStream();
    }

    this.csvStream.write(
      `${this.escapeCsvField(timestamp)},`
      + `${this.escapeCsvField(environment)},`
      + `${this.escapeCsvField(severity)},`
      + `${this.escapeCsvField(requestId)},`
      + `${this.escapeCsvField(caller)},`
      + `${this.escapeCsvField(message)},`
      + `${this.escapeCsvField(JSON.stringify(data))}`
      + '\n',
    );
  }

  /**
   * Escapes target string into CSV format.
   * @param field
   */
  private escapeCsvField(field: string): string {
    return `"${field ? field.replace(/"/g, '""') : ''}"`;
  }

  /**
   * Reads logs in CSV format considering target past hours.
   * @param params
   */
  public async readLogs(params: CsvReadDto): Promise<Buffer> {
    const severity = this.getSeverity();

    if (!severity) {
      throw new InternalServerErrorException('csv logs must be enabled through the CSV_SEVERITY environment variable');
    }

    const { hours } = params;
    const readHours = hours || this.csvConfig.CSV_DEFAULT_READ_HOURS;
    const filenames: string[] = [ ];

    for (let i = 0; i < readHours; i++) {
      const referenceDate = new Date(new Date().setHours(new Date().getHours() - i));
      filenames.push(`${referenceDate.toISOString().split(':')[0]}.csv`);
    }

    const fileBuffers = await Promise.all(filenames.reverse().map((f) => this.readLogByFilename(f)));
    const fileStrings = fileBuffers.filter((f) => f).map((f) => f.toString('utf-8'));
    const fileJoined = fileStrings.join('\n').replace(new RegExp(`\n${this.csvConfig.CSV_HEADER}\n`, 'g'), '');

    return Buffer.from(fileJoined, 'utf-8');
  }

  /**
   * Reads single log by filename.
   * @param filename
   */
  public async readLogByFilename(filename: string): Promise<Buffer> {
    const dir = this.csvConfig.CSV_DIRECTORY;
    let fileBuffer: Buffer;

    try {
      fileBuffer = await new Promise((resolve, reject) => {
        return fs.readFile(`${dir}/${filename}`, (err, data) => err ? reject(err) : resolve(data));
      });
    }
    catch (e) {
      if (!e.message?.includes('no such file or directory')) {
        throw e;
      }
    }

    return fileBuffer;
  }

  /**
   * Acquire current log filename.
   */
  public getExpectedFilename(): string {
    const timestamp = new Date().toISOString();
    return `${timestamp.split(':')[0]}.csv`;
  }

}
