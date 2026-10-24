import { Link } from 'react-router-dom';
import { DEMO_CODE } from '../../lib/demo';
import styles from './Footer.module.css';

export function Footer({ onJoin }: { onJoin: () => void }) {
  return (
    <footer className={styles.foot}>
      <a href="#como-funciona">Cómo funciona</a>
      <Link to={`/sala/${DEMO_CODE}`}>Ver ejemplo</Link>
      <button type="button" onClick={onJoin}>Unirse con código</button>
    </footer>
  );
}
