const Category = require('../models/Category');

// @desc    Get all categories (public - only active)
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    
    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all categories (admin - including inactive)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
exports.getAllCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const query = {};
    
    if (type) {
      query.type = type;
    }

    const categories = await Category.find(query).sort({ type: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res, next) => {
  try {
    const { name, type, description } = req.body;

    // Check if category already exists for this type
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }, 
      type 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: `Category "${name}" already exists for ${type}`,
      });
    }

    const category = await Category.create({
      name,
      type,
      description,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // If name is being changed, check for duplicates
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        type: req.body.type || category.type,
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: `Category "${req.body.name}" already exists`,
        });
      }
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed default categories
// @route   POST /api/categories/seed
// @access  Private/Admin
exports.seedCategories = async (req, res, next) => {
  try {
    const blogCategories = [
      'Income Tax',
      'Sales Tax',
      'Customs',
      'GST',
      'SECP',
      'Trademark',
      'WEBOC',
      'NTN Registration',
      'General',
    ];

    const newsCategories = [
      'Circular',
      'Notification',
      'News',
      'Update',
      'General',
    ];

    const createdCategories = [];

    // Create Blog categories
    for (const name of blogCategories) {
      const existing = await Category.findOne({ name, type: 'Blog' });
      if (!existing) {
        const category = await Category.create({ name, type: 'Blog' });
        createdCategories.push(category);
      }
    }

    // Create News categories
    for (const name of newsCategories) {
      const existing = await Category.findOne({ name, type: 'News' });
      if (!existing) {
        const category = await Category.create({ name, type: 'News' });
        createdCategories.push(category);
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdCategories.length} categories`,
      data: createdCategories,
    });
  } catch (error) {
    next(error);
  }
};
