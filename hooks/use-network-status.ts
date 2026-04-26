import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export function useIsOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(state.isConnected === false);
    });

    return () => unsubscribe();
  }, []);

  return isOffline;
}
