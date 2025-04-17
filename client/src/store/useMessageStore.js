import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set) => ({
	messages: [],
	unreadMessages: {},
	loading: true,

	sendMessage: async (receiverId, content) => {
		try {
			// mockup a message, show it in the chat immediately
			set((state) => ({
				messages: [
					...state.messages,
					{ _id: Date.now(), sender: useAuthStore.getState().authUser._id, content },
				],
			}));
			const res = await axiosInstance.post("/messages/send", { receiverId, content });
			console.log("message sent", res.data);
		} catch (error) {
			toast.error(error.response.data.message || "Something went wrong");
		}
	},

	getMessages: async (userId) => {
		try {
			set({ loading: true });
			const res = await axiosInstance.get(`/messages/conversation/${userId}`);
			set((state) => ({
                messages: res.data.messages,
                unreadMessages: { ...state.unreadMessages, [userId]: 0 }, // Reset unread count when viewing
            }));
		} catch (error) {
			console.log(error);
			set({ messages: [] });
		} finally {
			set({ loading: false });
		}
	},

	subscribeToMessages: () => {
		const socket = getSocket();
		socket.on("newMessage", ({ message }) => {
			set((state) => { 
				const { sender } = message;
                const unreadCount = state.unreadMessages?.[sender] || 0;

                return {
                    messages: [...state.messages, message],
                    unreadMessages: {
                        ...state.unreadMessages,
                        [sender]: unreadCount + 1, 
                    },
				}
			});
		});
	},

	markAsRead: (userId) => {
        set((state) => ({
            unreadMessages: { ...state.unreadMessages, [userId]: 0 }, 
        }));
    },

	unsubscribeFromMessages: () => {
		const socket = getSocket();
		socket.off("newMessage");
	},
}));