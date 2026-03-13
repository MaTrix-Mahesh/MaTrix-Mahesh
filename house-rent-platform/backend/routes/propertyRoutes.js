import express from 'express';
import {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    createPropertyReview
} from '../controllers/propertyController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/cloudinary.js';

const router = express.Router();

router.route('/')
    .get(getProperties)
    .post(protect, authorize('owner', 'admin'), upload.array('images', 5), createProperty);

router.route('/:id')
    .get(getPropertyById)
    .put(protect, authorize('owner', 'admin'), upload.array('images', 5), updateProperty)
    .delete(protect, authorize('owner', 'admin'), deleteProperty);

router.route('/:id/reviews')
    .post(protect, createPropertyReview);

export default router;
