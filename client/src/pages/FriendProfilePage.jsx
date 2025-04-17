import { useEffect } from "react";
import Header from "../components/Header";
import { useAuthStore } from "../store/useAuthStore";
import { useMatchStore } from "../store/useMatchStore";
import { Link, useNavigate, useParams } from "react-router-dom";

const FriendProfilePage = () => {
    const { authUser } = useAuthStore();
    const { getMyMatches, matches, isLoadingMyMatches, unmatchUser, blockUser } = useMatchStore();
    const { id } = useParams();
    const navigate = useNavigate(); // ✅ Moved to the top

    useEffect(() => {
        getMyMatches();
    }, [getMyMatches]);

    const match = matches.find((m) => m?._id === id);
    console.log("Match Data:", match);

    // Instead of early return, handle loading and not found states with a fallback UI
    if (isLoadingMyMatches) {
        return (
            <div className='min-h-screen bg-gray-50 flex flex-col'>
                <Header />
                <div className='flex-grow flex items-center justify-center'>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!match) {
        return (
            <div className='min-h-screen bg-gray-50 flex flex-col'>
                <Header />
                <div className='flex-grow flex items-center justify-center'>
                    <p>Friend not found</p>
                </div>
            </div>
        );
    }

    const handleUnmatch = () => {
        unmatchUser(id);
        navigate("/");
    };

    const handleBlock = () => {
        blockUser(id);
        navigate("/");
    };

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col'>
            <Header />
            <div className='flex-grow flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8'>
                <div className='sm:mx-auto sm:w-full sm:max-w-md'>
                    <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>{match.name}'s Profile</h2>
                </div>

                <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
                    <div className='bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200'>
                        <img
                            src={match.image || "/avatar.png"}
                            alt={match.name}
                            className='w-32 h-32 object-cover rounded-full mx-auto mb-4 border-4 border-yellow-300'
                        />
                        <p className='text-lg font-semibold text-gray-800 text-center mb-2'>{match.name}, {match.age}</p>
                        <p className='text-gray-600 text-center mb-4'>{match.bio}</p>
                        <p className='text-gray-600 text-center mb-4'>Gender: {match.gender}</p>
                        <p className='text-gray-600 text-center mb-4'>Preference: {match.genderPreference}</p>

                        <div className='flex justify-around mt-6'>
                            <button
                                onClick={handleUnmatch}
                                className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors'
                            >
                                Unmatch
                            </button>
                            <button
                                onClick={handleBlock}
                                className='px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors'
                            >
                                Block
                            </button>
                        </div>

                        <div className='text-center mt-6'>
                            <Link to='/' className='text-yellow-500 hover:underline'>
                                Go Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FriendProfilePage;
