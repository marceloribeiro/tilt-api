class CategoryPresenter {
  static present(category, user = null, userCategories = null) {
    return {
      id: category.id,
      name: category.name,
      created_at: category.created_at,
      updated_at: category.updated_at,
      selected: this.#isSelected(category, user, userCategories)
    };
  }

  static async presentMany(categories, user = null) {
    if (!user) {
      return categories.map(category => this.present(category));
    }

    const userCategories = await user.$relatedQuery('categories');
    return categories.map(category => this.present(category, user, userCategories));
  }

  static #isSelected(category, user, userCategories = null) {
    if (!user) return false;

    if (userCategories) {
      return userCategories.some(userCategory => userCategory.id === category.id);
    }

    return user.$relatedQuery('categories')
      .where('categories.id', category.id)
      .first()
      .then(result => !!result);
  }
}

module.exports = CategoryPresenter;