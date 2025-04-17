import { useEffect, useState } from "react";
import {Handshake, Loader, MessageCircle, X} from "lucide-react";
import { Link } from "react-router-dom";
import { useMatchStore } from "../store/useMatchStore";
import { useMessageStore } from "../store/useMessageStore";

const SideBar = () => {
const [isOpen, setIsOpen] = useState(false);
const toggleSidebar = () => setIsOpen(!isOpen);

const {getMyMatches, matches, isLoadingMyMatches}=useMatchStore();
const { unreadMessages, markAsRead } = useMessageStore();

useEffect(() => {
    getMyMatches();
}, [getMyMatches]);

  return (
    <>
  <div className={`
    fixed inset-y-0 left-0 z-10 w-64 bg-white shadow-md overflow-hidden transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    lg:translate-x-0 lg:static lg:w-1/4 
    `}>
        <div className="flex flex-col h-full">
            <div className="p-4 pb-[27px] border-b border-yellow-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-yellow-600">
                    Matches
                </h2>
                <button 
                className="lg:hidden p-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={toggleSidebar}
                >
                    <X size={24}/>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 z-10 relative">
                {isLoadingMyMatches ? <LoadingState/> : matches.length === 0 ? <NoMatchesFound/> : (
                    matches.map(match => (
                        <Link key={match._id} to={`/chat/${match._id}`} onClick={() => markAsRead(match._id)}>
                            <div className="flex items-center justify-between mb-4 cursor-pointer hover:bg-yellow-50 p-2 rounded-lg transition-colors duration-300">
                                <div className="flex items-center">
                                    <img 
                                        src={match.image || "/avatar.png"} 
                                        alt="User avatar"
                                        className="size-12 object-cover rounded-full mr-3 border-2 border-yellow-300"
                                    />
                                    <h3 className="font-semibold text-gray-800">{match.name}</h3>
                                </div>
                                {(unreadMessages[match._id] || 0) > 0 && (
                                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {unreadMessages[match._id] || 0}
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    </div>

    <button className="lg:hidden fixed top-4 left-4 p-2 bg-yellow-500 text-white rounded-md z-0"
    onClick={toggleSidebar}
   >
    <MessageCircle size={24}/>
    </button>
    </>
  );
};


export default SideBar;

const LoadingState = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Loader className='text-yellow-500 mb-4 animate-spin' size={48} />
		<h3 className='text-xl font-semibold text-gray-700 mb-2'>Loading Pals</h3>
		<p className='text-gray-500 max-w-xs'>We&apos;re finding your perfect Pals. This might take a moment...</p>
	</div>
);

const NoMatchesFound = () => (
	<div className='flex flex-col items-center justify-center h-full text-center'>
		<Handshake className='text-yellow-400 mb-4' size={48} />
		<h3 className='text-xl font-semibold text-gray-700 mb-2'>No Pals Yet</h3>
		<p className='text-gray-500 max-w-xs'>
			Don&apos;t worry! Your perfect Pal is just around the corner. Keep Finding!
		</p>
	</div>
);