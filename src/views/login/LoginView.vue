<template>
  <VContainer class="page" fluid>
    <VRow class="page-row" justify="center" align="center">
      <VCol cols="12" sm="6" md="3">
        <VCard class="auth-card">
          <VCardTitle class="login-title">Вход</VCardTitle>
          <VDivider class="auth-divider" />
          <VCardText>
            <VForm class="login-form" @submit.prevent="handleSubmit">
              <VTextField
                v-model="email"
                label="Email"
                type="email"
                density="compact"
                variant="outlined"
                :hide-details="!emailErrors.length"
                :error-messages="emailErrors"
                @blur="v$.email.$touch()"
              />
              <VTextField
                v-model="password"
                label="Пароль"
                type="password"
                density="compact"
                variant="outlined"
                :hide-details="!passwordErrors.length"
                :error-messages="passwordErrors"
                @blur="v$.password.$touch()"
              />
              <VAlert v-if="errorMessage" class="error-alert" type="error" density="compact">
                {{ errorMessage }}
              </VAlert>
              <VBtn type="submit" size="large" color="primary" block class="submit-btn" :loading="loading"
                >Войти</VBtn
              >
              <VBtn variant="text" class="switch-btn" :to="{ name: ROUTE_NAMES.register }"
                >Нет аккаунта? Зарегистрироваться</VBtn
              >
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { useVuelidate } from "@vuelidate/core";
import { email as emailRule, helpers, required } from "@vuelidate/validators";
import { useAuthStore } from "@/stores/auth";
import { ROUTE_NAMES } from "@/router/routeNames";

const email = ref("");
const password = ref("");
const loading = ref(false);
const errorMessage = ref("");

const rules = {
  email: {
    required: helpers.withMessage("Введите email", required),
    email: helpers.withMessage("Некорректный email", emailRule),
  },
  password: {
    required: helpers.withMessage("Введите пароль", required),
  },
};

const v$ = useVuelidate(rules, { email, password });

const emailErrors = computed(() => v$.value.email.$errors.map((e) => String(e.$message)));
const passwordErrors = computed(() => v$.value.password.$errors.map((e) => String(e.$message)));

const authStore = useAuthStore();
const router = useRouter();

async function handleSubmit(): Promise<void> {
  errorMessage.value = "";
  const isValid = await v$.value.$validate();
  if (!isValid) {
    return;
  }
  loading.value = true;
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push({ name: ROUTE_NAMES.home });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = "Не удалось войти. Попробуйте ещё раз.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
