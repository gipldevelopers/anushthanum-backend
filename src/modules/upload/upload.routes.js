const express = require('express');
const authMiddleware = require('../auth/auth.middleware');
const uploadController = require('./upload.controller');
const { upload, uploadBlog, uploadSubcategory, uploadProduct, uploadTeam } = require('./upload.multer');


const router = express.Router();
router.use(authMiddleware.authenticateAdmin);

router.post('/image', upload.single('image'), uploadController.uploadImage);
router.post('/blog-image', uploadBlog.single('image'), uploadController.uploadBlogImage);
router.post('/subcategory-image', uploadSubcategory.single('image'), uploadController.uploadSubcategoryImage);
router.post('/product-image', uploadProduct.single('image'), uploadController.uploadProductImage);
router.post('/team-image', uploadTeam.single('image'), uploadController.uploadTeamImage);


module.exports = router;
