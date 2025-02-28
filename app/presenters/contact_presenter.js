class ContactPresenter {
  static present(contact) {
    return {
      id: contact.id,
      user_id: contact.user_id,
      name: contact.name,
      email: contact.email,
      phone_number: contact.phone_number,
      created_at: contact.created_at,
      updated_at: contact.updated_at
    };
  }

  static presentMany(contacts) {
    return contacts.map(contact => this.present(contact));
  }
}

module.exports = ContactPresenter;