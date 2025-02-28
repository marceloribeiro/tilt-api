### Tilt API

## Models, Migrations

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
