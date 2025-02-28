class UserPresenter {
  static present(user) {
    return {
      id: user.id,
      phone_number: user.phone_number,
      user_name: user.user_name,
      first_name: user.first_name,
      last_name: user.last_name,
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