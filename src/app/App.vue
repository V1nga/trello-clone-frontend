<template>
  <VApp>
    <VAppBar v-if="authStore.isAuthenticated" class="app-bar-glass" density="comfortable">
      <VContainer class="app-bar-container">
        <RouterLink to="/" class="title-link app-bar-brand">
          <img src="/favicon.svg" alt="" class="app-bar-logo" />
          <span class="app-bar-brand-text">TrelloClone</span>
        </RouterLink>

        <div v-if="currentBoardId" class="app-bar-search">
          <VAutocomplete
            v-model="selectedCardId"
            v-model:search="cardSearch.query.value"
            :menu="cardMenuOpen"
            :items="cardSearch.results.value"
            :loading="cardSearch.loading.value"
            item-title="title"
            item-value="id"
            placeholder="Поиск задач на доске"
            density="compact"
            variant="solo"
            rounded="lg"
            flat
            hide-details
            no-filter
            menu-icon=""
            clearable
            prepend-inner-icon="mdi-magnify"
            class="card-search-field"
            :menu-props="{ contentClass: 'card-search-menu' }"
            @update:model-value="handleSelectCard"
            @update:menu="handleCardMenuUpdate"
          >
            <template #item="{ props: itemProps, item }">
              <VListItem v-bind="itemProps" :title="item.title" prepend-icon="mdi-card-text-outline" />
            </template>
            <template #no-data>
              <VListItem v-if="cardSearch.loading.value" title="Идёт поиск..." class="search-no-data" />
              <VListItem
                v-else-if="cardSearch.query.value.trim().length >= CARD_SEARCH_MIN_LENGTH"
                title="Ничего не найдено"
                class="search-no-data"
              />
            </template>
          </VAutocomplete>
        </div>

        <VMenu :offset="8">
          <template #activator="{ props }">
            <VBtn v-bind="props" variant="text" color="black" class="profile-btn">
              <UserAvatar :name="authStore.user?.displayName || ''" size="28" class="profile-avatar" />
              <span class="profile-name">{{ authStore.user?.displayName || "Профиль" }}</span>
              <VIcon icon="mdi-chevron-down" size="18" class="profile-chevron" />
            </VBtn>
          </template>
          <VList class="profile-menu-list">
            <VListItem
              :to="{ name: ROUTE_NAMES.profile }"
              title="Профиль"
              prepend-icon="mdi-account-outline"
              class="profile-menu-item"
            />
            <VDivider class="profile-menu-divider" />
            <VListItem
              title="Выйти"
              prepend-icon="mdi-logout"
              base-color="error"
              class="profile-menu-item"
              @click="handleLogout"
            />
          </VList>
        </VMenu>
      </VContainer>
    </VAppBar>

    <VMain class="app-main">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </transition>
      </RouterView>
    </VMain>

    <ConfirmDialog />
  </VApp>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useBoardContextStore } from "@/stores/boardContext";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import ConfirmDialog from "@/components/confirm-dialog/ConfirmDialog.vue";
import { useDebouncedSearch } from "@/composables/useDebouncedSearch";
import { cardsClient } from "@/api";
import { ROUTE_NAMES } from "@/router/routeNames";
import type { CardSummary } from "@/types/models";

const authStore = useAuthStore();
const boardContextStore = useBoardContextStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchProfile();
  }
});

function handleLogout(): void {
  authStore.logout();
  router.push({ name: ROUTE_NAMES.login });
}

const currentBoardId = computed(() =>
  route.name === ROUTE_NAMES.boardDetail ? (route.params.id as string) : null,
);

const CARD_SEARCH_MIN_LENGTH = 2;

const selectedCardId = ref<string | null>(null);
const cardMenuOpen = ref(false);

const cardSearch = useDebouncedSearch<CardSummary>(
  async (query) => {
    const boardId = currentBoardId.value;
    if (!boardId) {
      return [];
    }
    const page = await cardsClient.search(boardId, query);
    return page.content;
  },
  { minLength: CARD_SEARCH_MIN_LENGTH, delay: 300 },
);

function handleCardMenuUpdate(value: boolean): void {
  cardMenuOpen.value = value && cardSearch.query.value.trim().length >= CARD_SEARCH_MIN_LENGTH;
}

watch(
  () => cardSearch.query.value,
  (value) => {
    cardMenuOpen.value = value.trim().length >= CARD_SEARCH_MIN_LENGTH;
  },
);

function handleSelectCard(cardId: string | null): void {
  if (!cardId) {
    return;
  }
  boardContextStore.requestOpenCard(cardId);
  selectedCardId.value = null;
  cardMenuOpen.value = false;
  cardSearch.reset();
}

watch(currentBoardId, () => {
  cardMenuOpen.value = false;
  cardSearch.reset();
});
</script>

<style scoped lang="scss">
@import "./styles";
</style>
