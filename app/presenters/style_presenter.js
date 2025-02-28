class StylePresenter {
  static present(style, user = null, userStyles = null) {
    return {
      id: style.id,
      name: style.name,
      created_at: style.created_at,
      updated_at: style.updated_at,
      selected: this.#isSelected(style, user, userStyles)
    };
  }

  static async presentMany(styles, user = null) {
    if (!user) {
      return styles.map(style => this.present(style));
    }

    const userStyles = await user.$relatedQuery('styles');
    return styles.map(style => this.present(style, user, userStyles));
  }

  static #isSelected(style, user, userStyles = null) {
    if (!user) return false;

    if (userStyles) {
      return userStyles.some(userStyle => userStyle.id === style.id);
    }

    return user.$relatedQuery('styles')
      .where('styles.id', style.id)
      .first()
      .then(result => !!result);
  }
}

module.exports = StylePresenter;