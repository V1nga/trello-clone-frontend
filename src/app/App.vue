<template>
  <VApp>
    <VAppBar v-if="authStore.isAuthenticated" class="app-bar-glass" density="comfortable">
      <VContainer class="app-bar-container">
        <RouterLink to="/" class="title-link app-bar-brand">
          <img src="/favicon.svg" alt="" class="app-bar-logo" />
          <span class="app-bar-brand-text">TrelloClone</span>
        </RouterLink>

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
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";
import ConfirmDialog from "@/components/confirm-dialog/ConfirmDialog.vue";
import { ROUTE_NAMES } from "@/router/routeNames";

const authStore = useAuthStore();
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
</script>

<style scoped lang="scss">
@import "./styles";
</style>
