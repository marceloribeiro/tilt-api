class TopSizePresenter {
  static present(size, user = null, userSizes = null) {
    return {
      id: size.id,
      name: size.name,
      created_at: size.created_at,
      updated_at: size.updated_at,
      selected: this.#isSelected(size, user, userSizes)
    };
  }

  static async presentMany(sizes, user = null) {
    if (!user) {
      return sizes.map(size => this.present(size));
    }

    const userSizes = await user.$relatedQuery('topSizes');
    return sizes.map(size => this.present(size, user, userSizes));
  }

  static #isSelected(size, user, userSizes = null) {
    if (!user) return false;

    if (userSizes) {
      return userSizes.some(userSize => userSize.id === size.id);
    }

    return user.$relatedQuery('topSizes')
      .where('top_sizes.id', size.id)
      .first()
      .then(result => !!result);
  }
}

module.exports = TopSizePresenter;