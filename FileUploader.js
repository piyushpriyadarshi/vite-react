// import fetch from "node-fetch";
import process from "node:process";
import readdirp from "readdirp";
import fs from "fs";
import PQueue from "p-queue";

class FileUploader {
  queue;
  constructor(
    path,
    destination,
    storageName,
    storagePassword,
    storageEndpoint
  ) {
    this.path = path;
    this.destination = destination;
    this.storageName = storageName;
    this.storagePassword = storagePassword;
    this.storageEndpoint = storageEndpoint;
    this.queue = new PQueue({ concurrency: 5 });
  }

  async uploadFile(entry) {
    const readStream = fs.createReadStream(entry.fullPath);
    const destination = this.destination
      ? `${this.destination}/${entry.path}`
      : entry.path;
    console.log(
      `Deploying ${entry.path} by https://${this.storageEndpoint}/${this.storageName}/${destination}`
    );
    const response = await fetch(
      `https://${this.storageEndpoint}/${this.storageName}/${destination}`,
      {
        method: "PUT",
        headers: {
          AccessKey: this.storagePassword,
        },
        body: readStream,
        duplex: "half", // Add duplex option
      }
    );
    if (response.status === 201) {
      console.log(`Successful deployment of ${entry.path}.`);
    } else {
      throw new Error(
        `Uploading ${entry.path} has failed width status code ${response.status}.`
      );
    }
    return response;
  }
  async run() {
    console.log(process.env.STORAGE_NAME);
    for await (const entry of readdirp(this.path)) {
      this.queue.add(() => this.uploadFile(entry));
    }
    await this.queue.onIdle();
  }
}
await new FileUploader(
  "./dist",
  process.env.TEST_SESSIONID,
  "ehfe",
  "529bde5b-4f6d-446a-ae9b8d2e321d-959e-459d",
  "storage.bunnycdn.com"
).run();
export default FileUploader;
