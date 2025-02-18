import TinderCard from 'react-tinder-card';
import { useMatchStore } from '../store/useMatchStore.js';
import { Check, X } from 'lucide-react';

const SwipeArea = () => {
    const {userProfiles, swipeLeft, swipeRight} = useMatchStore();
    const handleSwipe = (dir, user) => {
        console.log("Swiping", dir, "on user:", user); // Debug
        console.log("User ID:", user._id); // Debug
    
        if (dir === "right") swipeRight(user);
        else if (dir === "left") swipeLeft(user);
    };
  return (
    <div className='relative w-full max-w-sm h-[28rem]'>
        {userProfiles.map(user => (
            <TinderCard
            className='absolute shadow-none'
            key={user._id}
            onSwipe={(dir) => handleSwipe(dir, user)}
            swipeRequirementType='position'
            swipeThreshold={100}
            preventSwipe={["up", "down"]}
            >
                <div
                    className='card bg-white w-96 h-[28rem] select-none rounded-lg overflow-hidden border
                    border-gray-200'
                >
                    <figure className='px-4 pt-4 h-3/4'>
                        <img
                            src={user.image || "/avatar.png"}
                            alt={user.name}
                            className='rounded-lg object-cover h-full pointer-events-none'
                        />
                    </figure>
                    <div className='card-body bg-gradient-to-b from-white to-yellow-50'>
                        <h2 className='card-title text-2xl text-gray-800'>
                            {user.name}, {user.age}
                        </h2>
                        <p className='text-gray-600'>{user.bio}</p>
                        <div className="flex justify-center gap-40 mt-4">
                            <button 
                                className="bg-red-500 text-white p-4 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition"
                                onClick={() => swipeLeft(user)}
                            >
                                <X size={24} />
                            </button>
                            <button 
                                className="bg-green-500 text-white p-4 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition"
                                onClick={() => swipeRight(user)}
                            >
                                <Check size={24} />
                            </button>
                        </div>
                    </div>
                </div>
            </TinderCard>
        ))}
        
    </div>
  )
}

export default SwipeArea