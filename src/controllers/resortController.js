const prisma = require('../lib/prisma');

const formatResort = (resort) => {
  return {
    id: resort.id,
    name: resort.name,
    description: resort.description,
    location: resort.location,
    latitude: resort.latitude,
    longitude: resort.longitude,
    pricePerNight: resort.pricePerNight,
    amenities: resort.amenities,
    maxGuests: resort.maxGuests,
    rooms: resort.rooms,
    rating: resort.rating,
    image: resort.image,
    isActive: resort.isActive,
    createdAt: resort.createdAt,
  };
};

exports.getAllResorts = async (req, res) => {
  try {
    const { amenities, minRate, maxRate, location, search, sort, page = 1, limit = 10 } = req.query;

    const where = { isActive: true };

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (amenities) {
      const amenArray = Array.isArray(amenities) ? amenities : amenities.split(',').map(a => a.trim());
      where.amenities = { hasEvery: amenArray };
    }

    if (minRate || maxRate) {
      where.pricePerNight = {};
      if (minRate) where.pricePerNight.gte = parseFloat(minRate);
      if (maxRate) where.pricePerNight.lte = parseFloat(maxRate);
    }

    let orderBy = { createdAt: 'desc' };
    if (sort) {
      const sortFields = sort.split(',');
      orderBy = sortFields.map((field) => {
        const order = field.startsWith('-') ? 'desc' : 'asc';
        const fieldName = field.startsWith('-') ? field.substring(1) : field;
        return { [fieldName]: order };
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const resorts = await prisma.resort.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    const total = await prisma.resort.count({ where });

    res.json({
      message: 'Resorts fetched successfully',
      count: resorts.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / take),
      data: resorts.map(formatResort),
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resorts', error: error.message });
  }
};

exports.getResortById = async (req, res) => {
  try {
    const resort = await prisma.resort.findUnique({ where: { id: req.params.id } });
    if (!resort) return res.status(404).json({ message: 'Resort not found' });
    res.json({ data: formatResort(resort) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch resort' });
  }
};

exports.createResort = async (req, res) => {
  try {
    const { name, description, location, latitude, longitude, pricePerNight, amenities, maxGuests, rooms, image } = req.body;
    
    const resort = await prisma.resort.create({
      data: {
        name,
        description,
        location,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        pricePerNight: parseFloat(pricePerNight),
        amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',') : []),
        maxGuests: parseInt(maxGuests),
        rooms: parseInt(rooms),
        image,
        ownerId: req.userId,
      },
    });

    res.status(201).json({ message: 'Resort created successfully', data: formatResort(resort) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create resort', error: error.message });
  }
};

exports.updateResort = async (req, res) => {
  try {
    const resortId = req.params.id;
    const existingResort = await prisma.resort.findUnique({ where: { id: resortId } });

    if (!existingResort) return res.status(404).json({ message: 'Resort not found' });

    // Privacy check: only owner or super admin
    if (req.userRole === 'PROPERTY_OWNER' && existingResort.ownerId !== req.userId) {
      return res.status(403).json({ message: 'You can only update your own resorts' });
    }

    const data = { ...req.body };
    if (data.pricePerNight) data.pricePerNight = parseFloat(data.pricePerNight);
    if (data.maxGuests) data.maxGuests = parseInt(data.maxGuests);
    if (data.rooms) data.rooms = parseInt(data.rooms);
    if (data.latitude) data.latitude = parseFloat(data.latitude);
    if (data.longitude) data.longitude = parseFloat(data.longitude);

    const resort = await prisma.resort.update({
      where: { id: resortId },
      data,
    });

    res.json({ message: 'Resort updated successfully', data: formatResort(resort) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update resort', error: error.message });
  }
};

exports.deleteResort = async (req, res) => {
  try {
    const resortId = req.params.id;
    const existingResort = await prisma.resort.findUnique({ where: { id: resortId } });

    if (!existingResort) return res.status(404).json({ message: 'Resort not found' });

    // Privacy check: only owner or super admin
    if (req.userRole === 'PROPERTY_OWNER' && existingResort.ownerId !== req.userId) {
      return res.status(403).json({ message: 'You can only delete your own resorts' });
    }

    await prisma.resort.update({
      where: { id: resortId },
      data: { isActive: false },
    });
    res.json({ message: 'Resort deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete resort', error: error.message });
  }
};
