import { readFile } from "fs";
import { join } from "path";

export async function readFileByName(fileName: string) {
    return new Promise((resolve, reject) => {
        const filePath = join(__dirname, "../uploads", fileName);
        readFile(filePath, "utf8", (err: Error | null, data: string) => {
            if (err) {
                reject(err);
            } else {
                console.log("Success GET file: " + fileName);
                resolve(data);
            }
        });
    });
}
