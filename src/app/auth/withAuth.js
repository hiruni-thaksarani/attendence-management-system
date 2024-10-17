import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('jwtToken');
      if (!token) {
        router.push('/po'); // Redirect to login if no token is found
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;