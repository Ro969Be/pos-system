import { defineStore } from "pinia";
import api from "@/api/axios";

export const useTicketStore = defineStore("tickets", {
  state: () => ({
    tickets: [] as any[]
  }),

  actions: {
    async fetchTickets() {
      const res = await api.get("/tickets");
      this.tickets = res.data;
    },

    async createTicket(payload: { orderId?: string; tableNumber?: number; staff?: string }) {
      const res = await api.post("/tickets", payload);
      this.tickets.push(res.data);
    },

    async addItem(ticketId: string, payload: { product: string; quantity: number; notes?: string }) {
      const res = await api.post(`/tickets/${ticketId}/items`, payload);
      const index = this.tickets.findIndex(t => t._id === ticketId);
      if (index !== -1) this.tickets[index] = res.data;
    },

    async closeTicket(ticketId: string) {
      const res = await api.delete(`/tickets/${ticketId}?mode=close`);
      this.tickets = this.tickets.filter(t => t._id !== ticketId);
    },

    async cancelTicket(ticketId: string) {
      const res = await api.delete(`/tickets/${ticketId}?mode=cancel`);
      this.tickets = this.tickets.filter(t => t._id !== ticketId);
    }
  }
});
