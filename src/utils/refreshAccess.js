import axios from "axios";
axios.defaults.withCredentials = true;

const refreshAccess = async () => {
    try {
        const response = await axios.post("http://localhost:5000/api/auth/refresh-access");
            console.log("Refreshed Access Token Success as", response);
            localStorage.setItem("token", response.data.token);
            return true;
    } catch (error) {
        console.error(error);
        console.log("Failed to refresh access token")
        // Invalid token or an error occurred
        return false;
    }
}

export default refreshAccess