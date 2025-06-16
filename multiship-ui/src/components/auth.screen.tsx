import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';

export function RoomSelectionComponent(props: {
  selectedAvatar: string,
  username: string,
  handleBack: () => void,
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-red-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 drop-shadow-lg">{props.selectedAvatar}</div>
          <h1 className="text-3xl font-bold text-red-400 tracking-wider">
            READY FOR WAR
          </h1>
          <p className="text-gray-300 text-lg mt-2 uppercase tracking-wide">
            {props.username}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => alert('Create Battle Room clicked!')}
            className="w-full bg-red-800 hover:bg-red-700 text-white py-4 rounded-lg font-medium text-lg transition-colors uppercase tracking-wide border border-red-700 hover:border-red-600"
          >
            ⚔️ CREATE BATTLE ROOM
          </button>

          <button
            onClick={() => alert('Join Battle clicked!')}
            className="w-full bg-orange-800 hover:bg-orange-700 text-white py-4 rounded-lg font-medium text-lg transition-colors uppercase tracking-wide border border-orange-700 hover:border-orange-600"
          >
            🛡️ JOIN BATTLE
          </button>

          <button
            onClick={() => alert('Quick Match clicked!')}
            className="w-full bg-yellow-800 hover:bg-yellow-700 text-white py-4 rounded-lg font-medium text-lg transition-colors uppercase tracking-wide border border-yellow-700 hover:border-yellow-600"
          >
            💀 QUICK MATCH
          </button>

          <button
            onClick={props.handleBack}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 py-2 rounded-lg font-medium transition-colors mt-6 uppercase tracking-wide border border-gray-600"
          >
            ← RETREAT
          </button>
        </div>
      </div>
    </div>
  );
}

function SignupComponent(props: {
  username: string
  selectedAvatar: string

  setSelectedAvatar: (newVal: any) => void
  setCurrentScreen: (newVal: any) => void
  setUsername: (newVal: any) => void
}) {
  const liveUsers = useAppSelector(state => {
    console.log(state);
    return state?.health?.liveUsers;
  });
  const avatars = ['💀', '⚔️', '🔥', '👹', '🐺', '🦇', '🖤', '🗡️'];

  const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatars.length);
    props.setSelectedAvatar(avatars[randomIndex]);
  };

  const handleContinue = () => {
    if (props.username.trim()) {
      props.setCurrentScreen('menu');
    }
  };
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
          <span className="text-red-400">{liveUsers} users battling</span>
          <h1 className="text-3xl font-bold text-center text-red-400 mb-8 tracking-wider">
            ENTER THE BATTLE
          </h1>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                Captain's Name
              </label>
              <input
                type="text"
                value={props.username}
                onChange={(e) => props.setUsername(e.target.value)}
                placeholder="Enter your warrior name"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-white placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 uppercase tracking-wide">
                Captain Avatar
              </label>
              <div className="flex items-center gap-3">
                <div className="text-4xl bg-gray-800 border border-red-800 rounded-lg p-3">
                  {props.selectedAvatar}
                </div>
                <button
                  onClick={getRandomAvatar}
                  className="bg-red-800 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors uppercase tracking-wide"
                >
                  Randomize
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {avatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => props.setSelectedAvatar(avatar)}
                    className={`text-2xl p-2 rounded-lg border-2 transition-colors ${
                      props.selectedAvatar === avatar
                        ? 'border-red-500 bg-red-900'
                        : 'border-gray-600 bg-gray-800 hover:border-red-700'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={!props.username.trim()}
              className="w-full bg-red-800 hover:bg-red-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors uppercase tracking-wider"
            >
              ENTER BATTLE
            </button>
          </div>
        </div>
      </div>
    );
}

export default function AuthScreen() {
  const [currentScreen, setCurrentScreen] = useState('username');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('💀');

  const handleBack = () => {
    setCurrentScreen('username');
  };

  if (currentScreen === 'username') {
    return <SignupComponent 
      username={username} 
      selectedAvatar={selectedAvatar} 
      setSelectedAvatar={setSelectedAvatar} 
      setCurrentScreen={setCurrentScreen} 
      setUsername={setUsername} />
  }

  return <RoomSelectionComponent 
    selectedAvatar={selectedAvatar} 
    username={username} 
    handleBack={handleBack} />

}
