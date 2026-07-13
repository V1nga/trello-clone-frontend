import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { ROUTE_NAMES } from "./routeNames";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    guestOnly?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: ROUTE_NAMES.home,
    component: () => import("@/views/boards-list/BoardsListView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/boards/:id",
    name: ROUTE_NAMES.boardDetail,
    component: () => import("@/views/board-detail/BoardDetailView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: ROUTE_NAMES.profile,
    component: () => import("@/views/profile/ProfileView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: ROUTE_NAMES.login,
    component: () => import("@/views/login/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/register",
    name: ROUTE_NAMES.register,
    component: () => import("@/views/register/RegisterView.vue"),
    meta: { guestOnly: true },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: ROUTE_NAMES.login };
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: ROUTE_NAMES.home };
  }

  return true;
});
