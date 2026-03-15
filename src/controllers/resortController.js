const Resort = require('../models/Resort');

// Helper function to format resort response
const formatResort = (resort) => {
  const resortObj = resort.toObject ? resort.toObject() : resort;
  return {
    id: resortObj._id,
    _id: resortObj._id,
    name: resortObj.name,
    description: resortObj.description,
    location: resortObj.location,
    latitude: resortObj.latitude || 0,
    longitude: resortObj.longitude || 0,
    pricePerNight: resortObj.pricePerNight,
    amenities: resortObj.amenities || [],
    address: resortObj.address,
    area: resortObj.area,
    contactNumber: resortObj.contactNumber,
    maxGuests: resortObj.maxGuests,
    rooms: resortObj.rooms,
    availableRooms: resortObj.availableRooms,
    otherDetails: resortObj.otherDetails,
    rating: resortObj.rating || 0,
    image: resortObj.image,
    isActive: resortObj.isActive,
    isAvailable: resortObj.isAvailable,
    createdAt: resortObj.createdAt,
  };
};

exports.getAllResorts = async (req, res) => {
  try {
    const { amenities, minRate, maxRate, location, search, sort } = req.query;

    const filter = { isActive: true };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (amenities) {
      let amenArray = [];
      if (typeof amenities === 'string') {
        try {
          const parsed = JSON.parse(amenities);
          if (Array.isArray(parsed)) amenArray = parsed;
        } catch (e) {
          amenArray = amenities.split(',').map((a) => a.trim()).filter(Boolean);
        }
      } else if (Array.isArray(amenities)) {
        amenArray = amenities;
      }

      if (amenArray.length) {
        filter.amenities = { $all: amenArray };
      }
    }

    const { category } = req.query;
    if (category) {
      const catRegex = new RegExp(category.replace(/[^a-zA-Z0-9 ]/g, ""), 'i');
      filter.$or = [
        { amenities: { $regex: catRegex } },
        { location: { $regex: catRegex } },
        { description: { $regex: catRegex } },
        { name: { $regex: catRegex } },
        // Add specific mappings for common categories if needed
        ...(category.toLowerCase() === 'beachfront' ? [{ amenities: { $regex: /beach/i } }, { description: { $regex: /beach/i } }] : []),
        ...(category.toLowerCase() === 'mountains' ? [{ amenities: { $regex: /ski|mountain|hill|glacier|alpine/i } }, { location: { $regex: /switzerland|patagonia/i } }] : []),
        ...(category.toLowerCase() === 'amazing pools' ? [{ amenities: { $regex: /pool/i } }] : []),
        ...(category.toLowerCase() === 'luxury' ? [{ pricePerNight: { $gt: 10000 } }, { amenities: { $regex: /luxury/i } }] : [])
      ];
    }

    if (minRate || maxRate) {
      const priceFilter = {};
      if (minRate && !Number.isNaN(Number(minRate))) priceFilter.$gte = Number(minRate);
      if (maxRate && !Number.isNaN(Number(maxRate))) priceFilter.$lte = Number(maxRate);
      if (Object.keys(priceFilter).length) filter.pricePerNight = priceFilter;
    }

    // Sorting
    let sortQuery = { createdAt: -1 }; // Default
    if (sort) {
      const sortFields = sort.split(',');
      sortQuery = {};
      sortFields.forEach((field) => {
        const order = field.startsWith('-') ? -1 : 1;
        const fieldName = field.startsWith('-') ? field.substring(1) : field;
        sortQuery[fieldName] = order;
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const resorts = await Resort.find(filter).sort(sortQuery).skip(skip).limit(limit);
    const total = await Resort.countDocuments(filter);
    const formattedResorts = resorts.map(formatResort);

    res.json({
      message: 'Resorts fetched successfully',
      count: formattedResorts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: formattedResorts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resorts', error: error.message });
  }
};

exports.getResortById = async (req, res) => {
  try {
    const resort = await Resort.findById(req.params.id);
    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }
    res.json({ data: formatResort(resort) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resort', error: error.message });
  }
};

exports.createResort = async (req, res) => {
  try {
    const { 
      name, description, location, address, area, contactNumber, 
      latitude, longitude, pricePerNight, amenities, maxGuests, 
      rooms, otherDetails, image 
    } = req.body;

    if (!name || !description || !location || !address || !area || !pricePerNight || !maxGuests || !rooms) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const resort = new Resort({
      name,
      description,
      location,
      address,
      area,
      contactNumber,
      latitude: latitude || 0,
      longitude: longitude || 0,
      pricePerNight,
      amenities,
      maxGuests,
      rooms,
      availableRooms: rooms,
      otherDetails,
      image,
      owner: req.userId,
    });

    await resort.save();
    res.status(201).json({ message: 'Resort created successfully', data: formatResort(resort) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create resort', error: error.message });
  }
};

exports.updateResort = async (req, res) => {
  try {
    const resortId = req.params.id;
    const resort = await Resort.findById(resortId);

    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }

    // Ownership check
    if (req.userRole === 'resort_owner' && resort.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own resorts' });
    }

    const updatedResort = await Resort.findByIdAndUpdate(resortId, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ message: 'Resort updated successfully', data: formatResort(updatedResort) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update resort', error: error.message });
  }
};

exports.deleteResort = async (req, res) => {
  try {
    const resortId = req.params.id;
    const resort = await Resort.findById(resortId);

    if (!resort) {
      return res.status(404).json({ message: 'Resort not found' });
    }

    // Ownership check
    if (req.userRole === 'resort_owner' && resort.owner.toString() !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own resorts' });
    }

    resort.isActive = false;
    await resort.save();

    res.json({ message: 'Resort deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resort', error: error.message });
  }
};
