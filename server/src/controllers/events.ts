import { Response } from 'express';
import { Event } from '../models/Event';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAllEvents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type, isPublic, limit = 20, page = 1 } = req.query;
    const userId = req.user?._id;

    // Build query
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    // If user is not authenticated, only show public events
    if (!userId) {
      query.isPublic = true;
    } else {
      // If authenticated, show public events and user's private events
      query.$or = [
        { isPublic: true },
        { organizer: userId }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName fullName')
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Event.countDocuments(query);

    return res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving events',
      code: 'EVENTS_RETRIEVAL_FAILED'
    });
  }
};

export const getEventById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const event = await Event.findById(id)
      .populate('organizer', 'firstName lastName fullName')
      .populate('currentAttendees', 'firstName lastName fullName')
      .lean();

    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Check if user can view this event
    if (!event.isPublic && event.organizer !== userId) {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    return res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving event',
      code: 'EVENT_RETRIEVAL_FAILED'
    });
  }
};

export const createEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      type,
      isRecurring,
      recurringPattern,
      recurringDay,
      recurringDate,
      isPublic,
      maxAttendees,
      contactInfo,
      notes
    } = req.body;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Validate required fields
    if (!title || !description || !date || !startTime || !location || !type) {
      return res.status(400).json({ 
        error: 'Title, description, date, start time, location, and type are required',
        code: 'MISSING_FIELDS'
      });
    }

    const event = new Event({
      title,
      description,
      date: new Date(date),
      startTime,
      endTime,
      location,
      type,
      isRecurring: isRecurring || false,
      recurringPattern,
      recurringDay,
      recurringDate,
      isPublic: isPublic !== false, // Default to true
      maxAttendees,
      organizer: userId,
      contactInfo,
      notes
    });

    await event.save();

    const populatedEvent = await Event.findById(event._id)
      .populate('organizer', 'firstName lastName fullName');

    return res.status(201).json({
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({ 
      error: 'Error creating event',
      code: 'EVENT_CREATION_FAILED'
    });
  }
};

export const updateEvent = async (req: AuthenticatedRequest, res: Response) => {
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

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Check if user can update this event
    if (event.organizer !== userId && req.user?.role !== 'admin' && req.user?.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    // Update allowed fields
    const allowedFields = [
      'title', 'description', 'date', 'startTime', 'endTime', 'location',
      'type', 'isRecurring', 'recurringPattern', 'recurringDay', 'recurringDate',
      'isPublic', 'maxAttendees', 'contactInfo', 'notes'
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'date') {
          event[field] = new Date(updateData[field]);
        } else {
          event[field] = updateData[field];
        }
      }
    });

    await event.save();

    const updatedEvent = await Event.findById(id)
      .populate('organizer', 'firstName lastName fullName')
      .populate('currentAttendees', 'firstName lastName fullName');

    return res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({ 
      error: 'Error updating event',
      code: 'EVENT_UPDATE_FAILED'
    });
  }
};

export const deleteEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    // Check if user can delete this event
    if (event.organizer !== userId && req.user?.role !== 'admin' && req.user?.role !== 'pastor') {
      return res.status(403).json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    await Event.findByIdAndDelete(id);

    return res.json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ 
      error: 'Error deleting event',
      code: 'EVENT_DELETION_FAILED'
    });
  }
};

export const joinEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    if (event.isFull) {
      return res.status(400).json({ 
        error: 'Event is full',
        code: 'EVENT_FULL'
      });
    }

    const success = event.addAttendee(userId);
    if (!success) {
      return res.status(400).json({ 
        error: 'Already registered for this event',
        code: 'ALREADY_REGISTERED'
      });
    }

    await event.save();

    return res.json({
      message: 'Successfully joined event',
      event: {
        id: event._id,
        title: event.title,
        currentAttendees: event.currentAttendees,
        isFull: event.isFull,
        availableSpots: event.availableSpots
      }
    });
  } catch (error) {
    console.error('Join event error:', error);
    return res.status(500).json({ 
      error: 'Error joining event',
      code: 'JOIN_EVENT_FAILED'
    });
  }
};

export const leaveEvent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ 
        error: 'Event not found',
        code: 'EVENT_NOT_FOUND'
      });
    }

    const success = event.removeAttendee(userId);
    if (!success) {
      return res.status(400).json({ 
        error: 'Not registered for this event',
        code: 'NOT_REGISTERED'
      });
    }

    await event.save();

    return res.json({
      message: 'Successfully left event',
      event: {
        id: event._id,
        title: event.title,
        currentAttendees: event.currentAttendees,
        isFull: event.isFull,
        availableSpots: event.availableSpots
      }
    });
  } catch (error) {
    console.error('Leave event error:', error);
    return res.status(500).json({ 
      error: 'Error leaving event',
      code: 'LEAVE_EVENT_FAILED'
    });
  }
};

export const getMyEvents = async (req: AuthenticatedRequest, res: Response) => {
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
    
    // Get events where user is organizer or attendee
    const events = await Event.find({
      $or: [
        { organizer: userId },
        { currentAttendees: userId }
      ]
    })
      .populate('organizer', 'firstName lastName fullName')
      .sort({ date: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Event.countDocuments({
      $or: [
        { organizer: userId },
        { currentAttendees: userId }
      ]
    });

    return res.json({
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get my events error:', error);
    return res.status(500).json({ 
      error: 'Error retrieving your events',
      code: 'MY_EVENTS_RETRIEVAL_FAILED'
    });
  }
}; 