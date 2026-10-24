import '@fontsource-variable/dm-sans/wght.css';
import '@fontsource-variable/dm-sans/wght-italic.css';
import { useEffect, useRef, useState } from 'react';
import { Footer } from '../components/home/Footer';
import { Hero } from '../components/home/Hero';
import { HowItWorks } from '../components/home/HowItWorks';
import { JoinModal } from '../components/home/JoinModal';
import { Nav } from '../components/home/Nav';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [joinOpen, setJoinOpen] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { document.title = 'Rankeo · Tier lists en grupo'; }, []);

  function focusCreate() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    titleRef.current?.focus({ preventScroll: true });
  }

  const openJoin = () => setJoinOpen(true);

  return (
    <div className={styles.landing}>
      <Nav onJoin={openJoin} onCreate={focusCreate} />
      <Hero inputRef={titleRef} onJoin={openJoin} />
      <HowItWorks />
      <Footer onJoin={openJoin} />
      {joinOpen && <JoinModal onClose={() => setJoinOpen(false)} />}
    </div>
  );
}
