import { ref } from "vue";

interface ConfirmRequest {
  message: string;
  resolve: (value: boolean) => void;
}

export const confirmRequest = ref<ConfirmRequest | null>(null);

export function requestConfirmation(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    confirmRequest.value = { message, resolve };
  });
}

export function resolveConfirmation(value: boolean): void {
  confirmRequest.value?.resolve(value);
  confirmRequest.value = null;
}
