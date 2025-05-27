# Supabase Edge Functions

This directory contains Edge Functions for your Supabase project. Edge Functions are serverless functions that run on the edge, close to your users.

## Available Functions

### `config`

A function that serves public configuration to your client applications. This is useful for managing environment variables and other configuration that needs to be available to the client.

**Endpoint**: `/.netlify/functions/config`

**Methods**:

- `GET`: Returns the public configuration

## Development

### Prerequisites

1. Install the Supabase CLI:

   ```bash
   npm install -g supabase
   ```

2. Log in to your Supabase account:

   ```bash
   supabase login
   ```

3. Link your project (if not already linked):
   ```bash
   supabase link --project-ref your-project-ref
   ```

### Local Development

1. Start the Supabase local development environment:

   ```bash
   supabase start
   ```

2. Deploy functions locally:

   ```bash
   supabase functions serve
   ```

3. Test your functions using `curl` or a tool like Postman.

### Deployment

To deploy all functions to Supabase:

```bash
npm run deploy:functions
```

Or deploy a specific function:

```bash
supabase functions deploy config
```

## Environment Variables

Set environment variables in the Supabase Dashboard under "Edge Functions" > "Settings".

## Best Practices

1. **Keep functions small and focused**: Each function should do one thing well.
2. **Use environment variables for secrets**: Never hardcode sensitive information.
3. **Implement proper error handling**: Always handle errors and provide meaningful error messages.
4. **Add CORS headers**: If your function is called from a browser, make sure to include the appropriate CORS headers.
5. **Add authentication**: If your function should only be accessible to authenticated users, implement proper authentication checks.

## Example Usage

### Client-side

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY,
);

// Call the config function
const { data, error } = await supabase.functions.invoke("config", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
});

if (error) {
  console.error("Error:", error);
} else {
  console.log("Config:", data);
}
```

### Server-side

```typescript
const response = await fetch(
  "https://your-project-ref.supabase.co/functions/v1/config",
  {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer YOUR_SUPABASE_ANON_KEY",
    },
  },
);

const data = await response.json();
console.log("Config:", data);
```

## Troubleshooting

- **Function not found**: Make sure the function is deployed and the name matches exactly.
- **CORS errors**: Ensure your function includes the appropriate CORS headers.
- **Authentication errors**: Check if the function requires authentication and that you're providing a valid JWT token if needed.
- **Check logs**: Use `supabase functions logs <function-name>` to view logs for a specific function.

For more information, refer to the [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions).
