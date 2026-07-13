import { requestConfirmation } from "./confirmDialogState";

export function useConfirmAction() {
  async function confirmAction(message: string, action: () => Promise<void>): Promise<void> {
    const confirmed = await requestConfirmation(message);
    if (!confirmed) {
      return;
    }
    await action();
  }

  return { confirmAction };
}
