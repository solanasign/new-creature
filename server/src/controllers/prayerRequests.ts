import { Response } from 'express';
import { PrayerRequest } from '../models/PrayerRequest';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllPrayerRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, isUrgent, isAnswered, limit = 20, page = 1 } = req.query;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Build query
    const query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isUrgent !== undefined) {
      query.isUrgent = isUrgent === 'true';
    }
    
    if (isAnswered !== undefined) {
      query.isAnswered = isAnswered === 'true';
    }
    
    // Show public requests and user's own requests
    query.$or = [
      { isPublic: true },
      { requester: userId }
    ];

    const skip = (Number(page) - 1) * Number(limit);
    
    const prayerRequests = await PrayerRequest.find(query)
      .populate('requester', 'firstName lastName fullName')
      .populate('prayedBy', 'firstName lastName fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await PrayerRequest.countDocuments(query);

    return res.json({
      prayerRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get prayer requests error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving prayer requests',
      code: 'PRAYER_REQUESTS_RETRIEVAL_FAILED'
    });
  }
};

export const getPrayerRequestById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const prayerRequest = await PrayerRequest.findById(id)
      .populate('requester', 'firstName lastName fullName')
      .populate('prayedBy', 'firstName lastName fullName')
      .lean();

    if (!prayerRequest) {
      return res.status(404).json({ 
        error: 'Prayer request not found',
        code: 'PRAYER_REQUEST_NOT_FOUND'
      });
    }

    // Check if user can view this prayer request
    if (!prayerRequest.isPublic && prayerRequest.requester !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    return res.json({ prayerRequest });
  } catch (error) {
    console.error('Get prayer request error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving prayer request',
      code: 'PRAYER_REQUEST_RETRIEVAL_FAILED'
    });
  }
};

export const createPrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      title,
      description,
      category,
      isAnonymous,
      isUrgent,
      isPublic,
      expiresAt
    } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ 
        error: 'Title, description, and category are required',
        code: 'MISSING_FIELDS'
      });
    }

    const prayerRequest = new PrayerRequest({
      requester: userId,
      title,
      description,
      category,
      isAnonymous: isAnonymous || false,
      isUrgent: isUrgent || false,
      isPublic: isPublic !== false, // Default to true
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    });

    await prayerRequest.save();

    const populatedPrayerRequest = await PrayerRequest.findById(prayerRequest._id)
      .populate('requester', 'firstName lastName fullName');

    return res.status(201).json({
      message: 'Prayer request created successfully',
      prayerRequest: populatedPrayerRequest
    });
  } catch (error) {
    console.error('Create prayer request error:', error);
    return res.status(500).json({ 
      error: 'Error creating prayer request',
      code: 'PRAYER_REQUEST_CREATION_FAILED'
    });
  }
};

export const updatePrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
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

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return res.status(404).json({ 
        error: 'Prayer request not found',
        code: 'PRAYER_REQUEST_NOT_FOUND'
      });
    }

    // Check if user can update this prayer request
    if (prayerRequest.requester !== userId && req.user?.role !== 'admin' && req.user?.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'category', 'isAnonymous', 'isUrgent',
      'isPublic', 'expiresAt'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'expiresAt') {
          prayerRequest[field] = updateData[field] ? new Date(updateData[field]) : undefined;
        } else {
          prayerRequest[field] = updateData[field];
        }
      }
    });

    await prayerRequest.save();

    const updatedPrayerRequest = await PrayerRequest.findById(id)
      .populate('requester', 'firstName lastName fullName')
      .populate('prayedBy', 'firstName lastName fullName');

    return res.json({
      message: 'Prayer request updated successfully',
      prayerRequest: updatedPrayerRequest
    });
  } catch (error) {
    console.error('Update prayer request error:', error);
    return res.status(500).json({ 
      error: 'Error updating prayer request',
      code: 'PRAYER_REQUEST_UPDATE_FAILED'
    });
  }
};

export const deletePrayerRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return res.status(404).json({ 
        error: 'Prayer request not found',
        code: 'PRAYER_REQUEST_NOT_FOUND'
      });
    }

    // Check if user can delete this prayer request
    if (prayerRequest.requester !== userId && req.user?.role !== 'admin' && req.user?.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await PrayerRequest.findByIdAndDelete(id);

    return res.json({
      message: 'Prayer request deleted successfully'
    });
  } catch (error) {
    console.error('Delete prayer request error:', error);
    return res.status(500).json({ 
      error: 'Error deleting prayer request',
      code: 'PRAYER_REQUEST_DELETION_FAILED'
    });
  }
};

export const markAsPrayedFor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return res.status(404).json({ 
        error: 'Prayer request not found',
        code: 'PRAYER_REQUEST_NOT_FOUND'
      });
    }

    // Check if user can view this prayer request
    if (!prayerRequest.isPublic && prayerRequest.requester !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const success = prayerRequest.markAsPrayedFor(userId);
    if (!success) {
      return res.status(400).json({ 
        error: 'Already marked as prayed for',
        code: 'ALREADY_PRAYED_FOR'
      });
    }

    await prayerRequest.save();

    return res.json({
      message: 'Marked as prayed for',
      prayerCount: prayerRequest.prayerCount
    });
  } catch (error) {
    console.error('Mark as prayed for error:', error);
    return res.status(500).json({ 
      error: 'Error marking as prayed for',
      code: 'MARK_PRAYED_FOR_FAILED'
    });
  }
};

export const markAsAnswered = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { answerNotes } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const prayerRequest = await PrayerRequest.findById(id);
    if (!prayerRequest) {
      return res.status(404).json({ 
        error: 'Prayer request not found',
        code: 'PRAYER_REQUEST_NOT_FOUND'
      });
    }

    prayerRequest.markAsAnswered(answerNotes);
    await prayerRequest.save();

    const updatedPrayerRequest = await PrayerRequest.findById(id)
      .populate('requester', 'firstName lastName fullName')
      .populate('prayedBy', 'firstName lastName fullName');

    return res.json({
      message: 'Prayer request marked as answered',
      prayerRequest: updatedPrayerRequest
    });
  } catch (error) {
    console.error('Mark as answered error:', error);
    return res.status(500).json({ 
      error: 'Error marking as answered',
      code: 'MARK_ANSWERED_FAILED'
    });
  }
};

export const getMyPrayerRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { limit = 20, page = 1 } = req.query;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const prayerRequests = await PrayerRequest.find({ requester: userId })
      .populate('requester', 'firstName lastName fullName')
      .populate('prayedBy', 'firstName lastName fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await PrayerRequest.countDocuments({ requester: userId });

    return res.json({
      prayerRequests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get my prayer requests error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving your prayer requests',
      code: 'MY_PRAYER_REQUESTS_RETRIEVAL_FAILED'
    });
  }
}; 