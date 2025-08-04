import { Response } from 'express';
import { Sermon } from '../models/Sermon';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllSermons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { series, preacher, tags, limit = 20, page = 1 } = req.query;
    const userId = req.user?._id;

    // Build query
    const query: any = {};
    
    if (series) {
      query.series = series;
    }
    
    if (preacher) {
      query.preacher = preacher;
    }
    
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }
    
    // If user is not authenticated, only show public sermons
    if (!userId) {
      query.isPublic = true;
    } else {
      // If authenticated, show public sermons and user's private sermons
      query.$or = [
        { isPublic: true },
        { preacher: userId }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const sermons = await Sermon.find(query)
      .populate('preacher', 'firstName lastName fullName')
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Sermon.countDocuments(query);

    return res.json({
      sermons,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get sermons error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving sermons',
      code: 'SERMONS_RETRIEVAL_FAILED'
    });
  }
};

export const getSermonById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const sermon = await Sermon.findById(id)
      .populate('preacher', 'firstName lastName fullName')
      .lean();

    if (!sermon) {
      return res.status(404).json({ 
        error: 'Sermon not found',
        code: 'SERMON_NOT_FOUND'
      });
    }

    // Check if user can view this sermon
    if (!sermon.isPublic && sermon.preacher !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    return res.json({ sermon });
  } catch (error) {
    console.error('Get sermon error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving sermon',
      code: 'SERMON_RETRIEVAL_FAILED'
    });
  }
};

export const createSermon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      title,
      scripture,
      date,
      description,
      videoUrl,
      audioUrl,
      transcript,
      notes,
      tags,
      isPublic,
      duration,
      series,
      seriesPart,
      thumbnailUrl
    } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Validate required fields
    if (!title || !scripture || !date || !description) {
      return res.status(400).json({ 
        error: 'Title, scripture, date, and description are required',
        code: 'MISSING_FIELDS'
      });
    }

    const sermon = new Sermon({
      title,
      scripture,
      preacher: userId,
      date: new Date(date),
      description,
      videoUrl,
      audioUrl,
      transcript,
      notes,
      tags: tags || [],
      isPublic: isPublic !== false, // Default to true
      duration,
      series,
      seriesPart,
      thumbnailUrl
    });

    await sermon.save();

    const populatedSermon = await Sermon.findById(sermon._id)
      .populate('preacher', 'firstName lastName fullName');

    return res.status(201).json({
      message: 'Sermon created successfully',
      sermon: populatedSermon
    });
  } catch (error) {
    console.error('Create sermon error:', error);
    return res.status(500).json({ 
      error: 'Error creating sermon',
      code: 'SERMON_CREATION_FAILED'
    });
  }
};

export const updateSermon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return res.status(404).json({ 
        error: 'Sermon not found',
        code: 'SERMON_NOT_FOUND'
      });
    }

    // Check if user can update this sermon
    if (sermon.preacher !== userId && req.user?.role !== 'admin' && req.user?.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'scripture', 'date', 'description', 'videoUrl', 'audioUrl',
      'transcript', 'notes', 'tags', 'isPublic', 'duration', 'series',
      'seriesPart', 'thumbnailUrl'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'date') {
          sermon[field] = new Date(updateData[field]);
        } else {
          sermon[field] = updateData[field];
        }
      }
    });

    await sermon.save();

    const updatedSermon = await Sermon.findById(id)
      .populate('preacher', 'firstName lastName fullName');

    return res.json({
      message: 'Sermon updated successfully',
      sermon: updatedSermon
    });
  } catch (error) {
    console.error('Update sermon error:', error);
    return res.status(500).json({ 
      error: 'Error updating sermon',
      code: 'SERMON_UPDATE_FAILED'
    });
  }
};

export const deleteSermon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return res.status(404).json({ 
        error: 'Sermon not found',
        code: 'SERMON_NOT_FOUND'
      });
    }

    // Check if user can delete this sermon
    if (sermon.preacher !== userId && req.user?.role !== 'admin' && req.user?.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await Sermon.findByIdAndDelete(id);

    return res.json({
      message: 'Sermon deleted successfully'
    });
  } catch (error) {
    console.error('Delete sermon error:', error);
    return res.status(500).json({ 
      error: 'Error deleting sermon',
      code: 'SERMON_DELETION_FAILED'
    });
  }
};

export const incrementViewCount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const sermon = await Sermon.findById(id);
    if (!sermon) {
      return res.status(404).json({ 
        error: 'Sermon not found',
        code: 'SERMON_NOT_FOUND'
      });
    }

    // Check if user can view this sermon
    if (!sermon.isPublic && sermon.preacher !== req.user?._id) {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    sermon.incrementViewCount();
    await sermon.save();

    return res.json({
      message: 'View count incremented',
      viewCount: sermon.viewCount
    });
  } catch (error) {
    console.error('Increment view count error:', error);
    return res.status(500).json({ 
      error: 'Error incrementing view count',
      code: 'VIEW_COUNT_INCREMENT_FAILED'
    });
  }
}; 