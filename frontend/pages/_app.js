import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Import Bootstrap
    import('bootstrap/dist/css/bootstrap.min.css');
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
    
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default MyApp;