import { useDispatch } from 'react-redux';

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

  return <button onClick={() => tryHit(3, 4)}>Fire</button>;
};

