import 'src/global.css';

// ----------------------------------------------------------------------

import { Router } from 'src/routes/sections';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import { CONFIG } from 'src/config-global';
import { LocalizationProvider } from 'src/locales';
import { I18nProvider } from 'src/locales/i18n-provider';
import { ThemeProvider } from 'src/theme/theme-provider';

import { Snackbar } from 'src/components/snackbar';
import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { CheckoutProvider } from 'src/sections/checkout/context';

import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';

// import { AuthProvider as Auth0AuthProvider } from 'src/auth/context/auth0';
// import { AuthProvider as AmplifyAuthProvider } from 'src/auth/context/amplify';
// import { AuthProvider as SupabaseAuthProvider } from 'src/auth/context/supabase';
// import { AuthProvider as FirebaseAuthProvider } from 'src/auth/context/firebase';


// import Login from './components/login';
// import AddUser from './components/addUser';
// import ListUsers from './components/listUsers';
// import PrivateRoute from './components/privateRoute';
// import Dashboard from './components/dashboard';

// import './App.css';


// ----------------------------------------------------------------------

const AuthProvider =
  (CONFIG.auth.method === 'amplify' && AmplifyAuthProvider) ||
  (CONFIG.auth.method === 'firebase' && FirebaseAuthProvider) ||
  (CONFIG.auth.method === 'supabase' && SupabaseAuthProvider) ||
  (CONFIG.auth.method === 'auth0' && Auth0AuthProvider) ||
  JwtAuthProvider;

export default function App() {
  useScrollToTop();

  return (
    <I18nProvider>
      <LocalizationProvider>
        <AuthProvider>
          <SettingsProvider settings={defaultSettings}>
            <ThemeProvider>
              <MotionLazy>
                <CheckoutProvider>
                  <Snackbar />
                  <ProgressBar />
                  <SettingsDrawer />
                  <Router />
                </CheckoutProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </LocalizationProvider>
    </I18nProvider>
  );
}
// }

// function App() {
//   const [message, setMessage] = useState('');
//   const apiUrl = import.meta.env.VITE_API_URL;
  
//   useEffect(() => {
//     axios.get(`${apiUrl}/api`)
//       .then(response => {
//         setMessage(response.data.message);
//       })
//       .catch(error => {
//         console.error('There was an error fetching the data!', error);
//       });
//   }, [apiUrl]);

//   return (
//     <div>
//       <h1>Welcome to KickConnect</h1>
//       <p>{message}</p> {/* Use the message state variable here */}    
//     <Router>
//       <Routes>
//         <Route path="/login" element={<Login />} />
//         <Route path="/addUser" element={<AddUser />} />
//         <Route path="/listUsers" element={<ListUsers />} />
//         {/* <Route path="/protected" element={<PrivateRoute component={ProtectedComponent} />} /> */}
//         <Route path="/dashboard" element={<PrivateRoute component={Dashboard} />} />
//       </Routes>
//     </Router>    
//     </div>
//   );
// }

// export default App;
