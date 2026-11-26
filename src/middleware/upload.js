const multer = require("multer");

// The settings form is sent as multipart/form-data (it has file inputs).
// Image uploads are not implemented yet, so files are ignored and only
// the text fields are parsed into req.body.
const parseSettingsForm = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 2, fields: 50 },
  fileFilter: (req, file, cb) => cb(null, false),
}).fields([
  { name: "profilePicture", maxCount: 1 },
  { name: "backgroundImage", maxCount: 1 },
]);

function settingsForm(req, res, next) {
  parseSettingsForm(req, res, (error) => {
    if (error) {
      req.flash("error", "Could not read the settings form. Please try again.");
      return res.redirect("/settings");
    }
    return next();
  });
}

module.exports = { settingsForm };
