<template>
  <VContainer v-if="board">
    <div class="board-bar">
      <div class="board-bar-info">
        <h1 class="board-title">{{ board.name }}</h1>
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

    <ColumnsBoard
      :board-id="boardId"
      :can-edit="canEdit"
      :cards-refresh-token="cardsRefreshToken"
      @open-card="openCard"
    />

    <CardDetailDialog
      v-model="cardDialogOpen"
      :card-id="selectedCardId"
      :board-id="boardId"
      :can-edit="canEdit"
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
      />
      <VTextarea v-model="editDescription" label="Описание" variant="outlined" hide-details rows="3" />
    </FormDialog>

    <FormDialog
      v-model="inviteDialogOpen"
      title="Пригласить участника"
      submit-label="Пригласить"
      :loading="inviting"
      :error="inviteError"
      @submit="handleInvite"
    >
      <VTextField
        v-model="inviteEmail"
        label="Email участника"
        type="email"
        variant="outlined"
        density="comfortable"
        hide-details
        required
      />
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
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { boardsClient } from "@/api";
import { useAuthStore } from "@/stores/auth";
import ColumnsBoard from "@/components/columns-board/ColumnsBoard.vue";
import CardDetailDialog from "@/components/card-detail-dialog/CardDetailDialog.vue";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import FormDialog from "@/components/form-dialog/FormDialog.vue";
import { useAsyncForm } from "@/composables/useAsyncForm";
import { useConfirmAction } from "@/composables/useConfirmAction";
import { ROUTE_NAMES } from "@/router/routeNames";
import { BOARD_ROLE_LABELS, INVITABLE_ROLE_OPTIONS } from "@/constants/boardRoles";
import type { Board, BoardMember, BoardRole } from "@/types/models";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const boardId = computed(() => route.params.id as string);

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
const inviteEmail = ref("");
const inviteRole = ref<BoardRole>("VIEWER");
const { loading: inviting, error: inviteError, run: runInvite } = useAsyncForm("Не удалось пригласить участника");

async function handleInvite(): Promise<void> {
  const ok = await runInvite(async () => {
    await boardsClient.inviteMember(boardId.value, { email: inviteEmail.value, role: inviteRole.value });
    inviteDialogOpen.value = false;
    inviteEmail.value = "";
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
