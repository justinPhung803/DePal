import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast"
import { getSocket } from "../socket/socket.client"

export const useMatchStore = create((set, get) => ({
    matches:[],
    isLoadingMyMatches: false,
    isLoadingUserProfiles: false,
    userProfiles: [],
    swipeFeedback:null,

    getMyMatches: async () => {
        try {
            set({isLoadingMyMatches: true})
            const res = await axiosInstance.get("/matches")
            set({matches: res.data.matches})
        } catch (error) {
            set({matches: []})
            toast.error(error.response.data.message || "Something went wrong");
        } finally {
            set({isLoadingMyMatches: false})
        }
    },

    getUserProfiles: async () => {
        try {
            set({isLoadingUserProfiles: true})
            const res = await axiosInstance.get("/matches/user-profiles")
            set({userProfiles: res.data.user})
        } catch (error) {
            set({userProfiles: []})
            toast.error(error.response.data.message || "Something went wrong");
        } finally {
            set({isLoadingUserProfiles: false})
        }
    },

    swipeLeft: async (user) => {
		try {
			set({ swipeFeedback: "passed" });
			await axiosInstance.post("/matches/swipe-left/" + user._id);
            set((state) => ({
                userProfiles: state.userProfiles.filter((profile) => profile._id !== user._id),
            }));
		} catch (error) {
			console.log(error);
			toast.error("Failed to swipe left");
		} finally {
			setTimeout(() => set({ swipeFeedback: null }), 1500);
		}
	},
	swipeRight: async (user) => {
		try {
			set({ swipeFeedback: "liked" });
			await axiosInstance.post("/matches/swipe-right/" + user._id);
            set((state) => ({
                userProfiles: state.userProfiles.filter((profile) => profile._id !== user._id),
            }));
		} catch (error) {
			console.log(error);
			toast.error("Failed to swipe right");
		} finally {
			setTimeout(() => set({ swipeFeedback: null }), 1500);
		}
	},

    subscribeToNewMatches: () => {
        try {
            const socket = getSocket();

            socket.on("newMatch", (newMatch) => {
                set(state => ({
                    matches: [ ...state.matches, newMatch ]
                }));
                toast.success("You got a new friend!")

            });
        } catch (error) {
            console.log(error);
        }
    },

    unsubscribeFromNewMatches: () => {
        try {
            const socket = getSocket();

            socket.off("newMatch");
        } catch (error) {
            console.log(error);
        }
    },

    getEvents: async () => {
        try {
            const res = await axiosInstance.get("/events");
            set({ events: res.data.events });
        } catch (error) {
            toast.error("Failed to fetch events");
        }
    },

    addEvent: async (eventData) => {
        try {
            const res = await axiosInstance.post("/events", eventData);
            set((state) => ({ events: [...state.events, res.data.event] }));
            toast.success("Event added successfully!");
        } catch (error) {
            toast.error("Failed to add event");
        }
    },

    unmatchUser: async (userId) => {
        console.log("Unmatching user:", userId);
        try {
            const response = await axiosInstance.delete(`/matches/unmatch/${userId}`);
            console.log("Unmatch Response:", response.data);
        
            // Remove from matches
            set((state) => ({
                matches: state.matches.filter((match) => match._id !== userId),
            }));
        
            // Corrected function name from fetchUserProfiles to getUserProfiles
            const { getUserProfiles } = get(); 
            await getUserProfiles();
        
            toast.success("User unmatched successfully");
        } catch (error) {
            console.error("Error unmatching user:", error);
            toast.error("Failed to unmatch user");
        }
    },    
    
    
    
    
    blockUser: async (userId) => {
        console.log("Blocking user:", userId);
        try {
            const response = await axiosInstance.post(`/api/matches/block/${userId}`);
            console.log("Block Response:", response.data);
    
            set((state) => ({
                matches: state.matches.filter((match) => match._id !== userId),
            }));
            toast.success("User blocked successfully");
        } catch (error) {
            console.error("Error blocking user:", error);
            toast.error("Failed to block user");
        }
    },
}))