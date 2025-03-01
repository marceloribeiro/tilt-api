class TopSizePresenter {
  static present(topSize) {
    if (!topSize) return null;

    return {
      id: topSize.id,
      name: topSize.name,
      created_at: topSize.created_at,
      updated_at: topSize.updated_at
    };
  }

  static presentMany(topSizes) {
    if (!topSizes) return [];
    return topSizes.map(this.present);
  }
}

module.exports = TopSizePresenter;