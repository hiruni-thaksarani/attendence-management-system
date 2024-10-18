import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const showSuccessToast = (message) => {
    toast.success(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};
const showErrorToast = (message) => {
    toast.error(message, {
        position: "top-right",
        autoClose: 50000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
};
const Toast = () => {
    return <ToastContainer />;
};
export { showSuccessToast, showErrorToast, Toast };