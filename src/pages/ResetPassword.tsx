import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Password reset is now handled via OTP in the main auth flow
    // Redirect any old reset links to the home page
    navigate("/", { replace: true });
  }, [navigate]);

  return null;
};

export default ResetPassword;
