import type { ActivityEntry, Presence } from '../../types';
import styles from './Sidebar.module.css';

const timeFormat = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const dateTimeFormat = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// La bitácora se guarda: lo de otros días lleva fecha
function when(at: number) {
  const sameDay = new Date(at).toDateString() === new Date().toDateString();
  return (sameDay ? timeFormat : dateTimeFormat).format(at);
}

interface Props {
  activity: ActivityEntry[];
  /** Quién está conectado ahora mismo */
  people: Presence[];
}

/** Lateral de la sala: conectados y bitácora (quién movió, subió o eliminó qué) */
export function Sidebar({ activity, people }: Props) {
  return (
    <aside className={styles.side}>
      <section className={styles.card}>
        <h3>Conectados <small>{people.length}</small></h3>
        <ul className={styles.people} aria-label="Personas conectadas">
          {people.map(p => (
            <li key={p.id}>
              <span className={styles.dot} style={{ background: p.color }} />
              <span className={styles.person}>{p.name}</span>
              {p.me && <small>tú</small>}
            </li>
          ))}
        </ul>
      </section>

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
