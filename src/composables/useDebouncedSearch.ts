import { onUnmounted, ref, watch } from "vue";

export function useDebouncedSearch<T>(
  search: (query: string) => Promise<T[]>,
  options: { minLength?: number; delay?: number } = {},
) {
  const minLength = options.minLength ?? 1;
  const delay = options.delay ?? 300;

  const query = ref("");
  const results = ref<T[]>([]);
  const loading = ref(false);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let requestToken = 0;

  async function runSearch(value: string): Promise<void> {
    const token = ++requestToken;
    loading.value = true;
    try {
      const found = await search(value);
      if (token === requestToken) {
        results.value = found;
      }
    } catch {
      if (token === requestToken) {
        results.value = [];
      }
    } finally {
      if (token === requestToken) {
        loading.value = false;
      }
    }
  }

  watch(query, (value) => {
    if (timer) {
      clearTimeout(timer);
    }
    const trimmed = value.trim();
    if (trimmed.length < minLength) {
      requestToken += 1;
      results.value = [];
      loading.value = false;
      return;
    }
    loading.value = true;
    timer = setTimeout(() => runSearch(trimmed), delay);
  });

  function reset(): void {
    if (timer) {
      clearTimeout(timer);
    }
    requestToken += 1;
    query.value = "";
    results.value = [];
    loading.value = false;
  }

  onUnmounted(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });

  return { query, results, loading, reset };
}
