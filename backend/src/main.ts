import express, { Request, Response } from "express";
import multer, { diskStorage } from "multer";
import cors from "cors";
import path from "path";
import { existsSync, mkdirSync } from "fs";
import { readFileByName } from "./services/app";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const uploadsDir = path.join(__dirname, "/uploads");

if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
    console.log(`Uploads directory created.`);
}

const storageConfig = diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        callback: (error: Error | null, destination: string) => void
    ) => {
        callback(null, uploadsDir);
    },
    filename: (
        _req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename: string) => void
    ) => {
        callback(null, file.originalname);
    },
});

const fileUploadMiddleware = multer({
    storage: storageConfig,
});

app.get("/", (_req: Request, res: Response) => {
    res.send("Hello World!");
});

// POST: Upload file to server
app.post(
    "/api/ifc/uploads",
    fileUploadMiddleware.single("file"),
    (req: Request, res: Response) => {
        console.log(
            `Received file uploads request: ${
                req.file ? req.file.originalname : "No file uploaded"
            }`
        );
        if (!req.file) {
            console.error("No file uploaded.");
            res.status(400).json({
                status: "error",
                message: "No file uploaded. Please provide a file to upload.",
            });
            return;
        }
        try {
            res.status(200).json({
                status: "success",
                message: `File uploaded successfully: ${req.file.originalname}`,
                filename: `${req.file.originalname}`,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                res.status(500).json({
                    status: "error",
                    message: "Error reading file: " + err.message,
                });
            } else {
                res.status(500).json({
                    status: "error",
                    message: "An unknown error occurred.",
                });
            }
        }
    }
);

// GET: Get file by filename
app.get("/api/ifc/files/:filename", async (req: Request, res: Response) => {
    const fileName = req.params.filename;
    try {
        const fileData = await readFileByName(fileName); // getFile
        res.status(200).send(fileData);
    } catch (err: unknown) {
        if (err instanceof Error) {
            res.status(500).json({
                status: "error",
                message: "Error reading file: " + err.message,
            });
        } else {
            res.status(500).json({
                status: "error",
                message: "An unknown error occurred.",
            });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;
