import { Module } from '@nestjs/common';
import globby from 'globby';

import { HttpsModule } from '../https/https.module';
import { UtilController } from './util.controller';
import { UtilService } from './util.service';

@Module({
  imports: [ HttpsModule.register() ],
  controllers: [ UtilController ],
  providers: [ UtilService ],
  exports: [ UtilService ],
})
export class UtilModule {

  /**
   * Given a glob path string, find all matching files
   * and return an array of their exports.
   *
   * If there is a mix of sources and maps, keep only
   * the JavaScript version.
   * @param globPath
   * @param root
   */
  public static globRequire(globPath: string | string[], root?: string): any[] {
    globPath = Array.isArray(globPath) ? globPath : [ globPath ];
    const cwd = root || process.cwd();

    const matchingFiles = globby.sync(globPath, { cwd });
    const jsFiles = matchingFiles.filter((file) => file.match(/\.js$/g));
    const normalizedFiles = jsFiles.length > 0 ? jsFiles : matchingFiles;

    const exportsArrays = normalizedFiles.map((file) => {
      const exportsObject = require(`${cwd}/${file}`); // eslint-disable-line @typescript-eslint/no-var-requires
      return Object.keys(exportsObject).map((key) => exportsObject[key]);
    });

    return [].concat(...exportsArrays);
  }

}
