import './variables.css'
import Components from './Components/Components';
import { AuthProvider } from './Providers/AuthProvider';
import { AxiosProvider } from './Providers/AxiosProvider';
import { UserProvider } from './Providers/UserProvider';
import './assets/fonts.css';
import { SupabaseProvider } from './Providers/SupabaseProvider';

// let isLoggedIn = false;

const App = () => {
    return (
      <AxiosProvider>
        <AuthProvider>
          <SupabaseProvider>
            <UserProvider>
              <Components/>
            </UserProvider>
          </SupabaseProvider>
        </AuthProvider>
      </AxiosProvider>
    );
};

export default App;
