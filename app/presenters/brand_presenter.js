class BrandPresenter {
  static present(brand, user = null, userBrands = null) {
    return {
      id: brand.id,
      name: brand.name,
      created_at: brand.created_at,
      updated_at: brand.updated_at,
      selected: this.#isSelected(brand, user, userBrands)
    };
  }

  static async presentMany(brands, user = null) {
    if (!user) {
      return brands.map(brand => this.present(brand));
    }

    // Preload user's brands once
    const userBrands = await user.$relatedQuery('brands');
    return brands.map(brand => this.present(brand, user, userBrands));
  }

  static #isSelected(brand, user, userBrands = null) {
    if (!user) return false;

    // If userBrands is provided, use it instead of querying the database
    if (userBrands) {
      return userBrands.some(userBrand => userBrand.id === brand.id);
    }

    // Fallback to single query for individual brand presentation
    return user.$relatedQuery('brands')
      .where('brands.id', brand.id)
      .first()
      .then(result => !!result);
  }
}

module.exports = BrandPresenter;