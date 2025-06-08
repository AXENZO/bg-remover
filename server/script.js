const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors()); // Enable CORS for frontend requests

// Serve static files (processed images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Setup multer for file uploads
const upload = multer({ dest: uploadDir });

// API route to handle image upload and background removal
app.post("/remove-bg", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = path.resolve(req.file.path);
    const outputPath = path.resolve(uploadDir, `processed_${req.file.filename}.png`);

    console.log(`Processing Image: ${inputPath}`);

    // Ensure correct Python execution (Windows vs Linux/Mac)
    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    // Check if `remove_bg.py` is in the same folder as `server.js`
    const scriptPath = path.join(__dirname, "remove_bg.py");
    if (!fs.existsSync(scriptPath)) {
        return res.status(500).json({ error: "Python script not found" });
    }

    // Execute Python script to remove background
    exec(`${pythonCmd} "${scriptPath}" "${inputPath}" "${outputPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error processing image: ${stderr}`);
            return res.status(500).json({ error: "Background removal failed" });
        }

        // Check if processed image exists
        if (!fs.existsSync(outputPath)) {
            return res.status(500).json({ error: "Processed image not found" });
        }

        console.log(`Processed Image Saved: ${outputPath}`);
        res.json({ processedImage: `/uploads/processed_${req.file.filename}.png` });
    });
});

// Start the backend server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));