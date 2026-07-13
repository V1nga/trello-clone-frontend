<template>
  <VAvatar :size="size" class="user-avatar" :color="avatarColor(name)">
    <span class="user-avatar-initials" :style="{ fontSize: initialsSize }">{{ initials(name) }}</span>
  </VAvatar>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    name: string;
    size?: number | string;
    initialsSize?: string;
  }>(),
  {
    size: 32,
    initialsSize: "12px",
  },
);

const AVATAR_PALETTE = ["#5546E8", "#0EA5A0", "#D946EF", "#F59E0B", "#0EA5E9"];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[hash];
}

function initials(name: string): string {
  return (name || "")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
</script>

<style scoped lang="scss">
@import "./styles";
</style>
