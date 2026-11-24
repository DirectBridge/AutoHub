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

const SORTS = {
  newest: [['created_at', false], ['id', true]],
  price_asc: [['price', true], ['created_at', false], ['id', true]],
  price_desc: [['price', false], ['created_at', false], ['id', true]],
  mileage_asc: [['mileage', true], ['created_at', false], ['id', true]],
  year_desc: [['year', false], ['created_at', false], ['id', true]],
};

const SORT_ALIASES = { price: 'price_asc', mileage: 'mileage_asc', year: 'year_desc' };
const BODY_TYPES = ['sedan', 'suv', 'hatchback', 'coupe', 'truck', 'van', 'convertible'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid'];
const TRANSMISSIONS = ['manual', 'automatic'];

function values(value, allowed) {
  if (!value) return [];
  return String(value).split(',').map((item) => item.trim().toLowerCase()).filter((item) => allowed.includes(item));
}

function numberParam(query, ...keys) {
  for (const key of keys) {
    if (query[key] === undefined || query[key] === '') continue;
    const value = Number(query[key]);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return undefined;
}

function safeSearchTerm(value) {
  return String(value || '').trim().replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ');
}

/** GET /api/listings — active listings for the homepage and searchable results page. */
async function getListings(req, res) {
  try {
    const { query: params } = req;
    const requestedLimit = Number(params.limit);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
      ? Math.min(Math.floor(requestedLimit), 100)
      : 8;
    const pageValue = Number(params.page);
    const page = Number.isFinite(pageValue) && pageValue > 0 ? Math.floor(pageValue) : 1;
    const firstRow = (page - 1) * limit;
    const lastRow = firstRow + limit - 1;
    const type = String(params.type || params.purpose || '').toLowerCase();
    const requestedSort = SORT_ALIASES[params.sort] || params.sort;
    const priceColumn = type === 'rent' ? 'rental_price_daily' : 'price';
    const sort = (SORTS[requestedSort] || SORTS.newest).map(([column, ascending]) => [
      column === 'price' ? priceColumn : column,
      ascending,
    ]);

    let query = supabase
      .from('listings')
      .select(`
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
      `, { count: 'exact' })
      .eq('status', 'active')
      .range(firstRow, lastRow);

    for (const [column, ascending] of sort) {
      query = query.order(column, { ascending, nullsFirst: false });
    }

    if (type === 'sale' || type === 'buy') query = query.eq('type', 'sale');
    else if (type === 'rent') query = query.eq('type', 'rent');


    const term = safeSearchTerm(params.q ?? params.search);
    if (term) {
      const pattern = `%${term}%`;
      query = query.or([
        `make.ilike.${pattern}`,
        `model.ilike.${pattern}`,
        `title.ilike.${pattern}`,
        `description.ilike.${pattern}`,
      ].join(','));
    }

    for (const [column, key] of [['make', 'make'], ['model', 'model'], ['location', 'location']]) {
      if (params[key]) query = query.ilike(column, `%${safeSearchTerm(params[key])}%`);
    }

    const minPrice = numberParam(params, 'minPrice', 'priceMin');
    const maxPrice = numberParam(params, 'maxPrice', 'priceMax');
    const minYear = numberParam(params, 'minYear', 'yearMin');
    const maxYear = numberParam(params, 'maxYear', 'yearMax');
    const maxMileage = numberParam(params, 'maxMileage', 'mileageMax');
    if (minPrice !== undefined) query = query.gte(priceColumn, minPrice);
    if (maxPrice !== undefined) query = query.lte(priceColumn, maxPrice);
    if (minYear !== undefined) query = query.gte('year', minYear);
    if (maxYear !== undefined) query = query.lte('year', maxYear);
    if (maxMileage !== undefined) query = query.lte('mileage', maxMileage);

    const bodyTypes = values(params.bodyType ?? params.body, BODY_TYPES);
    const fuelTypes = values(params.fuelType ?? params.fuel, FUEL_TYPES);
    const transmissions = values(params.transmission, TRANSMISSIONS);
    if (bodyTypes.length === 1) query = query.eq('body_type', bodyTypes[0]);
    else if (bodyTypes.length > 1) query = query.in('body_type', bodyTypes);
    if (fuelTypes.length === 1) query = query.eq('fuel_type', fuelTypes[0]);
    else if (fuelTypes.length > 1) query = query.in('fuel_type', fuelTypes);
    if (transmissions.length === 1) query = query.eq('transmission', transmissions[0]);
    else if (transmissions.length > 1) query = query.in('transmission', transmissions);

    if (params.color) {
      const colors = String(params.color).split(',').map((color) => color.trim()).filter(Boolean);
      if (colors.length === 1) query = query.ilike('color', colors[0]);
      else if (colors.length > 1) query = query.in('color', colors);
    }
    if (params.verified === 'true') query = query.eq('seller.is_verified', true);

    const { data, error, count } = await query;

    const term = safeSearchTerm(params.q ?? params.search);
    if (term) {
      const pattern = `%${term}%`;
      query = query.or([
        `make.ilike.${pattern}`,
        `model.ilike.${pattern}`,
        `title.ilike.${pattern}`,
        `description.ilike.${pattern}`,
      ].join(','));
    }

    for (const [column, key] of [['make', 'make'], ['model', 'model'], ['location', 'location']]) {
      if (params[key]) query = query.ilike(column, `%${safeSearchTerm(params[key])}%`);
    }

    const minPrice = numberParam(params, 'minPrice', 'priceMin');
    const maxPrice = numberParam(params, 'maxPrice', 'priceMax');
    const minYear = numberParam(params, 'minYear', 'yearMin');
    const maxYear = numberParam(params, 'maxYear', 'yearMax');
    const maxMileage = numberParam(params, 'maxMileage', 'mileageMax');
    if (minPrice !== undefined) query = query.gte(priceColumn, minPrice);
    if (maxPrice !== undefined) query = query.lte(priceColumn, maxPrice);
    if (minYear !== undefined) query = query.gte('year', minYear);
    if (maxYear !== undefined) query = query.lte('year', maxYear);
    if (maxMileage !== undefined) query = query.lte('mileage', maxMileage);

    const bodyTypes = values(params.bodyType ?? params.body, BODY_TYPES);
    const fuelTypes = values(params.fuelType ?? params.fuel, FUEL_TYPES);
    const transmissions = values(params.transmission, TRANSMISSIONS);
    if (bodyTypes.length === 1) query = query.eq('body_type', bodyTypes[0]);
    else if (bodyTypes.length > 1) query = query.in('body_type', bodyTypes);
    if (fuelTypes.length === 1) query = query.eq('fuel_type', fuelTypes[0]);
    else if (fuelTypes.length > 1) query = query.in('fuel_type', fuelTypes);
    if (transmissions.length === 1) query = query.eq('transmission', transmissions[0]);
    else if (transmissions.length > 1) query = query.in('transmission', transmissions);

    if (params.color) {
      const colors = String(params.color).split(',').map((color) => color.trim()).filter(Boolean);
      if (colors.length === 1) query = query.ilike('color', colors[0]);
      else if (colors.length > 1) query = query.in('color', colors);
    }
    if (params.verified === 'true') query = query.eq('seller.is_verified', true);

    const { data, error, count } = await query;

    if (error) {
      return res.status(500).json({
        error: error.message,
        code: error.code,
        hint: error.hint,
      });
    }

    return res.json({ listings: (data || []).map(mapListingRow), total: count || 0, page, limit });
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
