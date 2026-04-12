## Local Development

Frontend default URL:

- `http://localhost:3000`

Backend default API URL:

- `http://localhost:5001`

Before running the frontend, copy the example env file:

```bash
cp .env.local.example .env.local
```

The default `NEXT_PUBLIC_API_URL` in the example file already points to `http://localhost:5001`.

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
