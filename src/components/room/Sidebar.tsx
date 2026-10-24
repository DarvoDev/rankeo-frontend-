import type { ActivityEntry } from '../../types';
import styles from './Sidebar.module.css';

const timeFormat = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// La bitácora se guarda: lo de otros días lleva fecha
function when(at: number) {
  const sameDay = new Date(at).toDateString() === new Date().toDateString();
  return (sameDay ? timeFormat : dateTimeFormat).format(at);
}

/** Bitácora de la sala: quién movió, subió o eliminó qué */
export function Sidebar({ activity }: { activity: ActivityEntry[] }) {
  return (
    <aside className={styles.side}>
      <section className={styles.card}>
        <h3>Bitácora <small>{activity.length} movimientos</small></h3>
        <ol className={styles.feed}>
          {activity.map(entry => (
            <li key={entry.id}>
              <span className={styles.dot} style={{ background: entry.who.color }} />
              <span><b>{entry.who.name}</b> {entry.text}</span>
              <time dateTime={new Date(entry.at).toISOString()}>{when(entry.at)}</time>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
