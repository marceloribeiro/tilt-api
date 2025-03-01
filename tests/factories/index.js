const UserFactory = require('./user.factory');
const ContactFactory = require('./contact.factory');
const BrandFactory = require('./brand.factory');
const FootwearSizeFactory = require('./footwear_size.factory');
const TopSizeFactory = require('./top_size.factory');
const StyleFactory = require('./style.factory');
const CategoryFactory = require('./category.factory');

class Factory {
  static UserFactory = UserFactory;
  static ContactFactory = ContactFactory;
  static BrandFactory = BrandFactory;
  static FootwearSizeFactory = FootwearSizeFactory;
  static TopSizeFactory = TopSizeFactory;
  static StyleFactory = StyleFactory;
  static CategoryFactory = CategoryFactory;
}

module.exports = Factory;