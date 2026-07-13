import { ref } from "vue";
import axios from "axios";

export function useAsyncForm(fallbackMessage: string) {
  const loading = ref(false);
  const error = ref("");

  async function run(action: () => Promise<void>): Promise<boolean> {
    error.value = "";
    loading.value = true;
    try {
      await action();
      return true;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        error.value = err.response.data.message;
      } else {
        error.value = fallbackMessage;
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  return { loading, error, run };
}
