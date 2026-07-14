<template>
  <VContainer>
    <VRow justify="center">
      <VCol cols="12" sm="10" md="8" lg="7">
        <VCard class="auth-card">
          <div class="profile-split">
            <div class="profile-avatar-panel">
              <UserAvatar
                :name="authStore.user?.displayName || ''"
                size="112"
                initials-size="32px"
                class="profile-avatar-large"
              />
            </div>
            <VDivider vertical class="profile-vertical-divider" />
            <div class="profile-main">
              <VCardTitle class="profile-title">Профиль</VCardTitle>
              <VCardText class="profile-content">
                <VTextField :model-value="authStore.user?.email" label="Email" readonly autocomplete="off" />
                <VForm class="profile-form" @submit.prevent="handleSubmit">
                  <VTextField v-model="displayName" label="Имя" required autocomplete="off" />
                  <VAlert v-if="successMessage" class="form-alert" type="success" density="compact">
                    {{ successMessage }}
                  </VAlert>
                  <VAlert v-if="errorMessage" class="form-alert" type="error" density="compact">
                    {{ errorMessage }}
                  </VAlert>
                  <VBtn type="submit" size="large" color="primary" block class="submit-btn" :loading="loading"
                    >Сохранить</VBtn
                  >
                </VForm>
              </VCardText>
            </div>
          </div>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import UserAvatar from "@/components/user-avatar/UserAvatar.vue";

const authStore = useAuthStore();
const displayName = ref("");
const loading = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchProfile();
  }
  displayName.value = authStore.user?.displayName || "";
});

async function handleSubmit(): Promise<void> {
  successMessage.value = "";
  errorMessage.value = "";
  loading.value = true;
  try {
    await authStore.updateProfile({ displayName: displayName.value });
    successMessage.value = "Имя обновлено";
  } catch {
    errorMessage.value = "Не удалось сохранить изменения";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
