import { reactive } from "vue";

export const ui = reactive({
  sidebarOpen: false,
});

const lockBody = (on) => {
  try {
    document.body.classList.toggle("no-scroll", !!on);
  } catch {}
};

export const toggleSidebar = () => {
  ui.sidebarOpen = !ui.sidebarOpen;
  lockBody(ui.sidebarOpen);
};
export const openSidebar = () => {
  ui.sidebarOpen = true;
  lockBody(true);
};
export const closeSidebar = () => {
  ui.sidebarOpen = false;
  lockBody(false);
};
