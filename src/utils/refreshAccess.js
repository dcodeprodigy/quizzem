import axios from "axios";
axios.defaults.withCredentials = true;

const refreshAccess = async () => {
    try {
        const apiUrl = import.meta.env.VITE_API_URL
        const response = await axios.post(`${apiUrl}/api/auth/refresh-access`);
            localStorage.setItem("token", response.data.token);
            return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export default refreshAccess