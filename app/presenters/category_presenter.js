class CategoryPresenter {
  static present(category) {
    return {
      id: category.id,
      name: category.name,
      created_at: category.created_at,
      updated_at: category.updated_at
    };
  }

  static presentMany(categories) {
    return categories.map(category => this.present(category));
  }
}

module.exports = CategoryPresenter;