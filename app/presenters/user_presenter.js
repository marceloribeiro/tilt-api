class UserPresenter {
  static present(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  static presentMany(users) {
    return users.map(user => this.present(user));
  }
}

module.exports = UserPresenter;