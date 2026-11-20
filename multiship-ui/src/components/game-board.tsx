import { useDispatch } from 'react-redux';
import { RetroButton } from '@/components/retro-ui/RetroButton';

export const GameBoard = () => {
  const dispatch = useDispatch();

  const tryHit = (x: number, y: number) => {
    dispatch({
      type: 'ws/send',
      payload: {
        eventType: 'TRY_HIT',
        payload: { x, y },
      },
    });
  };

  return <RetroButton onClick={() => tryHit(3, 4)}>Fire</RetroButton>;
};
