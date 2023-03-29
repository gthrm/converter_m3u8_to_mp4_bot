import ffmpeg from 'fluent-ffmpeg';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

export default class Converter {
  downloadPercent = 0;

  /**
   * Sets the input file
   * @param {String} filename M3U8 file path. You can use remote URL
   * @returns {Function}
   */
  setInputFile(filename) {
    if (!filename) {
      throw new Error('You must specify the M3U8 file address');
    }

    this.M3U8_FILE = filename;

    return this;
  }

  /**
   * Sets the output file
   * @param {String} filename Output file path. Has to be local :)
   * @returns {Function}
   */
  setOutputFile(filename) {
    if (!filename) {
      throw new Error('You must specify the file path and name');
    }

    this.OUTPUT_FILE = filename;

    return this;
  }

  setContext(ctx) {
    if (ctx) {
      this.CTX = ctx;
    }

    return this;
  }

  /**
   * Starts the process
   */
  start() {
    return new Promise((resolve, reject) => {
      if (!this.M3U8_FILE || !this.OUTPUT_FILE) {
        reject(new Error('You must specify the input and the output files'));
        return;
      }

      ffmpeg(this.M3U8_FILE)
        .on('start', async () => {
          if (this.CTX) {
            const startMessage = await this.CTX.telegram.sendMessage(
              this.CTX.message.chat.id,
              'Please wait',
            );

            this.MESSAGE_ID = startMessage.message_id;
            this.CHAT_ID = startMessage.chat.id;
          }
        })
        .on('progress', (p) => {
          readline.cursorTo(process?.stdout, 0);
          const downloadPercent = Math.round(
            p?.percent,
          );
          const message = `${p?.targetSize}kb downloaded; ${downloadPercent} %`;
          process.stdout.write(message);
        })
        .on('error', (error) => {
          reject(new Error(error));
        })
        .on('end', () => {
          this.CTX.telegram.sendMessage(
            this.CTX.message.chat.id,
            'File downloaded. Wait',
          );
          this.downloadPercent = 0;
          resolve();
        })
        .outputOptions('-c copy')
        .outputOptions('-bsf:a aac_adtstoasc')
        .output(this.OUTPUT_FILE)
        .run();
    });
  }
}
