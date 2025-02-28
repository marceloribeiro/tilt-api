class BrandPresenter {
  static present(brand) {
    return {
      id: brand.id,
      name: brand.name,
      created_at: brand.created_at,
      updated_at: brand.updated_at
    };
  }

  static presentMany(brands) {
    return brands.map(brand => this.present(brand));
  }
}

module.exports = BrandPresenter;