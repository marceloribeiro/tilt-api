class StylePresenter {
  static present(style) {
    return {
      id: style.id,
      name: style.name,
      created_at: style.created_at,
      updated_at: style.updated_at
    };
  }

  static presentMany(styles) {
    return styles.map(style => this.present(style));
  }
}

module.exports = StylePresenter;