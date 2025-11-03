'use client';
import { ClipboardManager } from '@/app/components/ClipboardManager';
import { useUser, useFirebase } from '@/firebase';

export default function Home() {
  const { isUserLoading } = useUser();
  const { auth } = useFirebase();

  // This is a simple example of how to use the auth emulator
  // during development. This will be removed in the future.
  if (
    process.env.NODE_ENV === 'development' &&
    typeof window !== 'undefined' &&
    !auth.emulatorConfig
  ) {
    // connectAuthEmulator(auth, 'http://localhost:9099', {
    //   disableWarnings: true,
    // });
  }

  if (isUserLoading) return null;

  return (
    <main>
      <ClipboardManager />
    </main>
  );
}
