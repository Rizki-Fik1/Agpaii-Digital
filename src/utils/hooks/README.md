# Custom Hooks - Data Caching

## useCachedData

Hook untuk caching data dan mencegah re-fetch saat user back navigation.

### Penggunaan Dasar

```tsx
import { useCachedData } from "@/utils/hooks/useDataCache";
import axios from "axios";

function MyPage() {
  const { data, isLoading, error, refetch } = useCachedData({
    fetchFn: async () => {
      const response = await axios.get("/api/data");
      return response.data;
    },
    cacheKey: "my-data", // optional, untuk multiple cache
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Render your data */}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Contoh dengan Dependencies

```tsx
const { data, isLoading } = useCachedData({
  fetchFn: async () => {
    const response = await axios.get(`/api/data/${userId}`);
    return response.data;
  },
  cacheKey: `user-${userId}`,
  dependencies: [userId], // refetch when userId changes
});
```

### Fitur

- ✅ Automatic caching - data disimpan setelah fetch pertama
- ✅ No re-fetch on back - saat user back, data langsung muncul dari cache
- ✅ Manual refetch - bisa force refresh dengan `refetch()`
- ✅ Multiple cache keys - bisa cache berbeda untuk data berbeda
- ✅ TypeScript support - full type safety
