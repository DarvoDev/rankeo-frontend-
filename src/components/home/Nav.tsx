import { Link } from 'react-router-dom';
import { DEMO_CODE } from '../../lib/demo';
import { Logo } from './Logo';
import styles from './Nav.module.css';

interface Props {
  onJoin: () => void;
  onCreate: () => void;
}

export function Nav({ onJoin, onCreate }: Props) {
  return (
    <header className={styles.nav}>
      <Link className={styles.brand} to="/">
        <Logo />
        Rankeo
      </Link>
      <nav className={styles.links}>
        <a className={styles.hideSm} href="#como-funciona">Cómo funciona</a>
        <Link className={styles.hideSm} to={`/sala/${DEMO_CODE}`}>Ver ejemplo</Link>
        <button className={styles.link} onClick={onJoin}>Unirse</button>
        <button className="pill-white" onClick={onCreate}>Crear</button>
      </nav>
    </header>
  );
}
