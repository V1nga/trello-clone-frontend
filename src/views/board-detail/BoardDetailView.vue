<template>
  <VContainer v-if="board" class="board-detail-container">
    <div class="board-bar">
      <div class="board-bar-info">
        <h1 class="board-title">{{ isArchiveView ? `Архив: ${board.name}` : board.name }}</h1>
        <p class="board-description">{{ board.description || "Без описания" }}</p>
      </div>

      <div class="board-bar-actions">
        <div class="members-row">
          <VMenu
            v-for="member in members"
            :key="member.userId"
            location="bottom end"
            :close-on-content-click="false"
          >
            <template #activator="{ props: menuProps }">
              <VBadge
                class="member-badge"
                :model-value="member.role === 'OWNER'"
                icon="mdi-crown"
                color="warning"
                location="top start"
                offset-x="6"
                offset-y="6"
                overlap
                bordered
              >
                <UserAvatar
                  v-bind="menuProps"
                  :name="member.displayName"
                  class="member-avatar"
                  size="36"
                  initials-size="13px"
                />
              </VBadge>
            </template>
            <VCard class="member-card" min-width="299">
              <VCardText>
                <div class="member-name">{{ member.displayName }}</div>
                <div class="member-email">{{ member.email }}</div>
                <div class="member-role-row">
                  <VChip v-if="member.role === 'OWNER'" color="primary" size="small">{{ BOARD_ROLE_LABELS.OWNER }}</VChip>
                  <template v-else>
                    <VSelect
                      v-if="isOwner"
                      class="role-select"
                      :model-value="member.role"
                      :items="INVITABLE_ROLE_OPTIONS"
                      density="compact"
                      hide-details
                      @update:model-value="(role: BoardRole) => handleRoleChange(member, role)"
                    />
                    <VChip v-else size="small">{{ BOARD_ROLE_LABELS[member.role] }}</VChip>
                    <VBtn
                      v-if="isOwner"
                      icon="mdi-close"
                      variant="text"
                      size="small"
                      @click="handleRemoveMember(member)"
                    />
                  </template>
                </div>
              </VCardText>
            </VCard>
          </VMenu>

          <VBtn
            v-if="isOwner"
            icon="mdi-plus"
            size="36"
            variant="tonal"
            color="primary"
            class="invite-avatar"
            @click="inviteDialogOpen = true"
          />
        </div>

        <VBtn
          :icon="isArchiveView ? 'mdi-arrow-left' : 'mdi-archive-outline'"
          variant="text"
          @click="toggleArchiveView"
        />

        <VMenu v-if="isOwner" location="bottom end" :offset="8">
          <template #activator="{ props: menuProps }">
            <VBtn v-bind="menuProps" icon="mdi-dots-vertical" variant="text" />
          </template>
          <VList density="compact" class="board-menu-list">
            <VListItem
              title="Редактировать"
              prepend-icon="mdi-pencil-outline"
              class="board-menu-item"
              @click="openEditDialog"
            />
            <VListItem
              title="Удалить доску"
              prepend-icon="mdi-delete-outline"
              base-color="error"
              class="board-menu-item"
              @click="handleDeleteBoard"
            />
          </VList>
        </VMenu>
      </div>
    </div>

    <VAlert v-if="membersError" class="members-error" type="error" density="compact">
      {{ membersError }}
    </VAlert>

    <RouterView v-slot="{ Component }">
      <component
        :is="Component"
        :board-id="boardId"
        :can-edit="canEdit"
        :cards-refresh-token="cardsRefreshToken"
        @open-card="openCard"
      />
    </RouterView>

    <CardDetailDialog
      v-model="cardDialogOpen"
      :card-id="selectedCardId"
      :board-id="boardId"
      :can-edit="canEdit && !isArchiveView"
      :board-members="members"
      @changed="handleCardChanged"
    />

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

    <FormDialog
      v-model="inviteDialogOpen"
      title="Пригласить участника"
      submit-label="Пригласить"
      :loading="inviting"
      :error="inviteError"
      @submit="handleInvite"
    >
      <VAutocomplete
        v-if="!selectedInviteUser"
        v-model="selectedInviteUserId"
        v-model:search="userSearch.query.value"
        :menu="inviteMenuOpen"
        :items="userSearch.results.value"
        :loading="userSearch.loading.value"
        item-title="displayName"
        item-value="id"
        label="Участник"
        placeholder="Введите email или имя"
        variant="outlined"
        density="comfortable"
        hide-details
        no-filter
        menu-icon=""
        prepend-inner-icon="mdi-magnify"
        required
        autocomplete="off"
        class="invite-user-search"
        :menu-props="{ contentClass: 'invite-user-menu' }"
        @update:model-value="handleSelectInviteUser"
        @update:menu="handleInviteMenuUpdate"
      >
        <template #item="{ props: itemProps, item }">
          <VListItem v-bind="itemProps" :title="userOf(item).displayName">
            <template #prepend>
              <UserAvatar :name="userOf(item).displayName" size="28" />
            </template>
            <template #subtitle>{{ userOf(item).email }}</template>
          </VListItem>
        </template>
        <template #no-data>
          <VListItem v-if="userSearch.loading.value" title="Идёт поиск..." />
          <VListItem v-else title="Пользователи не найдены" />
        </template>
      </VAutocomplete>
      <VCard v-else variant="outlined" class="invite-selected-card">
        <UserAvatar :name="selectedInviteUser.displayName" size="32" initials-size="12px" />
        <div class="invite-selected-card-info">
          <div class="invite-selected-card-name">{{ selectedInviteUser.displayName }}</div>
          <div class="invite-selected-card-email">{{ selectedInviteUser.email }}</div>
        </div>
        <VBtn
          icon="mdi-close"
          variant="text"
          density="compact"
          size="small"
          class="invite-selected-card-close"
          @click="clearSelectedInviteUser"
        />
      </VCard>
      <VSelect
        v-model="inviteRole"
        :items="INVITABLE_ROLE_OPTIONS"
        label="Роль"
        variant="outlined"
        density="comfortable"
        hide-details
      />
    </FormDialog>
  </VContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { boardsClient, usersClient } from "@/api";
import { useAuthStore } from "@/stores/auth";
import { useBoardContextStore } from "@/stores/boardContext";
import { useDebouncedSearch } from "@/composables/useDebouncedSearch";
import CardDetailDialog from "@/components/card-detail-dialog/CardDetailDialog.vue";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import { useAsyncForm } from "@/composables/useAsyncForm";
import { useConfirmAction } from "@/composables/useConfirmAction";
import { ROUTE_NAMES } from "@/router/routeNames";
import { BOARD_ROLE_LABELS, INVITABLE_ROLE_OPTIONS } from "@/constants/boardRoles";
import type { Board, BoardMember, BoardRole, User } from "@/types/models";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const boardContextStore = useBoardContextStore();

const boardId = computed(() => route.params.id as string);
const isArchiveView = computed(() => route.name === ROUTE_NAMES.boardArchive);

function toggleArchiveView(): void {
  if (isArchiveView.value) {
    router.push({ name: ROUTE_NAMES.boardDetail, params: { id: boardId.value } });
  } else {
    router.push({ name: ROUTE_NAMES.boardArchive, params: { id: boardId.value } });
  }
}

const board = ref<Board | null>(null);
const members = ref<BoardMember[]>([]);
const membersError = ref("");

const isOwner = computed(() => Boolean(board.value && authStore.user && board.value.ownerId === authStore.user.id));
const canEdit = computed(() => {
  if (isOwner.value) {
    return true;
  }
  const self = members.value.find((member) => member.userId === authStore.user?.id);
  return self?.role === "EDITOR";
});

async function loadBoard(): Promise<void> {
  board.value = await boardsClient.get(boardId.value);
}

async function loadMembers(): Promise<void> {
  membersError.value = "";
  try {
    members.value = await boardsClient.listMembers(boardId.value);
  } catch {
    membersError.value = "Не удалось загрузить участников";
  }
}

const editDialogOpen = ref(false);
const editName = ref("");
const editDescription = ref("");
const { loading: editSaving, error: editError, run: runSaveEdit } = useAsyncForm("Не удалось сохранить изменения");

const { confirmAction } = useConfirmAction();

function openEditDialog(): void {
  if (!board.value) {
    return;
  }
  editName.value = board.value.name;
  editDescription.value = board.value.description || "";
  editDialogOpen.value = true;
}

async function handleSaveEdit(): Promise<void> {
  await runSaveEdit(async () => {
    board.value = await boardsClient.update(boardId.value, {
      name: editName.value,
      description: editDescription.value,
    });
    editDialogOpen.value = false;
  });
}

async function handleDeleteBoard(): Promise<void> {
  await confirmAction("Удалить доску без возможности восстановления?", async () => {
    await boardsClient.remove(boardId.value);
    router.push({ name: ROUTE_NAMES.home });
  });
}

const inviteDialogOpen = ref(false);
const USER_SEARCH_MIN_LENGTH = 2;

const inviteRole = ref<BoardRole>("VIEWER");
const selectedInviteUserId = ref<string | null>(null);
const selectedInviteEmail = ref("");
const selectedInviteUser = ref<User | null>(null);
const inviteMenuOpen = ref(false);
const { loading: inviting, error: inviteError, run: runInvite } = useAsyncForm("Не удалось пригласить участника");

const userSearch = useDebouncedSearch<User>(
  async (query) => {
    const page = await usersClient.search(query);
    return page.content;
  },
  { minLength: USER_SEARCH_MIN_LENGTH, delay: 300 },
);

function userOf(item: unknown): User {
  const wrapped = item as { raw?: User };
  return wrapped?.raw ?? (item as User);
}

function handleInviteMenuUpdate(value: boolean): void {
  inviteMenuOpen.value = value && userSearch.query.value.trim().length >= USER_SEARCH_MIN_LENGTH;
}

watch(
  () => userSearch.query.value,
  (value) => {
    inviteMenuOpen.value = value.trim().length >= USER_SEARCH_MIN_LENGTH;
  },
);

function handleSelectInviteUser(userId: string | null): void {
  const user = userSearch.results.value.find((candidate) => candidate.id === userId) || null;
  selectedInviteUser.value = user;
  selectedInviteEmail.value = user?.email || "";
  inviteMenuOpen.value = false;
}

function clearSelectedInviteUser(): void {
  selectedInviteUserId.value = null;
  selectedInviteEmail.value = "";
  selectedInviteUser.value = null;
  userSearch.reset();
}

watch(inviteDialogOpen, (open) => {
  if (!open) {
    selectedInviteUserId.value = null;
    selectedInviteEmail.value = "";
    selectedInviteUser.value = null;
    inviteMenuOpen.value = false;
    userSearch.reset();
  }
});

async function handleInvite(): Promise<void> {
  if (!selectedInviteEmail.value) {
    return;
  }
  const ok = await runInvite(async () => {
    await boardsClient.inviteMember(boardId.value, { email: selectedInviteEmail.value, role: inviteRole.value });
    inviteDialogOpen.value = false;
  });
  if (ok) {
    await loadMembers();
  }
}

async function handleRoleChange(member: BoardMember, role: BoardRole): Promise<void> {
  await boardsClient.updateMemberRole(boardId.value, member.userId, { role });
  await loadMembers();
}

async function handleRemoveMember(member: BoardMember): Promise<void> {
  await confirmAction(`Удалить ${member.displayName} с доски?`, async () => {
    await boardsClient.removeMember(boardId.value, member.userId);
    await loadMembers();
    handleCardChanged();
  });
}

const cardDialogOpen = ref(false);
const selectedCardId = ref<string | null>(null);
const cardsRefreshToken = ref(0);

function openCard(cardId: string): void {
  selectedCardId.value = cardId;
  cardDialogOpen.value = true;
}

function handleCardChanged(): void {
  cardsRefreshToken.value += 1;
}

watch(
  [boardId, canEdit, members],
  ([id, edit, memberList]) => {
    boardContextStore.setContext(id, edit, memberList);
  },
  { immediate: true },
);

watch(
  () => boardContextStore.pendingCardId,
  (cardId) => {
    if (cardId) {
      openCard(boardContextStore.consumePendingCard() as string);
    }
  },
);

onUnmounted(() => {
  boardContextStore.clearContext();
});

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile();
  }
  await loadBoard();
  await loadMembers();
});
</script>

<style scoped lang="scss">
@import "./styles";
</style>
