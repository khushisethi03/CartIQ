import axios from "axios";

export const updateProfile = async (data) => {
    return await axios.put(
        "http://localhost:8080/api/v1.0/profile",
        data,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
};
export const changePassword = async (data) => {
    return await axios.put(
        "http://localhost:8080/api/v1.0/profile/password",
        data,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
};