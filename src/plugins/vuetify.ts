import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";

export const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#5546E8",
          secondary: "#0EA5A0",
          background: "#E8EBF6",
          surface: "#FFFFFF",
        },
      },
    },
  },
  defaults: {
    VBtn: { rounded: "lg", variant: "flat", color: "primary" },
    VTextField: { rounded: "lg", variant: "outlined", hideDetails: "auto", color: "primary" },
    VTextarea: { rounded: "lg", variant: "outlined", hideDetails: "auto", color: "primary" },
    VSelect: { rounded: "lg", variant: "outlined", hideDetails: "auto", color: "primary" },
    VCard: { rounded: "lg" },
    VMenu: { rounded: "lg" },
    VList: { rounded: "lg" },
    VListItem: { rounded: "lg" },
  },
});
