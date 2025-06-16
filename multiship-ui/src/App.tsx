import { useDispatch } from 'react-redux';
import './App.css'
import { SIGNUP } from './ws/actions';
import { InboundEventType } from './types/wsevents';
import { useEffect, useRef } from 'react';
import AuthScreen from './components/auth.screen';

function App() {
  const dispatch = useDispatch();
  const hasDispatched = useRef(false);

  useEffect(() => {
    if (hasDispatched.current) return;
    hasDispatched.current = true;

    dispatch(SIGNUP({
      eventType: InboundEventType.SIGN_UP,
      payload: {
        email: 'shuvojit@gmail.com',
      },
    }));
  }, [dispatch]);

  return (
    <>
      <div className="bg-gray-100 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
        <AuthScreen />
      </div>
    </>
  )
}

export default App;
