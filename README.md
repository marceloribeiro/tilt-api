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

## Authentication

### Login with Phone Number

To authenticate using a phone number:

```javascript
// React example
const login = async () => {
  try {
    const response = await fetch('http://your-api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: '1234567890',
        confirmation_code: '123456'
      })
    });

    const data = await response.json();
    if (data.error) {
      console.error(data.error);
      return;
    }

    // Store the token in localStorage or your state management solution
    localStorage.setItem('token', data.token);

    // You can also store the user data
    setUser(data.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Making Authenticated Requests

Once you have a token, include it in subsequent requests:

```javascript
// React example using axios
import axios from 'axios';

const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://your-api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    setUserProfile(response.data.user);
  } catch (error) {
    if (error.response?.status === 401) {
      // Handle unauthorized access - maybe redirect to login
    }
    console.error('Failed to fetch profile:', error);
  }
};
```

### Example React Hook for Authentication

```javascript
// useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://your-api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone_number, confirmation_code) => {
    // Implementation of login logic
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://your-api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear token from storage
      localStorage.removeItem('token');

      // Update application state (e.g., clear user data)
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return { user, loading, login, logout };
};
```

### Usage in React Components

```javascript
function App() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {user ? (
        <>
          <h1>Welcome, {user.name}</h1>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <LoginForm onSubmit={login} />
      )}
    </div>
  );
}
```

Note: You'll need to:
1. Install the `jsonwebtoken` package: `npm install jsonwebtoken`
2. Add a `jti` column to your users table if it doesn't exist
3. Set up a secure `JWT_SECRET` in your environment variables
4. Update your User model to include the `jti` field in the schema

### Logout

To logout and invalidate the current token:

```javascript
// React example
const logout = async () => {
  try {
    const token = localStorage.getItem('token');
    await fetch('http://your-api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Clear token from storage
    localStorage.removeItem('token');

    // Update application state (e.g., clear user data)
    setUser(null);
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```



