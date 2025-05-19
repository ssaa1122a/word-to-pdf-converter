const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
app.use(cors());
app.use('/converted', express.static(path.join(__dirname, 'converted')));

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const outputPath = path.join(__dirname, 'converted');

    if (!file) return res.status(400).send('No file uploaded.');

    const inputPath = path.resolve(file.path);
    const command = `libreoffice --headless --convert-to pdf "${inputPath}" --outdir "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) return res.status(500).send('Conversion failed.');

        const pdfFileName = file.originalname.replace(/\.(docx|doc)$/i, '.pdf');
        const pdfFilePath = path.join('/converted', pdfFileName);
        return res.json({ downloadUrl: pdfFilePath });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
