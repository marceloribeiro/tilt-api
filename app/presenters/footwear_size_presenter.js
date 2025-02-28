class FootwearSizePresenter {
  static present(size) {
    return {
      id: size.id,
      name: size.name,
      created_at: size.created_at,
      updated_at: size.updated_at
    };
  }

  static presentMany(sizes) {
    return sizes.map(size => this.present(size));
  }
}

module.exports = FootwearSizePresenter;