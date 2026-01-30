import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directories exist
const uploadDirs = {
  assignments: "./uploads/assignments",
  submissions: "./uploads/submissions",
  notes: "./uploads/notes",
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// CRITICAL: PDF-ONLY filter (as per requirements)
const pdfOnlyFilter = (req, file, cb) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();

  // Check MIME type
  const isPDF =
    file.mimetype === "application/pdf" ||
    file.mimetype === "application/x-pdf";

  if (ext === ".pdf" && isPDF) {
    return cb(null, true);
  }

  // Reject with clear error message
  cb(new Error("Only PDF files are allowed. Upload rejected."));
};

// Storage configuration for assignments (teacher uploads)
const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.assignments);
  },
  filename: (req, file, cb) => {
    // Safe filename: timestamp + random + sanitized original name
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `assignment-${timestamp}-${random}-${sanitizedName}`);
  },
});

// Storage configuration for submissions (student uploads)
const submissionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.submissions);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `submission-${timestamp}-${random}-${sanitizedName}`);
  },
});

// Storage configuration for notes (teacher uploads)
const notesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirs.notes);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, `notes-${timestamp}-${random}-${sanitizedName}`);
  },
});

// Upload middleware instances with strict PDF validation
export const uploadAssignment = multer({
  storage: assignmentStorage,
  fileFilter: pdfOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1, // Only one file at a time
  },
});

export const uploadSubmission = multer({
  storage: submissionStorage,
  fileFilter: pdfOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
});

export const uploadNotes = multer({
  storage: notesStorage,
  fileFilter: pdfOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
});

// Error handler for multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ message: "File too large. Maximum size is 10MB." });
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ message: "Unexpected file field." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
};
