class ItemPresenter {
  static present(item) {
    return {
      id: item.id,
      owner_id: item.owner_id,
      category_id: item.category_id,
      brand_id: item.brand_id,
      style_id: item.style_id,
      footwear_size_id: item.footwear_size_id,
      top_size_id: item.top_size_id,
      name: item.name,
      description: item.description,
      image_url: item.image_url,
      location: item.location,
      latitude: item.latitude,
      longitude: item.longitude,
      status: item.status,
      price: item.price,
      currency: item.currency,
      created_at: item.created_at,
      updated_at: item.updated_at,
      owner: item.owner ? {
        id: item.owner.id,
        name: item.owner.name,
        email: item.owner.email
      } : null,
      category: item.category ? {
        id: item.category.id,
        name: item.category.name
      } : null,
      brand: item.brand ? {
        id: item.brand.id,
        name: item.brand.name
      } : null,
      style: item.style ? {
        id: item.style.id,
        name: item.style.name
      } : null,
      footwearSize: item.footwearSize ? {
        id: item.footwearSize.id,
        name: item.footwearSize.name,
        value: item.footwearSize.value
      } : null,
      topSize: item.topSize ? {
        id: item.topSize.id,
        name: item.topSize.name,
        value: item.topSize.value
      } : null
    };
  }

  static presentMany(items) {
    return items.map(item => this.present(item));
  }
}

module.exports = ItemPresenter;