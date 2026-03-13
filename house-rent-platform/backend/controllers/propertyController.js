import Property from '../models/Property.js';
import { uploadBufferToCloudinary } from '../utils/cloudinary.js';

// @desc    Get all properties (with filtration)
// @route   GET /api/properties
// @access  Public
export const getProperties = async (req, res) => {
    try {
        const { city, minPrice, maxPrice, type, rooms, furnished } = req.query;
        let query = {};

        if (city) query.location = { $regex: city, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }
        if (rooms) query.facilities = { $regex: `${rooms} Room`, $options: 'i' }; // simple mockup for now

        const properties = await Property.find(query).populate('ownerId', 'name email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
export const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id)
            .populate('ownerId', 'name email')
            .populate('reviews.user', 'name');

        if (property) {
            res.json(property);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private (Owner/Admin)
export const createProperty = async (req, res) => {
    try {
        const { title, price, location, description, facilities, images } = req.body;
        
        let imageUrls = images || [];
        if (req.files && req.files.length > 0) {
            const uploads = await Promise.all(
                req.files.map((file) =>
                    uploadBufferToCloudinary(file.buffer, { folder: 'house_rent_platform' })
                )
            );
            imageUrls = uploads.map((r) => r.secure_url);
        }

        const property = new Property({
            title,
            price,
            location,
            description,
            facilities: Array.isArray(facilities) ? facilities : [facilities],
            images: imageUrls,
            ownerId: req.user._id
        });

        const createdProperty = await property.save();
        res.status(201).json(createdProperty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Owner/Admin)
export const updateProperty = async (req, res) => {
    try {
        const { title, price, location, description, facilities } = req.body;
        const property = await Property.findById(req.params.id);

        if (property) {
            // Check ownership
            if (property.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this property' });
            }

            property.title = title || property.title;
            property.price = price || property.price;
            property.location = location || property.location;
            property.description = description || property.description;
            property.facilities = facilities ? (Array.isArray(facilities) ? facilities : [facilities]) : property.facilities;
            
            if (req.files && req.files.length > 0) {
                const uploads = await Promise.all(
                    req.files.map((file) =>
                        uploadBufferToCloudinary(file.buffer, { folder: 'house_rent_platform' })
                    )
                );
                property.images = uploads.map((r) => r.secure_url);
            }

            const updatedProperty = await property.save();
            res.json(updatedProperty);
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Owner/Admin)
export const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);

        if (property) {
            if (property.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this property' });
            }

            await property.deleteOne();
            res.json({ message: 'Property removed' });
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new review
// @route   POST /api/properties/:id/reviews
// @access  Private
export const createPropertyReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const property = await Property.findById(req.params.id);

        if (property) {
            const alreadyReviewed = property.reviews.find(
                (r) => r.user.toString() === req.user._id.toString()
            );

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Property already reviewed' });
            }

            const review = {
                user: req.user._id,
                rating: Number(rating),
                comment
            };

            property.reviews.push(review);
            property.rating =
                property.reviews.reduce((acc, item) => item.rating + acc, 0) / property.reviews.length;

            await property.save();
            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
