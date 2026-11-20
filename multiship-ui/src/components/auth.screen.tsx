import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { RetroButton } from '@/components/retro-ui/RetroButton';
import { RetroInput } from '@/components/retro-ui/RetroInput';

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
          <RetroButton
            onClick={() => alert('Create Battle Room clicked!')}
            size="lg"
            className="w-full"
          >
            ⚔️ CREATE BATTLE ROOM
          </RetroButton>

          <RetroButton
            onClick={() => alert('Join Battle clicked!')}
            size="lg"
            variant="secondary"
            className="w-full"
          >
            🛡️ JOIN BATTLE
          </RetroButton>

          <RetroButton
            onClick={() => alert('Quick Match clicked!')}
            size="lg"
            variant="danger"
            className="w-full"
          >
            💀 QUICK MATCH
          </RetroButton>

          <RetroButton
            onClick={props.handleBack}
            variant="ghost"
            className="w-full mt-6"
          >
            ← RETREAT
          </RetroButton>
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
              <RetroInput
                value={props.username}
                onChange={(value) => props.setUsername(value)}
                placeholder="Enter your warrior name"
                className="bg-gray-800 text-white placeholder:text-gray-400"
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
                <RetroButton
                  onClick={getRandomAvatar}
                  size="sm"
                >
                  Randomize
                </RetroButton>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {avatars.map((avatar, index) => (
                  <RetroButton
                    key={index}
                    onClick={() => props.setSelectedAvatar(avatar)}
                    size="sm"
                    variant={props.selectedAvatar === avatar ? 'secondary' : 'ghost'}
                    className={`text-2xl p-2 ${
                      props.selectedAvatar === avatar ? 'border-black' : 'border-gray-600 text-gray-200'
                    }`}
                  >
                    {avatar}
                  </RetroButton>
                ))}
              </div>
            </div>

            <RetroButton
              onClick={handleContinue}
              disabled={!props.username.trim()}
              size="lg"
              className="w-full"
            >
              ENTER BATTLE
            </RetroButton>
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
    return <div className="bg-gray-100 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <SignupComponent 
        username={username} 
        selectedAvatar={selectedAvatar} 
        setSelectedAvatar={setSelectedAvatar} 
        setCurrentScreen={setCurrentScreen} 
        setUsername={setUsername} />
      </div>
  }

  return <div className="bg-gray-100 flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <RoomSelectionComponent 
        selectedAvatar={selectedAvatar} 
        username={username} 
        handleBack={handleBack} />
  </div>

}
