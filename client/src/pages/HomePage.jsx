import { useAuthStore } from "../store/useAuthStore.js"

const HomePage = () => {
    const {logout} = useAuthStore();
    return (
        <div>HomePage

            <button onClick={logout}>
                logout
            </button>
        </div>
    )
}

export default HomePage