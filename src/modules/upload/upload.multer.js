const path = require('path');
const fs = require('fs');
const multer = require('multer');

function createStorage(subdir) {
  const uploadDir = path.join(process.cwd(), 'uploads', subdir);
  return multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (err) {
        cb(err);
      }
    },
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '').toLowerCase() || '.jpg';
      const safeName = Date.now() + '-' + (file.originalname || 'image').replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 80);
      cb(null, safeName.replace(/\.[^.]*$/, '') + ext);
    },
  });
}

const imageFilter = (req, file, cb) => {
  const allowed = /image\/(jpeg|jpg|png|gif|webp)/i.test(file.mimetype);
  if (allowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed.'), false);
  }
};

const upload = multer({
  storage: createStorage('categories'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadBlog = multer({
  storage: createStorage('blogs'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSubcategory = multer({
  storage: createStorage('subcategories'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadProduct = multer({
  storage: createStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadSubSubCategory = multer({
  storage: createStorage('subsubcategories'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadTeam = multer({
  storage: createStorage('team'),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = { upload, uploadBlog, uploadSubcategory, uploadProduct, uploadSubSubCategory, uploadTeam };

