async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Use field name "image".' });
  }
  const url = '/uploads/categories/' + req.file.filename;
  res.json({ success: true, url });
}

async function uploadBlogImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Use field name "image".' });
  }
  const url = '/uploads/blogs/' + req.file.filename;
  res.json({ success: true, url });
}

async function uploadSubcategoryImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Use field name "image".' });
  }
  const url = '/uploads/subcategories/' + req.file.filename;
  res.json({ success: true, url });
}

async function uploadProductImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded. Use field name "image".' });
  }
  const url = '/uploads/products/' + req.file.filename;
  res.json({ success: true, url });
}

module.exports = { uploadImage, uploadBlogImage, uploadSubcategoryImage, uploadProductImage };
