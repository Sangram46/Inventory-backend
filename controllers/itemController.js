const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const Item = require('../models/Item');

exports.getStats = async (req, res) => {
  try {
    const [result] = await Item.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        },
      },
    ]);
    res.json({
      totalItems: result?.totalItems || 0,
      totalValue: result?.totalValue || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createValidation = [
  body('name').trim().notEmpty().withMessage('Item name is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('description').optional().trim(),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
];

exports.updateValidation = [
  param('id').isMongoId().withMessage('Invalid item ID'),
  body('name').optional().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').optional().isMongoId().withMessage('Valid category is required'),
  body('description').optional().trim(),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
];

exports.getItems = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const filter = { createdBy: req.user._id };

    // Filter by category
    if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
      filter.category = req.query.category;
    }

    // Search by name/description
    if (req.query.search && req.query.search.trim()) {
      const searchTerm = req.query.search.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Item.find(filter)
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate('category', 'name')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    const item = await Item.create({
      name,
      description,
      price,
      quantity,
      category,
      createdBy: req.user._id,
    });

    const populated = await Item.findById(item._id)
      .populate('category', 'name')
      .lean();

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name, description, price, quantity, category } = req.body;

    const item = await Item.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, description, price, quantity, category },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
