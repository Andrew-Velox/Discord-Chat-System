import { useState } from "react";
import { useAuthServiceContext } from "../context/AuthContext";
import axios from "../utils/axios"; // Use main axios with Token auth

const TestLogin = () => {
  const { isLoggedIn, logout } = useAuthServiceContext();
  const [username, setUsername] = useState("");

  const getUserDetails = async () => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/account/?user_id=1`
      );
      const userDetails = response.data;
      setUsername(userDetails.username);
    } catch (err: any) {
      return err;
    }
  };

  return (
    <>
      <div>{isLoggedIn.toString()}</div>
      <div>
        <button onClick={logout}>Logout</button>
        <button onClick={getUserDetails}>Get User Details</button>
      </div>
      <div>Username: {username}</div>
    </>
  );
};

export default TestLogin;
