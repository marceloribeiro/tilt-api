### Tilt API

## Quick start

```
git clone git@github.com:marceloribeiro/tilt-api.git
cd tilt-api
cp .env.sample .env
npm install
npx knex migrate:latest
npx knex seed:run
npm run dev
```

API Documentation is available at [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Models, Migrations, and Seeds

### Migrations

You can create a new migration by running:

```bash
npx knex migrate:make migration_name
```

This command uses `knex` to generate a new migration file. Replace `migration_name` with a descriptive name for your migration using snake_case format (e.g., `add_user_to_projects`, `create_products`, etc.). The command will create a new migration file in your configured migrations directory with a timestamp prefix.

The migration file will contain the basic structure:
```js
exports.up = function(knex) {
  // Changes to apply
};

exports.down = function(knex) {
  // How to reverse the changes
};
```

Then you should be able to run the command to migrate and add the table to the db:

```bash
npx knex migrate:latest
```

To rollback migrations, you can use:
```bash
npx knex migrate:rollback
```

This adds the two most common migration commands:
- `migrate:latest` runs all pending migrations up to the latest version
- `migrate:rollback` reverts the most recent migration batch

These commands will execute the code in the `up()` and `down()` functions respectively in your migration files.

### Seeds

Seed files allow you to populate your database with test or default data.

#### Seed Commands

Create a new seed file:
```bash
npx knex seed:make seed_name
# Example: npx knex seed:make 001_categories
```

Run all seed files:
```bash
npx knex seed:run
```

Run a specific seed file:
```bash
npx knex seed:run --specific=001_categories.js
```

#### Development Scripts

Add these to your package.json for convenience:
```json
{
  "scripts": {
    "db:seed": "knex seed:run",
    "db:seed:make": "knex seed:make",
    "db:reset": "knex migrate:rollback --all && knex migrate:latest && knex seed:run"
  }
}
```

#### Example Seed Files

```javascript:seeds/001_categories.js
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('categories').del();

  // Inserts seed entries
  await knex('categories').insert([
    { name: 'Sneakers' },
    { name: 'Running' },
    { name: 'Basketball' },
    { name: 'Casual' }
  ]);
};
```

```javascript:seeds/002_brands.js
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('brands').del();

  // Inserts seed entries
  await knex('brands').insert([
    { name: 'Nike' },
    { name: 'Adidas' },
    { name: 'Puma' },
    { name: 'New Balance' }
  ]);
};
```

## Running tests

1. Running a single test file

```
npm test -- tests/routes/auth.test.js
```

2. Running a single test within the file

```
npm test -- tests/routes/auth.test.js -t "should send confirmation code to valid phone number"
```