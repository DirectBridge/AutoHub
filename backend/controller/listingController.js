const supabase = require('../config/supabase');

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85';

const LISTING_SELECT = `
  id,
  seller_id,
  title,
  type,
  make,
  model,
  year,
  mileage,
  price,
  rental_price_daily,
  rental_price_weekly,
  rental_price_monthly,
  fuel_type,
  transmission,
  body_type,
  color,
  description,
  images,
  features,
  status,
  views,
  location,
  created_at,
  updated_at,
  seller:profiles!listings_seller_id_fkey (
    id,
    first_name,
    last_name,
    avatar_url,
    is_verified,
    created_at
  )
`;

function mapListingRow(row) {
  const seller = row.seller;
  const lastInitial = seller?.last_name ? `${seller.last_name.charAt(0)}.` : '';
  const sellerName = seller ? `${seller.first_name} ${lastInitial}`.trim() : 'AutoHub Seller';

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    make: row.make,
    model: row.model,
    year: row.year,
    mileage: row.mileage,
    price: Number(row.price ?? 0),
    rentalPrice: {
      daily: Number(row.rental_price_daily ?? 0),
      weekly: Number(row.rental_price_weekly ?? 0),
      monthly: Number(row.rental_price_monthly ?? 0),
    },
    fuelType: row.fuel_type,
    transmission: row.transmission,
    bodyType: row.body_type,
    color: row.color || 'N/A',
    description: row.description || '',
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [FALLBACK_IMAGE],
    features: Array.isArray(row.features) ? row.features : [],
    location: row.location || 'Algeria',
    status: row.status,
    views: Number(row.views ?? 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    seller: {
      id: seller?.id ?? row.seller_id,
      name: sellerName,
      avatar: seller?.avatar_url || undefined,
      isVerified: Boolean(seller?.is_verified),
      memberSince: seller?.created_at ?? row.created_at,
    },
  };
}

/**
 * GET /api/listings
 * Fetches active vehicle listings for the homepage (supports ?type=sale|rent and ?limit=8).
 */
async function getListings(req, res) {
  try {
    const { type } = req.query;
    const rawLimit = Number(req.query.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 24) : 8;

    let query = supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (type === 'sale' || type === 'rent') {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        error: error.message,
        code: error.code,
        hint: error.hint,
      });
    }

    return res.json({ listings: (data || []).map(mapListingRow) });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch listings' });
  }
}

/**
 * GET /api/listings/:id
 * Fetches full details for a single listing, its seller's active listing count, and similar cars.
 */
async function getListingById(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('listings')
      .select(LISTING_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      if (error.code === '22P02') {
        return res.status(404).json({ error: 'Listing not found' });
      }
      return res.status(500).json({
        error: error.message,
        code: error.code,
        hint: error.hint,
      });
    }

    if (!data) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const [{ count: sellerActiveCount }, { data: similarRows }] = await Promise.all([
      supabase
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('seller_id', data.seller_id)
        .eq('status', 'active'),
      supabase
        .from('listings')
        .select(LISTING_SELECT)
        .eq('status', 'active')
        .eq('type', data.type)
        .neq('id', data.id)
        .order('created_at', { ascending: false })
        .limit(8),
    ]);

    return res.json({
      listing: mapListingRow(data),
      sellerActiveCount: sellerActiveCount ?? 0,
      similar: (similarRows || []).map(mapListingRow),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to fetch listing details' });
  }
}

module.exports = { getListings, getListingById };
