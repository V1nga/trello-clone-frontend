<template>
  <VContainer>
    <div class="header-bar">
      <h1 class="page-title">Мои доски</h1>
      <VBtn color="primary" prepend-icon="mdi-plus" @click="dialogOpen = true">Создать доску</VBtn>
    </div>

    <VAlert v-if="errorMessage" class="section-alert" type="error" density="compact">
      {{ errorMessage }}
    </VAlert>

    <VRow v-if="myBoards.length">
      <VCol v-for="board in myBoards" :key="board.id" cols="12" sm="6" md="4">
        <VCard rounded="lg" class="board-card" :to="{ name: ROUTE_NAMES.boardDetail, params: { id: board.id } }">
          <VCardTitle class="board-card-title">
            <span class="board-card-name">{{ board.name }}</span>
            <div v-if="isOwnerOf(board)" class="board-card-actions">
              <VBtn icon variant="text" size="x-small" @click.stop.prevent="openEditDialog(board)">
                <VIcon icon="mdi-pencil-outline" size="18" />
              </VBtn>
              <VBtn icon variant="text" size="x-small" @click.stop.prevent="handleDelete(board)">
                <VIcon icon="mdi-delete-outline" size="18" />
              </VBtn>
            </div>
          </VCardTitle>
          <VCardText>{{ board.description || "Без описания" }}</VCardText>
        </VCard>
      </VCol>
    </VRow>
    <VAlert
      v-else-if="!loading && !myBoards.length"
      color="primary"
      variant="tonal"
      icon="mdi-information"
    >
      У вас пока нет досок. Создайте первую.
    </VAlert>

    <template v-if="guestBoards.length">
      <div class="header-bar section-header-bar">
        <h2 class="page-title">Гостевые доски</h2>
      </div>
      <VRow>
        <VCol v-for="board in guestBoards" :key="board.id" cols="12" sm="6" md="4">
          <VCard rounded="lg" class="board-card" :to="{ name: ROUTE_NAMES.boardDetail, params: { id: board.id } }">
            <VCardTitle class="board-card-title">
              <span class="board-card-name">{{ board.name }}</span>
            </VCardTitle>
            <VCardText>{{ board.description || "Без описания" }}</VCardText>
          </VCard>
        </VCol>
      </VRow>
    </template>

    <FormDialog
      v-model="dialogOpen"
      title="Новая доска"
      submit-label="Создать"
      :loading="creating"
      :error="createError"
      @submit="handleCreate"
    >
      <VTextField
        v-model="name"
        label="Название"
        variant="outlined"
        density="comfortable"
        hide-details
        required
        autocomplete="off"
      />
      <VTextarea
        v-model="description"
        label="Описание"
        variant="outlined"
        hide-details
        rows="3"
        autocomplete="off"
      />
    </FormDialog>

    <FormDialog
      v-model="editDialogOpen"
      title="Редактировать доску"
      submit-label="Сохранить"
      :loading="editSaving"
      :error="editError"
      @submit="handleSaveEdit"
    >
      <VTextField
        v-model="editName"
        label="Название"
        variant="outlined"
        density="comfortable"
        hide-details
        required
        autocomplete="off"
      />
      <VTextarea
        v-model="editDescription"
        label="Описание"
        variant="outlined"
        hide-details
        rows="3"
        autocomplete="off"
      />
    </FormDialog>
  </VContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { boardsClient } from "@/api";
import { useAuthStore } from "@/stores/auth";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import { useAsyncForm } from "@/composables/useAsyncForm";
import { useConfirmAction } from "@/composables/useConfirmAction";
import { ROUTE_NAMES } from "@/router/routeNames";
import type { Board } from "@/types/models";

const authStore = useAuthStore();

const boards = ref<Board[]>([]);
const loading = ref(false);
const errorMessage = ref("");

const myBoards = computed(() => boards.value.filter((board) => isOwnerOf(board)));
const guestBoards = computed(() => boards.value.filter((board) => !isOwnerOf(board)));

const dialogOpen = ref(false);
const name = ref("");
const description = ref("");
const { loading: creating, error: createError, run: runCreate } = useAsyncForm("Не удалось создать доску");

const editDialogOpen = ref(false);
const editBoardId = ref<string | null>(null);
const editName = ref("");
const editDescription = ref("");
const { loading: editSaving, error: editError, run: runSaveEdit } = useAsyncForm("Не удалось сохранить изменения");

const { confirmAction } = useConfirmAction();

function isOwnerOf(board: Board): boolean {
  return Boolean(authStore.user && board.ownerId === authStore.user.id);
}

async function loadBoards(): Promise<void> {
  loading.value = true;
  errorMessage.value = "";
  try {
    const page = await boardsClient.list();
    boards.value = page.content;
  } catch {
    errorMessage.value = "Не удалось загрузить доски";
  } finally {
    loading.value = false;
  }
}

async function handleCreate(): Promise<void> {
  if (!name.value.trim()) {
    return;
  }
  const ok = await runCreate(async () => {
    await boardsClient.create({ name: name.value, description: description.value });
    dialogOpen.value = false;
    name.value = "";
    description.value = "";
  });
  if (ok) {
    await loadBoards();
  }
}

function openEditDialog(board: Board): void {
  editBoardId.value = board.id;
  editName.value = board.name;
  editDescription.value = board.description || "";
  editDialogOpen.value = true;
}

async function handleSaveEdit(): Promise<void> {
  if (!editBoardId.value || !editName.value.trim()) {
    return;
  }
  const ok = await runSaveEdit(async () => {
    await boardsClient.update(editBoardId.value as string, {
      name: editName.value,
      description: editDescription.value,
    });
    editDialogOpen.value = false;
  });
  if (ok) {
    await loadBoards();
  }
}

async function handleDelete(board: Board): Promise<void> {
  await confirmAction(`Удалить доску "${board.name}" без возможности восстановления?`, async () => {
    await boardsClient.remove(board.id);
    await loadBoards();
  });
}

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile();
  }
  await loadBoards();
});
</script>

<style scoped lang="scss">
@import "./styles";
</style>
