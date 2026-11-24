const supabase = require('../config/supabase');

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85';

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
    color: row.color,
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : [FALLBACK_IMAGE],
    location: row.location || 'Algeria',
    status: row.status,
    createdAt: row.created_at,
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
      .select(
        `
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
        images,
        location,
        status,
        created_at,
        seller:profiles!listings_seller_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          is_verified,
          created_at
        )
      `
      )
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

module.exports = { getListings };