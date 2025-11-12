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

// Improved body scroll lock to prevent header jump on mobile
let _lockState = { y: 0, active: false };
const applyLock = (on) => {
  try {
    if (on && !_lockState.active) {
      _lockState.y = window.scrollY || 0;
      document.body.style.position = "fixed";
      document.body.style.top = `-${_lockState.y}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.classList.add("no-scroll");
      _lockState.active = true;
    } else if (!on && _lockState.active) {
      document.body.classList.remove("no-scroll");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, _lockState.y);
      _lockState.active = false;
    }
  } catch (e) {}
};
